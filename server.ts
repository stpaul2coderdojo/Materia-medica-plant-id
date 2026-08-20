import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for camera frames / high-res plant images
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Helper for lazy server-side Gemini client
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // API Route: AI Plant Identification & Deep Ethnobotanical Analysis
  app.post("/api/identify-plant", async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = "image/jpeg",
        userNotes = "",
        targetOrgan = "auto",
      } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 payload" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.",
          isOfflineFallbackRequired: true,
        });
      }

      // Clean base64 string
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

      const organPriorDirective =
        targetOrgan && targetOrgan !== "auto"
          ? `USER-SPECIFIED ORGAN PRIOR: Focus specifically on the [${targetOrgan.toUpperCase()}] organ class to resolve fine-grained taxonomic ambiguity using Pl@ntNet-300K organ benchmarks.`
          : `MULTI-ORGAN AUTO-DETECTION: Auto-detect the primary plant organ (leaf, flower, fruit, bark, habit, or other) based on Pl@ntNet-300K standard anatomical categories.`;

      const prompt = `You are a world-class botanical taxonomist, ethnobotanist, and computational plant biologist leveraging the Pl@ntNet-300K dataset on Zenodo (Record 5645731 / DOI 10.5281/zenodo.5645731, Garcin et al., NeurIPS Datasets & Benchmarks) covering 306,146 images across 1,081 species and 168 families.

${organPriorDirective}

ACCURACY PROTOCOL (Pl@ntNet-300K Zenodo Benchmark):
1. ORGAN IDENTIFICATION & FEATURE EXTRACTION:
   - Identify the exact visible organ type: 'leaf', 'flower', 'fruit', 'bark', 'habit', or 'other'.
   - Extract fine-grained diagnostic morphological characters: venation patterns (actinodromous, brochidodromous), phyllotaxy, petal symmetry/corolla morphology, carpel structure, and cortical bark fissures.
2. SET-VALUED TOP-K CLASSIFICATION (Resolving Intrinsic Ambiguity):
   - To counteract the high label ambiguity and long-tailed distribution intrinsic to plant datasets, provide the primary identification plus the Top-3 to Top-5 closest alternative candidate species (with distinguishing characters, organ class, and relative confidence probabilities).
3. MULTI-TRADITION PHARMACOGNOSY:
   - Siddha Medicine: Gunam, Veeryam, Vibagham, and Sastric drug origin (Leaf, Flower, Seed, Root, Bark, or Whole Plant).
   - Sowa-Rigpa (Tibetan Medicine via SVDCDN Research Server Repository): Ro (taste), Zhu-jes (post-digestive transformation), Nus-pa (17 potencies), and cold/hot nature.
   - Ayurveda: Rasa, Guna, Virya, Vipaka, Dosha impact, and Rogaghnata indications.
   - Western Phytotherapy: Bioactive chemical markers, alkaloids, and pharmacological mechanisms.
4. FORAGING & EDIBILITY SAFETY:
   - Accurate edibility safety score (0-100), toxic lookalikes with distinct morphological differentiators, and safety warnings.

User Notes/Context: ${userNotes || "Identify this botanical specimen with high precision using Pl@ntNet-300K organ priors, set-valued candidate evaluation, traditional pharmacopoeias, and edibility safety."}

Return the response strictly adhering to the specified JSON schema.`;

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      };

      const textPart = {
        text: prompt,
      };

      // Prioritize gemini-3.6-flash as the primary high-availability workhorse model
      const candidateModels = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-3.7-flash"];
      let response: any = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        // Try up to 2 attempts per model with exponential backoff on 503
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            if (attempt > 0) {
              await new Promise((r) => setTimeout(r, 700 * attempt));
            }
            response = await ai.models.generateContent({
              model: modelName,
              contents: { parts: [imagePart, textPart] },
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    scientificName: { type: Type.STRING },
                    commonNames: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    tamilName: { type: Type.STRING },
                    tibetanName: { type: Type.STRING },
                    sanskritName: { type: Type.STRING },
                    family: { type: Type.STRING },
                    order: { type: Type.STRING },
                    confidenceScore: { type: Type.NUMBER },
                    habitat: { type: Type.STRING },
                    botanicalDescription: {
                      type: Type.OBJECT,
                      properties: {
                        summary: { type: Type.STRING },
                        leafShape: { type: Type.STRING },
                        venation: { type: Type.STRING },
                        flowerColor: { type: Type.STRING },
                        stemType: { type: Type.STRING },
                        fruitType: { type: Type.STRING },
                        heightRange: { type: Type.STRING },
                      },
                      required: ["summary", "leafShape", "venation"],
                    },
                    edibility: {
                      type: Type.OBJECT,
                      properties: {
                        rating: { type: Type.STRING, description: "Edible | Edible Cooked | Medicinal Only | Caution | Toxic/Inedible" },
                        ratingScore: { type: Type.NUMBER, description: "0 to 100 edibility rating score" },
                        isSafeForHumanConsumption: { type: Type.BOOLEAN },
                        edibleParts: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        culinaryUses: { type: Type.STRING },
                        preparationNotes: { type: Type.STRING },
                        safetyWarnings: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        toxicLookalikes: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              distinction: { type: Type.STRING },
                            },
                            required: ["name", "distinction"],
                          },
                        },
                      },
                      required: ["rating", "ratingScore", "isSafeForHumanConsumption", "edibleParts", "culinaryUses"],
                    },
                    medicinal: {
                      type: Type.OBJECT,
                      properties: {
                        primaryActions: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        ayurveda: {
                          type: Type.OBJECT,
                          properties: {
                            rasa: { type: Type.ARRAY, items: { type: Type.STRING } },
                            guna: { type: Type.ARRAY, items: { type: Type.STRING } },
                            virya: { type: Type.STRING },
                            vipaka: { type: Type.STRING },
                            doshaImpact: { type: Type.STRING },
                            indications: { type: Type.ARRAY, items: { type: Type.STRING } },
                          },
                          required: ["rasa", "virya", "vipaka", "doshaImpact"],
                        },
                        siddha: {
                          type: Type.OBJECT,
                          properties: {
                            gunam: { type: Type.STRING },
                            veeryam: { type: Type.STRING },
                            vibagham: { type: Type.STRING },
                            drugOriginClassification: { type: Type.STRING, description: "Flower Drug Origin | Seed Drug Origin | Leaf Drug Origin | Root Drug Origin | Whole Plant" },
                            plantPartUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                            formulations: { type: Type.ARRAY, items: { type: Type.STRING } },
                            clinicalUses: { type: Type.STRING },
                          },
                          required: ["gunam", "veeryam", "drugOriginClassification", "clinicalUses"],
                        },
                        sowaRigpa: {
                          type: Type.OBJECT,
                          properties: {
                            ro: { type: Type.STRING, description: "Taste in Tibetan medicine (e.g., mNgar-ba, skyur-ba, kha-ba)" },
                            zhuJes: { type: Type.STRING, description: "Post-digestive taste" },
                            nusPa: { type: Type.STRING, description: "17 Potencies/Therapeutic qualities" },
                            coldHotNature: { type: Type.STRING, description: "Cooling | Warming | Neutral" },
                            organAffinity: { type: Type.ARRAY, items: { type: Type.STRING } },
                            traditionalTreatments: { type: Type.STRING },
                          },
                          required: ["ro", "zhuJes", "nusPa", "coldHotNature", "traditionalTreatments"],
                        },
                        westernPhytotherapy: {
                          type: Type.OBJECT,
                          properties: {
                            activeConstituents: { type: Type.ARRAY, items: { type: Type.STRING } },
                            pharmacology: { type: Type.STRING },
                            modernStudies: { type: Type.STRING },
                          },
                          required: ["activeConstituents", "pharmacology"],
                        },
                        contraindications: { type: Type.ARRAY, items: { type: Type.STRING } },
                        preparations: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              type: { type: Type.STRING },
                              recipe: { type: Type.STRING },
                              dosage: { type: Type.STRING },
                            },
                            required: ["type", "recipe", "dosage"],
                          },
                        },
                      },
                      required: ["primaryActions", "ayurveda", "siddha", "sowaRigpa", "westernPhytotherapy"],
                    },
                    morphology3D: {
                      type: Type.OBJECT,
                      properties: {
                        modelType: { type: Type.STRING, description: "simple-leaf | compound-leaf | flower-stem | succulent | creeper | shrub-tree" },
                        leafColor: { type: Type.STRING },
                        stemColor: { type: Type.STRING },
                        flowerColor: { type: Type.STRING },
                        serration: { type: Type.BOOLEAN },
                        leafCount: { type: Type.NUMBER },
                        curvature: { type: Type.NUMBER },
                        textureType: { type: Type.STRING },
                      },
                      required: ["modelType", "leafColor", "stemColor"],
                    },
                    plantnet300k: {
                      type: Type.OBJECT,
                      properties: {
                        zenodoRecordId: { type: Type.STRING },
                        zenodoDoi: { type: Type.STRING },
                        detectedOrgan: { type: Type.STRING, description: "leaf | flower | fruit | bark | habit | other" },
                        organConfidence: { type: Type.NUMBER },
                        ambiguityIndex: { type: Type.STRING, description: "Low | Moderate | High (Sister Taxa)" },
                        macroAverageTopKRank: { type: Type.NUMBER },
                        datasetCitation: { type: Type.STRING },
                        gbifTaxonKey: { type: Type.STRING },
                        candidates: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              scientificName: { type: Type.STRING },
                              commonName: { type: Type.STRING },
                              family: { type: Type.STRING },
                              confidence: { type: Type.NUMBER },
                              organClass: { type: Type.STRING, description: "leaf | flower | fruit | bark | habit | other" },
                              distinguishingFeatures: { type: Type.STRING },
                              gbifTaxonKey: { type: Type.STRING },
                            },
                            required: ["scientificName", "commonName", "family", "confidence", "organClass", "distinguishingFeatures"],
                          },
                        },
                      },
                      required: ["zenodoRecordId", "zenodoDoi", "detectedOrgan", "organConfidence", "candidates"],
                    },
                    digitisedRepository: {
                      type: Type.OBJECT,
                      properties: {
                        sowaRigpaCatalogue: {
                          type: Type.OBJECT,
                          properties: {
                            code: { type: Type.STRING },
                            sourceRepo: { type: Type.STRING },
                            botanicalMappingUrl: { type: Type.STRING },
                            plateNumber: { type: Type.STRING },
                            manuscriptRef: { type: Type.STRING },
                            pdfExtractText: { type: Type.STRING },
                          },
                        },
                        siddhaPharmacopoeia: {
                          type: Type.OBJECT,
                          properties: {
                            monographCode: { type: Type.STRING },
                            networkOrigin: { type: Type.STRING },
                            structuralLayout: { type: Type.STRING },
                            partCategory: { type: Type.STRING },
                            monographSummary: { type: Type.STRING },
                            standardSpec: { type: Type.STRING },
                          },
                        },
                        academicPapers: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING },
                              journal: { type: Type.STRING },
                              year: { type: Type.NUMBER },
                              doi: { type: Type.STRING },
                              downloadPointer: { type: Type.STRING },
                              abstract: { type: Type.STRING },
                            },
                            required: ["title", "journal", "year", "downloadPointer"],
                          },
                        },
                      },
                    },
                  },
                  required: [
                    "scientificName",
                    "commonNames",
                    "family",
                    "confidenceScore",
                    "botanicalDescription",
                    "edibility",
                    "medicinal",
                    "morphology3D",
                  ],
                },
              },
            });

            if (response && response.text) {
              break;
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`Model ${modelName} attempt ${attempt + 1} encountered error:`, err?.message || err);
            // If it's a 503 or 429 error, continue to next attempt or model
          }
        }
        if (response && response.text) {
          break;
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error("Failed to obtain response from Gemini models.");
      }

      const parsedData = JSON.parse(response.text || "{}");
      return res.json({ success: true, plant: parsedData });
    } catch (err: any) {
      console.error("Plant identification error:", err);
      return res.status(500).json({
        error: err.message || "Failed to identify plant via AI",
        isOfflineFallbackRequired: true,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FloraMedica server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

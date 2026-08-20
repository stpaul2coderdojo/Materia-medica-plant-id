export type EdibilityRating =
  | "Edible"
  | "Edible Cooked"
  | "Medicinal Only"
  | "Caution"
  | "Toxic/Inedible";

export interface ToxicLookalike {
  name: string;
  distinction: string;
  hazard?: string;
}

export interface EdibilityInfo {
  rating: EdibilityRating;
  ratingScore: number; // 0 - 100
  isSafeForHumanConsumption: boolean;
  edibleParts: string[];
  culinaryUses: string;
  preparationNotes: string;
  safetyWarnings: string[];
  toxicLookalikes: ToxicLookalike[];
}

export interface AyurvedaProfile {
  rasa: string[]; // Tastes (Madhura, Amla, Lavana, Tikta, Katu, Kashaya)
  guna: string[]; // Qualities (Laghu, Guru, Snigdha, Ruksha, Tikshna)
  virya: string; // Potency (Ushna - hot / Shita - cold)
  vipaka: string; // Post-digestive taste (Madhura, Amla, Katu)
  doshaImpact: string; // e.g. "Pacifies Vata and Kapha, balances Pitta"
  indications: string[];
}

export interface SiddhaProfile {
  gunam: string; // Character / Properties
  veeryam: string; // Potency (Seetha - Cold / Veppam - Hot)
  vibagham: string; // Transformation / Post-digestion
  drugOriginClassification:
    | "Flower Drug Origin"
    | "Seed Drug Origin"
    | "Leaf Drug Origin"
    | "Root Drug Origin"
    | "Bark Drug Origin"
    | "Whole Plant";
  plantPartUsed: string[];
  formulations: string[];
  clinicalUses: string;
}

export interface SowaRigpaProfile {
  ro: string; // Taste (Ro-drug: Kha-ba bitter, mNgar-ba sweet, etc.)
  zhuJes: string; // Post-digestive taste (Zhu-rjes)
  nusPa: string; // 17 Potencies (Nus-pa bcu-bdun)
  coldHotNature: "Cooling" | "Warming" | "Neutral";
  organAffinity: string[];
  traditionalTreatments: string;
}

export interface WesternPhytotherapy {
  activeConstituents: string[];
  pharmacology: string;
  modernStudies: string;
}

export interface PlantPreparation {
  type: string; // "Decoction (Kashayam)", "Paste (Poultice)", "Infused Oil", "Tea", "Powder (Churna)"
  recipe: string;
  dosage: string;
  safetyNote?: string;
}

export interface MedicinalInfo {
  primaryActions: string[];
  ayurveda: AyurvedaProfile;
  siddha: SiddhaProfile;
  sowaRigpa: SowaRigpaProfile;
  westernPhytotherapy: WesternPhytotherapy;
  contraindications: string[];
  preparations: PlantPreparation[];
}

export interface Morphology3D {
  modelType:
    | "simple-leaf"
    | "compound-leaf"
    | "flower-stem"
    | "succulent"
    | "creeper"
    | "shrub-tree";
  leafColor: string;
  stemColor: string;
  flowerColor?: string;
  serration: boolean;
  leafCount: number;
  curvature: number;
  textureType?: "glossy" | "matte" | "pubescent" | "coriaceous";
  leafApex?: "acute" | "acuminate" | "obtuse" | "rounded";
  leafBase?: "cuneate" | "cordate" | "attenuate" | "rounded";
  venationPattern?: "pinnate" | "palmate" | "parallel" | "reticulate";
}

export interface BotanicalDescription {
  summary: string;
  leafShape: string;
  venation: string;
  flowerColor: string;
  stemType: string;
  fruitType: string;
  heightRange: string;
}

export interface AcademicPaper {
  title: string;
  journal: string;
  year: number;
  doi: string;
  downloadPointer: string;
  abstract: string;
}

export type PlantNetOrgan = "leaf" | "flower" | "fruit" | "bark" | "habit" | "other";

export interface PlantNetCandidate {
  scientificName: string;
  commonName: string;
  family: string;
  confidence: number;
  organClass: PlantNetOrgan;
  distinguishingFeatures: string;
  gbifTaxonKey?: string;
  isMatchingSpecies?: boolean;
}

export interface PlantNet300KBenchmark {
  zenodoRecordId: string; // "5645731"
  zenodoDoi: string; // "10.5281/zenodo.5645731"
  detectedOrgan: PlantNetOrgan;
  organConfidence: number; // 0.0 to 1.0
  ambiguityIndex: "Low" | "Moderate" | "High (Sister Taxa)";
  macroAverageTopKRank: number; // 1 to 5
  candidates: PlantNetCandidate[];
  datasetCitation: string;
  gbifTaxonKey?: string;
}

export interface DigitisedRepository {
  sowaRigpaCatalogue?: {
    code: string;
    sourceRepo: string; // e.g. "SVDCDN Research Server Repository"
    botanicalMappingUrl: string;
    plateNumber: string;
    manuscriptRef: string;
    pdfExtractText: string;
  };
  siddhaPharmacopoeia?: {
    monographCode: string;
    networkOrigin: string; // e.g. "Pharma Research Online Network"
    structuralLayout: string; // e.g. "Flower and Seed Drug Origins"
    partCategory: string;
    monographSummary: string;
    standardSpec: string;
  };
  academicPapers: AcademicPaper[];
  plantnet300kCitation?: {
    zenodoRecord: string;
    doi: string;
    datasetTitle: string;
    neuripsYear: number;
    organClassificationStandard: string;
  };
}

export interface PlantData {
  id: string;
  scientificName: string;
  commonNames: string[];
  tamilName?: string;
  tibetanName?: string;
  sanskritName?: string;
  family: string;
  order?: string;
  confidenceScore?: number;
  habitat: string;
  imageUrl?: string;
  botanicalDescription: BotanicalDescription;
  edibility: EdibilityInfo;
  medicinal: MedicinalInfo;
  morphology3D: Morphology3D;
  digitisedRepository: DigitisedRepository;
  plantnet300k?: PlantNet300KBenchmark;
  tags: string[];
  isCustomEntry?: boolean;
  discoveredDate?: string;
  fieldNotes?: string;
}

export interface SavedHerbariumItem {
  id: string;
  plant: PlantData;
  capturedImage?: string;
  timestamp: number;
  userNotes: string;
  location?: string;
}

export type ActiveTab =
  | "scanner"
  | "dossier"
  | "3dview"
  | "repository"
  | "herbarium"
  | "key-explorer";

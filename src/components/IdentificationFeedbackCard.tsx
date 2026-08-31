import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  Database,
  Layers,
  FileCheck,
  RotateCcw,
  Download,
  Info,
  Check,
  Send,
  Sliders,
  Tag,
  BookOpen,
} from "lucide-react";
import {
  PlantData,
  IdentificationFeedback,
  FeedbackDecision,
  PlantNetOrgan,
  MorphologicalVerification,
} from "../types";
import { PlantService, FULL_BOTANICAL_DATABASE } from "../services/plantService";

interface IdentificationFeedbackCardProps {
  plant: PlantData;
  onFeedbackSubmitted?: (feedback: IdentificationFeedback) => void;
  onOpenTrainingHub?: () => void;
}

export const IdentificationFeedbackCard: React.FC<IdentificationFeedbackCardProps> = ({
  plant,
  onFeedbackSubmitted,
  onOpenTrainingHub,
}) => {
  const [existingFeedback, setExistingFeedback] = useState<IdentificationFeedback | undefined>(
    () => PlantService.getFeedbackForPlant(plant.id)
  );

  const [activeMode, setActiveMode] = useState<"view" | "confirm" | "correct" | "uncertain">("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State for Correction
  const [correctedScientificName, setCorrectedScientificName] = useState("");
  const [correctedCommonName, setCorrectedCommonName] = useState("");
  const [correctedFamily, setCorrectedFamily] = useState("");
  const [correctedOrgan, setCorrectedOrgan] = useState<PlantNetOrgan>("leaf");
  const [correctionReason, setCorrectionReason] = useState("Leaf venation & morphology differs");
  const [expertNotes, setExpertNotes] = useState("");
  const [taxaSearchQuery, setTaxaSearchQuery] = useState("");
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState<number | null>(null);

  // Morphological verification checks
  const [morphologyChecks, setMorphologyChecks] = useState<MorphologicalVerification>({
    leafShapeMatch: true,
    venationMatch: true,
    flowerColorMatch: true,
    marginMatch: true,
    stemMatch: true,
  });

  // Sync state when plant changes or custom events fire
  useEffect(() => {
    const fb = PlantService.getFeedbackForPlant(plant.id);
    setExistingFeedback(fb);
    setActiveMode(fb ? "view" : "view");
  }, [plant.id]);

  useEffect(() => {
    const handleFeedbackUpdate = () => {
      const fb = PlantService.getFeedbackForPlant(plant.id);
      setExistingFeedback(fb);
    };
    window.addEventListener("floramedica-feedback-updated", handleFeedbackUpdate);
    return () => {
      window.removeEventListener("floramedica-feedback-updated", handleFeedbackUpdate);
    };
  }, [plant.id]);

  // Handle Quick Confirm (Positive Reinforcement)
  const handleQuickConfirm = async () => {
    setIsSubmitting(true);
    try {
      const fb = await PlantService.logFeedback({
        plantId: plant.id,
        originalIdentification: {
          scientificName: plant.scientificName,
          commonName: plant.commonNames[0] || "Botanical Specimen",
          family: plant.family,
          confidenceScore: plant.confidenceScore,
          detectedOrgan: plant.plantnet300k?.detectedOrgan || "leaf",
        },
        userDecision: "confirmed_correct",
        morphologyVerification: morphologyChecks,
        userNotes: expertNotes || "Morphological verification confirmed by user.",
        imageSnippet: plant.imageUrl,
      });

      setExistingFeedback(fb);
      setActiveMode("view");
      setSuccessToast("Identification confirmed & logged to model training dataset!");
      if (onFeedbackSubmitted) onFeedbackSubmitted(fb);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.warn("Failed to confirm feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Submit Correction
  const handleSubmitCorrection = async () => {
    if (!correctedScientificName.trim()) {
      alert("Please provide the corrected scientific binomial name or select a candidate.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fb = await PlantService.logFeedback({
        plantId: plant.id,
        originalIdentification: {
          scientificName: plant.scientificName,
          commonName: plant.commonNames[0] || "Botanical Specimen",
          family: plant.family,
          confidenceScore: plant.confidenceScore,
          detectedOrgan: plant.plantnet300k?.detectedOrgan || "leaf",
        },
        userDecision: "corrected",
        correctedData: {
          scientificName: correctedScientificName.trim(),
          commonName: correctedCommonName.trim() || undefined,
          family: correctedFamily.trim() || undefined,
          organ: correctedOrgan,
          correctionReason: correctionReason,
          botanicalNotes: expertNotes.trim() || undefined,
          matchedCandidateIndex: selectedCandidateIdx !== null ? selectedCandidateIdx : undefined,
        },
        morphologyVerification: morphologyChecks,
        userNotes: expertNotes,
        imageSnippet: plant.imageUrl,
      });

      setExistingFeedback(fb);
      setActiveMode("view");
      setSuccessToast(`Correction logged: Corrected to "${correctedScientificName}". Training dataset updated!`);
      if (onFeedbackSubmitted) onFeedbackSubmitted(fb);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.warn("Failed to submit correction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Flag as Uncertain
  const handleFlagUncertain = async () => {
    setIsSubmitting(true);
    try {
      const fb = await PlantService.logFeedback({
        plantId: plant.id,
        originalIdentification: {
          scientificName: plant.scientificName,
          commonName: plant.commonNames[0] || "Botanical Specimen",
          family: plant.family,
          confidenceScore: plant.confidenceScore,
          detectedOrgan: plant.plantnet300k?.detectedOrgan || "leaf",
        },
        userDecision: "uncertain",
        userNotes: expertNotes || "Flagged for botanical herbarium & microscopic verification.",
        imageSnippet: plant.imageUrl,
      });

      setExistingFeedback(fb);
      setActiveMode("view");
      setSuccessToast("Specimen flagged as uncertain for expert herbarium review.");
      if (onFeedbackSubmitted) onFeedbackSubmitted(fb);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.warn("Failed to flag feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Undo / Delete Feedback
  const handleRemoveFeedback = async () => {
    if (existingFeedback) {
      await PlantService.deleteFeedback(existingFeedback.id, plant.id);
      setExistingFeedback(undefined);
      setActiveMode("view");
      setSuccessToast("Feedback reset.");
      setTimeout(() => setSuccessToast(null), 2500);
    }
  };

  // Filter offline database taxa for correction suggestions
  const matchingTaxa = taxaSearchQuery.trim()
    ? FULL_BOTANICAL_DATABASE.filter(
        (p) =>
          p.scientificName.toLowerCase().includes(taxaSearchQuery.toLowerCase()) ||
          p.commonNames.some((c) => c.toLowerCase().includes(taxaSearchQuery.toLowerCase())) ||
          p.family.toLowerCase().includes(taxaSearchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const candidates = plant.plantnet300k?.candidates || [];

  return (
    <div
      id="identification-feedback-panel"
      className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 sm:p-6 shadow-xl flex flex-col gap-4 relative overflow-hidden"
    >
      {/* Background visual highlight */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D3748] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-white">
                Taxonomic Verification & Model Feedback
              </h3>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-[#1A2220] text-emerald-400 border border-[#2D3748]">
                Dataset Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Confirm or correct this result to train and fine-tune identification accuracy
            </p>
          </div>
        </div>

        {/* Training Hub Quick Link */}
        {onOpenTrainingHub && (
          <button
            onClick={onOpenTrainingHub}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-tight text-slate-300 hover:text-white bg-[#1A2220] hover:bg-[#242f2c] border border-[#2D3748] rounded-sm transition-all self-start sm:self-auto cursor-pointer"
            title="View Model Metrics & Export Fine-Tuning Dataset"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Training Hub</span>
          </button>
        )}
      </div>

      {/* Success Toast Alert */}
      {successToast && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-600/60 text-emerald-200 text-xs rounded-sm flex items-center justify-between gap-2 font-mono animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* State A: Feedback Already Logged */}
      {existingFeedback && activeMode === "view" && (
        <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {existingFeedback.userDecision === "confirmed_correct" && (
                <span className="px-2.5 py-1 rounded-sm bg-emerald-950/50 border border-emerald-700/70 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Validated: Correct Ground Truth
                </span>
              )}
              {existingFeedback.userDecision === "corrected" && (
                <span className="px-2.5 py-1 rounded-sm bg-amber-950/50 border border-amber-700/70 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Taxonomically Corrected
                </span>
              )}
              {existingFeedback.userDecision === "uncertain" && (
                <span className="px-2.5 py-1 rounded-sm bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  Flagged for Expert Review
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(existingFeedback.timestamp).toLocaleDateString()} at{" "}
                {new Date(existingFeedback.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveMode("correct")}
                className="text-xs font-bold uppercase tracking-tight text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer"
              >
                Modify
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={handleRemoveFeedback}
                className="text-xs font-bold uppercase tracking-tight text-rose-400 hover:text-rose-300 underline font-mono cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Details of Correction if applicable */}
          {existingFeedback.userDecision === "corrected" && existingFeedback.correctedData && (
            <div className="p-3 bg-[#161C1A] border border-[#2D3748] rounded-sm text-xs font-mono flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span>Original Model Output:</span>
                <span className="text-rose-300 line-through">
                  {existingFeedback.originalIdentification.scientificName}
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Verified Ground Truth:</span>
                <span>{existingFeedback.correctedData.scientificName}</span>
              </div>
              {existingFeedback.correctedData.correctionReason && (
                <div className="text-[11px] text-slate-300 mt-1 border-t border-[#2D3748] pt-1">
                  <strong className="text-amber-400">Reason:</strong> {existingFeedback.correctedData.correctionReason}
                </div>
              )}
            </div>
          )}

          {existingFeedback.userNotes && (
            <p className="text-xs text-slate-300 italic font-mono bg-[#161C1A] p-2.5 rounded-sm border border-[#2D3748]">
              "{existingFeedback.userNotes}"
            </p>
          )}

          {/* Training Payload Notice */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span className="flex items-center gap-1 text-emerald-400/90">
              <Sparkles className="w-3 h-3" /> Ready for JSONL model retraining pipeline
            </span>
            <button
              onClick={() => PlantService.downloadTrainingDataset("jsonl")}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline cursor-pointer"
            >
              <Download className="w-3 h-3" /> Export JSONL
            </button>
          </div>
        </div>
      )}

      {/* State B: No Feedback Yet or Mode Selected */}
      {(!existingFeedback || activeMode !== "view") && (
        <div className="flex flex-col gap-4">
          {/* Main Action Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Confirm Correct */}
            <button
              id="confirm-identification-btn"
              onClick={() => {
                if (activeMode === "confirm") {
                  handleQuickConfirm();
                } else {
                  setActiveMode("confirm");
                }
              }}
              disabled={isSubmitting}
              className={`p-3.5 rounded-sm border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                activeMode === "confirm"
                  ? "bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500"
                  : "bg-[#1A2220] hover:bg-[#222c29] border-[#2D3748] hover:border-emerald-500/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-tight text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Correct Specimen
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs bg-emerald-950 border border-emerald-800 text-emerald-400">
                  +1 Accuracy
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                The identification is accurate for this botanical taxon.
              </p>
            </button>

            {/* 2. Suggest / Apply Correction */}
            <button
              id="correct-identification-btn"
              onClick={() => {
                setActiveMode("correct");
                if (candidates.length > 0 && !correctedScientificName) {
                  setCorrectedScientificName(candidates[0].scientificName);
                  setCorrectedFamily(candidates[0].family);
                  setCorrectedCommonName(candidates[0].commonName);
                }
              }}
              disabled={isSubmitting}
              className={`p-3.5 rounded-sm border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                activeMode === "correct"
                  ? "bg-amber-950/40 border-amber-500 ring-1 ring-amber-500"
                  : "bg-[#1A2220] hover:bg-[#222c29] border-[#2D3748] hover:border-amber-500/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-tight text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Correct Taxon
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs bg-amber-950 border border-amber-800 text-amber-400">
                  Fine-Tune
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Change to sister species, top candidate, or enter correct taxon.
              </p>
            </button>

            {/* 3. Flag Uncertain */}
            <button
              id="flag-uncertain-btn"
              onClick={() => {
                if (activeMode === "uncertain") {
                  handleFlagUncertain();
                } else {
                  setActiveMode("uncertain");
                }
              }}
              disabled={isSubmitting}
              className={`p-3.5 rounded-sm border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                activeMode === "uncertain"
                  ? "bg-slate-900 border-slate-400 ring-1 ring-slate-400"
                  : "bg-[#1A2220] hover:bg-[#222c29] border-[#2D3748] hover:border-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-tight text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  Uncertain / Ambiguous
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs bg-slate-950 border border-slate-700 text-slate-400">
                  Survey Flag
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Specimen requires herbarium dissection or microscopy.
              </p>
            </button>
          </div>

          {/* Sub-Panel: Confirmation Workflow */}
          {activeMode === "confirm" && (
            <div className="p-4 rounded-sm bg-[#0F1412] border border-emerald-500/40 flex flex-col gap-3.5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#2D3748] pb-2">
                <span className="text-xs font-bold uppercase font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Diagnostic Verification for {plant.scientificName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Optional Checks</span>
              </div>

              {/* Morphology verification checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-sm bg-[#161C1A] border border-[#2D3748] cursor-pointer hover:border-emerald-500/40">
                  <input
                    type="checkbox"
                    checked={morphologyChecks.leafShapeMatch}
                    onChange={(e) =>
                      setMorphologyChecks({ ...morphologyChecks, leafShapeMatch: e.target.checked })
                    }
                    className="accent-emerald-500 rounded-xs"
                  />
                  <span className="text-slate-300 text-[11px]">Leaf Shape Valid</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-sm bg-[#161C1A] border border-[#2D3748] cursor-pointer hover:border-emerald-500/40">
                  <input
                    type="checkbox"
                    checked={morphologyChecks.venationMatch}
                    onChange={(e) =>
                      setMorphologyChecks({ ...morphologyChecks, venationMatch: e.target.checked })
                    }
                    className="accent-emerald-500 rounded-xs"
                  />
                  <span className="text-slate-300 text-[11px]">Venation Valid</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-sm bg-[#161C1A] border border-[#2D3748] cursor-pointer hover:border-emerald-500/40">
                  <input
                    type="checkbox"
                    checked={morphologyChecks.flowerColorMatch}
                    onChange={(e) =>
                      setMorphologyChecks({ ...morphologyChecks, flowerColorMatch: e.target.checked })
                    }
                    className="accent-emerald-500 rounded-xs"
                  />
                  <span className="text-slate-300 text-[11px]">Corolla / Flower Valid</span>
                </label>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Taxonomist Notes (Optional)
                </label>
                <input
                  type="text"
                  value={expertNotes}
                  onChange={(e) => setExpertNotes(e.target.value)}
                  placeholder="e.g., Consistent with Western Ghats wild population variant"
                  className="w-full px-3 py-2 text-xs bg-[#161C1A] border border-[#2D3748] rounded-sm text-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveMode("view")}
                  className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickConfirm}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-tight text-xs shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Submit Positive Confirmation</span>
                </button>
              </div>
            </div>
          )}

          {/* Sub-Panel: Correction Workflow */}
          {activeMode === "correct" && (
            <div className="p-4 rounded-sm bg-[#0F1412] border border-amber-500/50 flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#2D3748] pb-2">
                <span className="text-xs font-bold uppercase font-mono text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Taxonomic Ground Truth Correction
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Fine-Tuning Dataset</span>
              </div>

              {/* 1. Quick Candidates from Pl@ntNet-300K Benchmark */}
              {candidates.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                    Top Alternative Candidates (Pl@ntNet-300K Prior):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {candidates.map((cand, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedCandidateIdx(idx);
                          setCorrectedScientificName(cand.scientificName);
                          setCorrectedCommonName(cand.commonName);
                          setCorrectedFamily(cand.family);
                          setCorrectedOrgan(cand.organClass || "leaf");
                        }}
                        className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer ${
                          correctedScientificName === cand.scientificName
                            ? "bg-amber-950/60 border-amber-500 ring-1 ring-amber-500"
                            : "bg-[#161C1A] hover:bg-[#202926] border-[#2D3748]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white italic">{cand.scientificName}</span>
                          <span className="text-[10px] font-mono text-amber-400 font-bold">
                            {Math.round(cand.confidence * 100)}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
                          <span>{cand.commonName}</span>
                          <span className="text-[10px] font-mono uppercase text-emerald-400">
                            {cand.organClass}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Search Database Taxonomy */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Search 42,000+ Botanical Database Species
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={taxaSearchQuery}
                    onChange={(e) => setTaxaSearchQuery(e.target.value)}
                    placeholder="Search scientific binomial, Tamil, Sanskrit, or common name..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#161C1A] border border-[#2D3748] rounded-sm text-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>

                {matchingTaxa.length > 0 && (
                  <div className="mt-1.5 flex flex-col gap-1 p-1 bg-[#161C1A] border border-[#2D3748] rounded-sm max-h-40 overflow-y-auto">
                    {matchingTaxa.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setCorrectedScientificName(t.scientificName);
                          setCorrectedCommonName(t.commonNames[0] || "");
                          setCorrectedFamily(t.family);
                          setTaxaSearchQuery("");
                        }}
                        className="text-left px-2.5 py-1.5 text-xs hover:bg-[#202926] rounded-xs flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-slate-200 italic">{t.scientificName}</span>
                          <span className="text-slate-400 text-[11px] ml-2">({t.commonNames[0]})</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">{t.family}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Explicit Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Correct Scientific Binomial <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={correctedScientificName}
                    onChange={(e) => setCorrectedScientificName(e.target.value)}
                    placeholder="e.g. Bacopa monnieri"
                    className="w-full px-3 py-2 text-xs bg-[#161C1A] border border-[#2D3748] rounded-sm text-amber-200 font-serif italic focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Family
                  </label>
                  <input
                    type="text"
                    value={correctedFamily}
                    onChange={(e) => setCorrectedFamily(e.target.value)}
                    placeholder="e.g. Plantaginaceae"
                    className="w-full px-3 py-2 text-xs bg-[#161C1A] border border-[#2D3748] rounded-sm text-slate-200 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Common Name
                  </label>
                  <input
                    type="text"
                    value={correctedCommonName}
                    onChange={(e) => setCorrectedCommonName(e.target.value)}
                    placeholder="e.g. Water Hyssop / Brahmi"
                    className="w-full px-3 py-2 text-xs bg-[#161C1A] border border-[#2D3748] rounded-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Target Organ
                  </label>
                  <select
                    value={correctedOrgan}
                    onChange={(e) => setCorrectedOrgan(e.target.value as PlantNetOrgan)}
                    className="w-full px-3 py-2 text-xs bg-[#161C1A] border border-[#2D3748] rounded-sm text-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
                  >
                    <option value="leaf">Leaf (Foliage)</option>
                    <option value="flower">Flower (Inflorescence)</option>
                    <option value="fruit">Fruit / Seed</option>
                    <option value="bark">Bark / Stem</option>
                    <option value="habit">Habit (Whole Plant)</option>
                    <option value="other">Other Organ</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Correction Reason
                  </label>
                  <select
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#161C1A] border border-[#2D3748] rounded-sm text-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
                  >
                    <option value="Leaf venation & morphology differs">Leaf venation & morphology differs</option>
                    <option value="Flower petal symmetry differs">Flower petal symmetry differs</option>
                    <option value="Misidentified sister species (congeneric)">Misidentified sister species (congeneric)</option>
                    <option value="Toxic lookalike differential distinction">Toxic lookalike differential distinction</option>
                    <option value="Regional cultivar / chemotype variation">Regional cultivar / chemotype variation</option>
                    <option value="Bark/Stem anatomical structure differs">Bark/Stem anatomical structure differs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Botanical & Taxonomic Notes for Model Fine-Tuning
                </label>
                <textarea
                  rows={2}
                  value={expertNotes}
                  onChange={(e) => setExpertNotes(e.target.value)}
                  placeholder="Explain diagnostic differences for fine-tuning loss computation..."
                  className="w-full px-3 py-2 text-xs bg-[#161C1A] border border-[#2D3748] rounded-sm text-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveMode("view")}
                  className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCorrection}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-tight text-xs shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Correction & Update Ground Truth</span>
                </button>
              </div>
            </div>
          )}

          {/* Sub-Panel: Uncertain Workflow */}
          {activeMode === "uncertain" && (
            <div className="p-4 rounded-sm bg-[#0F1412] border border-slate-600 flex flex-col gap-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#2D3748] pb-2">
                <span className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  Flag Specimen for Microscopic / Herbarium Analysis
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Specimen will be marked with ambiguity flags in the survey ledger. This helps model trainers identify difficult long-tailed taxa requiring higher-resolution imaging.
              </p>
              <div>
                <input
                  type="text"
                  value={expertNotes}
                  onChange={(e) => setExpertNotes(e.target.value)}
                  placeholder="Reason for ambiguity (e.g. Juvenile leaf stage, missing floral organs)"
                  className="w-full px-3 py-2 text-xs bg-[#161C1A] border border-[#2D3748] rounded-sm text-slate-200 focus:outline-hidden font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMode("view")}
                  className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFlagUncertain}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-sm bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-tight text-xs cursor-pointer"
                >
                  Confirm Ambiguity Flag
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

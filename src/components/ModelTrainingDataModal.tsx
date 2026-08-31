import React, { useState, useEffect } from "react";
import {
  Database,
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  Layers,
  Sparkles,
  RefreshCw,
  Trash2,
  FileText,
  FileCode,
  Sliders,
  X,
  ExternalLink,
  Terminal,
  Cpu,
  Search,
  Check,
} from "lucide-react";
import { IdentificationFeedback, FeedbackStats } from "../types";
import { PlantService } from "../services/plantService";

interface ModelTrainingDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlantFeedback?: (plantId: string) => void;
}

export const ModelTrainingDataModal: React.FC<ModelTrainingDataModalProps> = ({
  isOpen,
  onClose,
  onSelectPlantFeedback,
}) => {
  const [feedbackList, setFeedbackList] = useState<IdentificationFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    total: 0,
    confirmed: 0,
    corrected: 0,
    uncertain: 0,
    accuracyRate: 100,
    organBreakdown: {},
    topMisidentified: [],
  });
  const [filterType, setFilterType] = useState<"all" | "confirmed_correct" | "corrected" | "uncertain">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ledger" | "analytics" | "finetune_guide">("ledger");
  const [copiedScript, setCopiedScript] = useState(false);

  const refreshData = () => {
    const list = PlantService.getFeedbackList();
    setFeedbackList(list);
    setStats(PlantService.getFeedbackStats());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredList = feedbackList.filter((item) => {
    if (filterType !== "all" && item.userDecision !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrig = item.originalIdentification.scientificName.toLowerCase().includes(q);
      const matchCorr = item.correctedData?.scientificName.toLowerCase().includes(q);
      const matchNotes = item.userNotes?.toLowerCase().includes(q);
      return matchOrig || matchCorr || matchNotes;
    }
    return true;
  });

  const handleDeleteItem = async (id: string, plantId: string) => {
    if (window.confirm("Remove this feedback specimen from training repository?")) {
      await PlantService.deleteFeedback(id, plantId);
      refreshData();
    }
  };

  const copyFineTuningCli = () => {
    const script = `# FloraMedica Model Retraining Pipeline (Pl@ntNet-300K Benchmark Calibration)
# Step 1: Export verified dataset
curl -X GET "https://floramedica.app/api/feedback/export?format=jsonl" -o floramedica_dataset.jsonl

# Step 2: Prepare Gemini Vision / Vision Transformer Fine-Tuning Job
gcloud ai vision-models fine-tune \\
  --dataset=floramedica_dataset.jsonl \\
  --organ-priors=leaf,flower,fruit,bark,habit \\
  --base-model=gemini-3.7-flash \\
  --output-dir=./weights/floramedica_v4.2/

# Step 3: Evaluate on Pl@ntNet-300K Zenodo Benchmark (Record 5645731)
python evaluate_benchmark.py --weights ./weights/floramedica_v4.2/ --topk=5
`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121715] border border-[#2D3748] rounded-sm max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#E2E8F0]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#161C1A] border-b border-[#2D3748] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white">
                  Model Retraining & Taxonomic Feedback Hub
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-[#1A2220] text-emerald-400 border border-[#2D3748]">
                  Pl@ntNet-300K Prior
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Telemetry, verified ground-truth labels, and AI fine-tuning datasets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-[#1A2220] hover:bg-[#242f2c] text-slate-400 hover:text-white border border-[#2D3748] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Quick Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[#0D1210] border-b border-[#2D3748]">
          <div className="p-3 bg-[#161C1A] border border-[#2D3748] rounded-sm flex flex-col">
            <span className="text-[10px] font-mono uppercase text-slate-400">Total Validations</span>
            <span className="text-xl font-bold font-mono text-white">{stats.total}</span>
          </div>

          <div className="p-3 bg-[#161C1A] border border-[#2D3748] rounded-sm flex flex-col">
            <span className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Confirmed Match
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">{stats.confirmed}</span>
          </div>

          <div className="p-3 bg-[#161C1A] border border-[#2D3748] rounded-sm flex flex-col">
            <span className="text-[10px] font-mono uppercase text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Corrected Taxa
            </span>
            <span className="text-xl font-bold font-mono text-amber-400">{stats.corrected}</span>
          </div>

          <div className="p-3 bg-[#161C1A] border border-[#2D3748] rounded-sm flex flex-col">
            <span className="text-[10px] font-mono uppercase text-slate-400">Empirical Accuracy</span>
            <span className="text-xl font-bold font-mono text-cyan-400">
              {stats.total > 0 ? `${stats.accuracyRate}%` : "100%"}
            </span>
          </div>
        </div>

        {/* Tabs & Export Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 bg-[#161C1A] border-b border-[#2D3748]">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveTab("ledger")}
              className={`px-3 py-1.5 rounded-sm font-bold uppercase tracking-tight transition-all cursor-pointer ${
                activeTab === "ledger"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-white bg-[#1A2220]"
              }`}
            >
              Specimen Ledger ({feedbackList.length})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-sm font-bold uppercase tracking-tight transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-white bg-[#1A2220]"
              }`}
            >
              Organ & Taxa Confusion
            </button>
            <button
              onClick={() => setActiveTab("finetune_guide")}
              className={`px-3 py-1.5 rounded-sm font-bold uppercase tracking-tight transition-all cursor-pointer ${
                activeTab === "finetune_guide"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-white bg-[#1A2220]"
              }`}
            >
              Retraining Pipeline
            </button>
          </div>

          {/* Export Dataset Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => PlantService.downloadTrainingDataset("jsonl")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#1A2220] hover:bg-[#242f2c] border border-emerald-500/50 text-emerald-300 hover:text-white text-xs font-mono font-bold uppercase tracking-tight transition-all cursor-pointer shadow-xs"
              title="Download JSONL dataset formatted for Gemini & Vision Transformer Fine-Tuning"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSONL</span>
            </button>

            <button
              onClick={() => PlantService.downloadTrainingDataset("csv")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#1A2220] hover:bg-[#242f2c] border border-[#2D3748] text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-tight transition-all cursor-pointer"
              title="Download CSV taxonomy ledger"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: SPECIMEN LEDGER */}
          {activeTab === "ledger" && (
            <div className="flex flex-col gap-4">
              {/* Search & Decision Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search verified specimens, taxa, or field notes..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#161C1A] border border-[#2D3748] rounded-sm text-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#161C1A] p-1 rounded-sm border border-[#2D3748] text-xs">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-2.5 py-1 rounded-xs font-mono uppercase text-[10px] ${
                      filterType === "all" ? "bg-[#25322E] text-emerald-300 font-bold" : "text-slate-400"
                    }`}
                  >
                    All ({feedbackList.length})
                  </button>
                  <button
                    onClick={() => setFilterType("confirmed_correct")}
                    className={`px-2.5 py-1 rounded-xs font-mono uppercase text-[10px] ${
                      filterType === "confirmed_correct" ? "bg-emerald-950 text-emerald-300 font-bold" : "text-slate-400"
                    }`}
                  >
                    Confirmed ({stats.confirmed})
                  </button>
                  <button
                    onClick={() => setFilterType("corrected")}
                    className={`px-2.5 py-1 rounded-xs font-mono uppercase text-[10px] ${
                      filterType === "corrected" ? "bg-amber-950 text-amber-300 font-bold" : "text-slate-400"
                    }`}
                  >
                    Corrected ({stats.corrected})
                  </button>
                </div>
              </div>

              {/* Feedback Item List */}
              {filteredList.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center gap-3 bg-[#0F1412] border border-[#2D3748] rounded-sm">
                  <Database className="w-10 h-10 text-slate-600 stroke-[1.5]" />
                  <div className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    No Verification Records Found
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm font-mono">
                    Scan or open any botanical specimen in the Dossier and use the "Taxonomic Verification & Model Feedback" card to confirm or correct identifications.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {filteredList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {item.userDecision === "confirmed_correct" && (
                          <div className="p-2 rounded-sm bg-emerald-950/60 border border-emerald-700 text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        {item.userDecision === "corrected" && (
                          <div className="p-2 rounded-sm bg-amber-950/60 border border-amber-700 text-amber-400 shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}
                        {item.userDecision === "uncertain" && (
                          <div className="p-2 rounded-sm bg-slate-900 border border-slate-700 text-slate-400 shrink-0">
                            <HelpCircle className="w-4 h-4" />
                          </div>
                        )}

                        <div className="flex flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            {item.userDecision === "corrected" ? (
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <span className="text-slate-400 line-through">
                                  {item.originalIdentification.scientificName}
                                </span>
                                <span className="text-amber-400">➔</span>
                                <span className="text-emerald-300 font-bold font-serif italic text-sm">
                                  {item.correctedData?.scientificName}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-sm text-white font-serif italic">
                                {item.originalIdentification.scientificName}
                              </span>
                            )}

                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-[#1A2220] text-slate-300 border border-[#2D3748]">
                              {item.correctedData?.organ || item.originalIdentification.detectedOrgan || "leaf"}
                            </span>

                            <span className="text-[10px] font-mono text-slate-500">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>

                          {item.correctedData?.correctionReason && (
                            <span className="text-[11px] text-amber-300/90 font-mono mt-0.5">
                              Reason: {item.correctedData.correctionReason}
                            </span>
                          )}

                          {item.userNotes && (
                            <span className="text-[11px] text-slate-400 italic mt-0.5">
                              "{item.userNotes}"
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleDeleteItem(item.id, item.plantId)}
                          className="p-1.5 rounded-sm bg-[#1A2220] hover:bg-rose-950/60 border border-[#2D3748] hover:border-rose-700 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Delete record from dataset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORGAN & TAXA CONFUSION ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="flex flex-col gap-5">
              {/* Organ-wise Precision Breakdown */}
              <div className="p-4 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Pl@ntNet-300K Organ Anatomical Precision Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(stats.organBreakdown).length === 0 ? (
                    <p className="text-xs text-slate-500 col-span-3">No organ data logged yet.</p>
                  ) : (
                    (Object.entries(stats.organBreakdown) as [string, { total: number; confirmed: number }][]).map(([organ, data]) => {
                      const organAccuracy = data.total > 0 ? Math.round((data.confirmed / data.total) * 100) : 100;
                      return (
                        <div key={organ} className="p-3 bg-[#0F1412] border border-[#2D3748] rounded-sm">
                          <div className="flex items-center justify-between text-xs font-mono uppercase mb-1">
                            <span className="text-slate-300 font-bold">{organ}</span>
                            <span className="text-emerald-400 font-bold">{organAccuracy}%</span>
                          </div>
                          <div className="w-full bg-[#1A2220] h-2 rounded-xs overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full transition-all"
                              style={{ width: `${organAccuracy}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            {data.confirmed} confirmed / {data.total} total
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Confusion Matrix: Top Misidentified Species */}
              <div className="p-4 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Sister Taxa Confusion Ledger (Misidentifications to Correct in Retraining)
                </h4>
                {stats.topMisidentified.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No misidentification confusion pairs recorded yet. Positive validations represent clean matches.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {stats.topMisidentified.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#0F1412] border border-[#2D3748] rounded-sm flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-rose-400 italic font-serif">{item.original}</span>
                          <span className="text-slate-500">➔</span>
                          <span className="text-emerald-300 font-bold font-serif italic">{item.corrected}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-xs bg-amber-950 border border-amber-800 text-amber-300 font-bold text-[10px]">
                          {item.count} correction{item.count > 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RETRAINING PIPELINE */}
          {activeTab === "finetune_guide" && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    Automated Model Fine-Tuning & LoRA Weights Generation
                  </h4>
                  <button
                    onClick={copyFineTuningCli}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-[#1A2220] hover:bg-[#25322E] border border-[#2D3748] text-emerald-300 rounded-sm cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? "Copied!" : "Copy CLI Script"}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  This pipeline converts your verified feedback ledger into standard JSONL training pairs formatted for the <strong>Pl@ntNet-300K Benchmark</strong> and <strong>Gemini Vision API fine-tuning</strong>.
                </p>

                <pre className="p-3 bg-[#0A0E0C] border border-[#2D3748] rounded-sm text-[11px] font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
{`# 1. Export ground-truth JSONL training dataset
curl -s https://floramedica.app/api/feedback/export?format=jsonl > dataset.jsonl

# 2. Fine-tune Gemini 3.7 Vision model via Google Cloud Vertex AI
gcloud ai vision-models fine-tune \\
  --dataset=dataset.jsonl \\
  --base-model=gemini-3.7-flash \\
  --organ-priors=leaf,flower,fruit,bark,habit

# 3. Hot-swap updated neural weights into FloraMedica offline APK engine
python package_apk.py --weights-bin ./neural_weights_plantnet300k.bin`}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#0F1412] border border-[#2D3748] rounded-sm flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Active Model Engine
                  </span>
                  <p className="text-xs text-slate-400 font-mono">
                    Gemini 3.7 Flash + Pl@ntNet-300K Multi-Organ Prior Classifier (Zenodo 5645731)
                  </p>
                </div>

                <div className="p-3.5 bg-[#0F1412] border border-[#2D3748] rounded-sm flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" /> Persistent Storage
                  </span>
                  <p className="text-xs text-slate-400 font-mono">
                    Local Device Storage + Server JSON Training Buffer (`/api/feedback`)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#161C1A] border-t border-[#2D3748] flex items-center justify-between">
          <div className="text-[10px] font-mono text-slate-400">
            FloraMedica Active Learning Loop • Ground Truth Engine
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-tight text-xs cursor-pointer"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};

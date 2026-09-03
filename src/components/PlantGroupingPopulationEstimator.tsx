import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Upload,
  Layers,
  Sparkles,
  Grid,
  Minimize2,
  Compass,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCw,
  Download,
  FileSpreadsheet,
  FileCode,
  Copy,
  Check,
  Trash2,
  Plus,
  Play,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Leaf,
  RefreshCw,
  Eye,
  Sliders,
  Maximize2,
} from "lucide-react";
import {
  SamplingCriteriaMethod,
  SamplingCriteriaInfo,
  SampledFrame,
  DetectedPlantGroup,
  SpeciesPopulationEstimate,
  BiodiversityIndices,
  PopulationSurveyReport,
  PlantData,
} from "../types";
import {
  SAMPLING_CRITERIA_REGISTRY,
  CURATED_SURVEY_PRESETS,
  PopulationEstimationEngine,
} from "../services/populationEstimationEngine";
import { FULL_BOTANICAL_DATABASE } from "../services/plantService";

interface PlantGroupingPopulationEstimatorProps {
  isOnlineMode: boolean;
  onSelectPlantForDossier: (plant: PlantData) => void;
  onOpenHerbLookup?: () => void;
}

export const PlantGroupingPopulationEstimator: React.FC<PlantGroupingPopulationEstimatorProps> = ({
  isOnlineMode,
  onSelectPlantForDossier,
  onOpenHerbLookup,
}) => {
  // Mode selection: "camera" | "upload" | "presets"
  const [activeInputMode, setActiveInputMode] = useState<"camera" | "upload" | "presets">("upload");

  // Sampling criteria method state
  const [selectedMethod, setSelectedMethod] = useState<SamplingCriteriaMethod>("quadrat_standard");
  const [quadratAreaM2, setQuadratAreaM2] = useState<number>(1.0);
  const [surveyZoneAreaM2, setSurveyZoneAreaM2] = useState<number>(100.0);

  // Biodiversity Check Option (Active toggle)
  const [enableBiodiversityCheck, setEnableBiodiversityCheck] = useState<boolean>(true);

  // Sampled frames state
  const [sampledFrames, setSampledFrames] = useState<SampledFrame[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-himalayan-meadow");

  // Estimation state
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [surveyReport, setSurveyReport] = useState<PopulationSurveyReport | null>(null);
  const [surveyNotes, setSurveyNotes] = useState<string>("");
  const [copiedState, setCopiedState] = useState<boolean>(false);

  // Active frame inspected in details
  const [selectedFrameDetailIdx, setSelectedFrameDetailIdx] = useState<number>(0);

  // Camera stream refs & state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState<boolean>(false);

  // Update quadrat area default when method changes
  useEffect(() => {
    const meta = SAMPLING_CRITERIA_REGISTRY[selectedMethod];
    if (meta) {
      setQuadratAreaM2(meta.plotAreaM2);
    }
  }, [selectedMethod]);

  // Load default preset on initial mount so user immediately sees rich data
  useEffect(() => {
    const initialPreset = CURATED_SURVEY_PRESETS[0];
    if (initialPreset) {
      setSampledFrames(initialPreset.frames);
      setSelectedMethod(initialPreset.samplingMethod);
      setSurveyZoneAreaM2(initialPreset.defaultSurveyZoneM2);

      // Generate report automatically for preset
      const report = PopulationEstimationEngine.generateReport(
        initialPreset.samplingMethod,
        initialPreset.frames,
        SAMPLING_CRITERIA_REGISTRY[initialPreset.samplingMethod].plotAreaM2,
        initialPreset.defaultSurveyZoneM2,
        true,
        initialPreset.description
      );
      setSurveyReport(report);
    }
  }, []);

  // Safe camera stop
  const stopCamera = useCallback(() => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Clean up camera on unmount or mode switch
  useEffect(() => {
    if (activeInputMode !== "camera") {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeInputMode, stopCamera]);

  // Start Camera Stream
  const startCamera = useCallback(async (facing: "environment" | "user" = cameraFacing) => {
    setIsCameraStarting(true);
    setCameraError(null);

    stopCamera();

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera hardware API is not supported in this browser. Please use multiple image upload.");
      setIsCameraStarting(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Primary camera access error:", err);
      // Fallback to generic video constraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsCameraActive(true);
      } catch (fallbackErr: any) {
        setCameraError(
          fallbackErr.name === "NotAllowedError"
            ? "Camera permission was denied. Please allow camera permissions in browser settings or upload photos."
            : "Could not initialize camera feed. Please use image upload."
        );
        setIsCameraActive(false);
      }
    } finally {
      setIsCameraStarting(false);
    }
  }, [cameraFacing, stopCamera]);

  // Capture current camera video frame as a quadrat sample
  const captureCameraFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.85);

    const frameIdx = sampledFrames.length + 1;
    const label = `Quadrat Frame #${frameIdx} (Live Camera)`;

    const newFrame = PopulationEstimationEngine.simulateOfflinePlantGrouping(
      base64,
      label,
      frameIdx,
      selectedMethod
    );

    setSampledFrames((prev) => [...prev, newFrame]);
  };

  // Handle Multiple Image Upload
  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFrames: SampledFrame[] = [];
    const fileList: File[] = Array.from(files) as File[];

    let processedCount = 0;
    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        const currentTotal = sampledFrames.length + newFrames.length + 1;
        const label = `Quadrat #${currentTotal} (${file.name.slice(0, 18)})`;

        const frame = PopulationEstimationEngine.simulateOfflinePlantGrouping(
          base64,
          label,
          currentTotal,
          selectedMethod
        );
        newFrames.push(frame);
        processedCount++;

        if (processedCount === fileList.length) {
          setSampledFrames((prev) => [...prev, ...newFrames]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove a frame from the survey
  const handleRemoveFrame = (frameId: string) => {
    setSampledFrames((prev) => prev.filter((f) => f.id !== frameId));
  };

  // Load a curated preset
  const handleLoadPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = CURATED_SURVEY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSampledFrames(preset.frames);
    setSelectedMethod(preset.samplingMethod);
    setSurveyZoneAreaM2(preset.defaultSurveyZoneM2);
    setSurveyNotes(preset.description);

    const report = PopulationEstimationEngine.generateReport(
      preset.samplingMethod,
      preset.frames,
      SAMPLING_CRITERIA_REGISTRY[preset.samplingMethod].plotAreaM2,
      preset.defaultSurveyZoneM2,
      true,
      preset.description
    );
    setSurveyReport(report);
    setSelectedFrameDetailIdx(0);
  };

  // Run the full Population & Biodiversity Estimation
  const handleRunEstimation = async () => {
    if (sampledFrames.length === 0) return;

    setIsCalculating(true);
    let enhancedFrames = sampledFrames;
    let isAi = false;

    // If online and we have images, attempt server-side AI Vision cascade
    if (isOnlineMode) {
      try {
        const payloadImages = sampledFrames.map((f, i) => ({
          id: f.id,
          imageBase64: f.imageSrc,
          label: f.label || `Quadrat Frame #${i + 1}`,
          mimeType: "image/jpeg",
        }));

        const res = await fetch("/api/estimate-population-biodiversity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: payloadImages,
            samplingMethod: selectedMethod,
            quadratAreaM2,
            surveyZoneAreaM2,
            notes: surveyNotes,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.frames) && data.frames.length > 0) {
            enhancedFrames = data.frames;
            isAi = true;
          }
        }
      } catch (err) {
        console.warn("Online AI grouping estimation call failed, using local engine:", err);
      }
    }

    // Compute report with local scientific engine
    const report = PopulationEstimationEngine.generateReport(
      selectedMethod,
      enhancedFrames,
      quadratAreaM2,
      surveyZoneAreaM2,
      isAi,
      surveyNotes
    );

    setSurveyReport(report);
    setIsCalculating(false);
  };

  // Export report to CSV file
  const handleExportCsv = () => {
    if (!surveyReport) return;
    const csvData = PopulationEstimationEngine.exportReportToCsv(surveyReport);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FloraMedica_Survey_${surveyReport.surveyId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export report to JSON file
  const handleExportJson = () => {
    if (!surveyReport) return;
    const jsonData = JSON.stringify(surveyReport, null, 2);
    const blob = new Blob([jsonData], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FloraMedica_Survey_${surveyReport.surveyId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    if (!surveyReport) return;
    const text = `FLORAMEDICA PRO BOTANICAL SURVEY REPORT
ID: ${surveyReport.surveyId} | Method: ${surveyReport.criteriaDetails.name}
Plots: ${surveyReport.framesCount} (${surveyReport.quadratAreaM2} m² each) | Total Zone: ${surveyReport.surveyZoneAreaM2} m²
Overall Density: ${surveyReport.overallDensityPerM2} plants/m² | Canopy Cover: ${surveyReport.overallVegetationCover}%
Species Richness (S): ${surveyReport.biodiversity.speciesRichness} | Total Sampled (N): ${surveyReport.biodiversity.totalIndividualsSampled}
Shannon-Wiener (H'): ${surveyReport.biodiversity.shannonWienerIndex} | Pielou Evenness (J'): ${surveyReport.biodiversity.pielouEvenness}
Health Grade: ${surveyReport.biodiversity.ecologicalHealthGrade}
Dominant Species: ${surveyReport.biodiversity.dominantSpecies}
Key Taxa: ${surveyReport.speciesEstimates.map((s) => `${s.scientificName} (${s.relativeAbundance}%)`).join(", ")}`;

    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  // Open plant in Dossier
  const handleOpenPlantDossier = (scientificName: string) => {
    const match = FULL_BOTANICAL_DATABASE.find(
      (p) =>
        p.scientificName.toLowerCase() === scientificName.toLowerCase() ||
        p.scientificName.toLowerCase().includes(scientificName.toLowerCase())
    );
    if (match) {
      onSelectPlantForDossier(match);
    } else if (onOpenHerbLookup) {
      onOpenHerbLookup();
    }
  };

  const currentCriteria = SAMPLING_CRITERIA_REGISTRY[selectedMethod];
  const isSampleCountAdequate = sampledFrames.length >= currentCriteria.minFrames;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner & Introduction */}
      <div className="bg-[#141C19] border border-[#2D3748] rounded-sm p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Quantitative Plant Ecology &amp; Phytosociology
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 rounded-xs border border-emerald-500/30">
                Pl@ntNet-300K Benchmark Calibrated
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
              Plant Grouping, Population Estimation &amp; Biodiversity Survey
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Capture multiple frames from your live camera or upload a batch of field quadrat photos. Select standard
              ecological sampling criteria, estimate absolute population density and spatial aggregation, and run an
              automated Shannon-Wiener and Simpson biodiversity health check.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Online/Offline status badge */}
            <div
              className={`px-2.5 py-1 text-[11px] font-mono rounded-sm border flex items-center gap-1.5 ${
                isOnlineMode
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-950/40 text-amber-300 border-amber-500/40"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnlineMode ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span>{isOnlineMode ? "AI Vision Cascade Online" : "Pl@ntNet-300K Offline Mode"}</span>
            </div>

            {/* Quick preset trigger button */}
            <button
              id="load-himalayan-preset-btn"
              onClick={() => handleLoadPreset("preset-himalayan-meadow")}
              className="px-3 py-1 bg-[#1E2B25] hover:bg-[#2A3C34] text-emerald-300 border border-emerald-500/40 rounded-sm text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Load Himalayan Meadow 5-Quadrat Sample Preset"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Load Himalayan Preset</span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: SAMPLING CRITERIA SELECTOR & GUIDANCE INDICATOR */}
      <section className="bg-[#141C19] border border-[#2D3748] rounded-sm p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#24302C] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center font-mono border border-emerald-500/40">
              1
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight font-mono">
              Select Sampling Criteria &amp; Spatial Protocols
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Current Plot: <strong className="text-emerald-400">{quadratAreaM2} m²</strong> | Zone:{" "}
            <strong className="text-emerald-400">{surveyZoneAreaM2} m²</strong>
          </span>
        </div>

        {/* Criteria Method Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(Object.keys(SAMPLING_CRITERIA_REGISTRY) as SamplingCriteriaMethod[]).map((methodKey) => {
            const criteria = SAMPLING_CRITERIA_REGISTRY[methodKey];
            const isSelected = selectedMethod === methodKey;
            return (
              <button
                key={methodKey}
                id={`criteria-tab-${methodKey}`}
                onClick={() => setSelectedMethod(methodKey)}
                className={`p-3 rounded-sm border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400"
                    : "bg-[#101715] border-[#273531] text-slate-300 hover:border-emerald-500/50 hover:bg-[#16201D]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold font-mono uppercase tracking-tight text-emerald-400">
                      {criteria.shortName}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{criteria.idealStratum}</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#1F2B27] flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Plot: {criteria.plotAreaM2} m²</span>
                  <span className="text-emerald-400/90 font-semibold">{criteria.recommendedSampleCount}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Scientific Indicator Card for Selected Criteria */}
        <div className="bg-[#101715] border border-emerald-500/30 rounded-sm p-3.5 sm:p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase font-mono text-emerald-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                {currentCriteria.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#16221E] text-slate-300 border border-[#273832]">
                Min Recommended Samples: <strong>{currentCriteria.minFrames} Frames</strong>
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${
                  isSampleCountAdequate
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-950/60 text-amber-300 border-amber-500/40"
                }`}
              >
                Current Samples: {sampledFrames.length}{" "}
                {isSampleCountAdequate ? "✓ Statistically Valid" : `(Need ≥${currentCriteria.minFrames} for low SE)`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
              <div>
                <strong className="text-slate-400 font-mono text-[11px] block">Camera Protocol:</strong>
                <span>{currentCriteria.cameraProtocol}</span>
              </div>
              <div>
                <strong className="text-slate-400 font-mono text-[11px] block">Inclusion / Boundary Rule:</strong>
                <span>{currentCriteria.boundaryRule}</span>
              </div>
            </div>
          </div>

          {/* Area Parameter Inputs */}
          <div className="flex flex-wrap items-center gap-3 bg-[#151F1B] p-2.5 rounded-sm border border-[#2B3B35] shrink-0">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Plot Size (m²)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="10"
                value={quadratAreaM2}
                onChange={(e) => setQuadratAreaM2(parseFloat(e.target.value) || 1.0)}
                className="w-20 bg-[#0F1412] border border-[#2E3E37] px-2 py-1 text-xs font-mono text-emerald-300 rounded-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Survey Zone (m²)</label>
              <input
                type="number"
                step="5"
                min="1"
                max="50000"
                value={surveyZoneAreaM2}
                onChange={(e) => setSurveyZoneAreaM2(parseFloat(e.target.value) || 100.0)}
                className="w-24 bg-[#0F1412] border border-[#2E3E37] px-2 py-1 text-xs font-mono text-emerald-300 rounded-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2: MULTI-IMAGE INPUT (CAMERA BURST vs MULTI-FILE UPLOAD vs PRESETS) */}
      <section className="bg-[#141C19] border border-[#2D3748] rounded-sm p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#24302C] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center font-mono border border-emerald-500/40">
              2
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight font-mono">
              Provide Sampled Images ({sampledFrames.length} Frames in Queue)
            </h3>
          </div>

          {/* Mode switch tabs */}
          <div className="flex items-center gap-1 bg-[#101715] p-1 rounded-sm border border-[#273832] text-xs">
            <button
              id="mode-upload-btn"
              onClick={() => setActiveInputMode("upload")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm font-mono font-semibold transition-all cursor-pointer ${
                activeInputMode === "upload"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Multiple Image Upload</span>
            </button>

            <button
              id="mode-camera-btn"
              onClick={() => {
                setActiveInputMode("camera");
                startCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm font-mono font-semibold transition-all cursor-pointer ${
                activeInputMode === "camera"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera Burst</span>
            </button>

            <button
              id="mode-presets-btn"
              onClick={() => setActiveInputMode("presets")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm font-mono font-semibold transition-all cursor-pointer ${
                activeInputMode === "presets"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Field Presets ({CURATED_SURVEY_PRESETS.length})</span>
            </button>
          </div>
        </div>

        {/* MODE A: LIVE CAMERA FEEDBACK & BURST CAPTURE */}
        {activeInputMode === "camera" && (
          <div className="flex flex-col gap-4">
            <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] bg-black rounded-sm overflow-hidden border border-[#2D3748] shadow-md flex items-center justify-center">
              {/* HTML5 Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isCameraActive ? "hidden" : ""}`}
              />

              {/* Initializing / Inactive overlay */}
              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Camera className="w-12 h-12 text-slate-500 mb-3" />
                  <p className="text-sm text-slate-300 mb-2">
                    {isCameraStarting ? "Initializing hardware camera..." : "Camera is currently inactive"}
                  </p>
                  {cameraError && <p className="text-xs text-amber-400 max-w-md mb-3">{cameraError}</p>}
                  <button
                    onClick={() => startCamera()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs rounded-sm cursor-pointer"
                  >
                    Start Live Camera
                  </button>
                </div>
              )}

              {/* Real-time Quadrat Grid Overlay Guide */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none border-4 border-emerald-500/60 flex flex-col justify-between p-2">
                  {/* Grid lines */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                    <div className="border-r border-b border-emerald-400/25" />
                    <div className="border-r border-b border-emerald-400/25" />
                    <div className="border-b border-emerald-400/25" />
                    <div className="border-r border-b border-emerald-400/25" />
                    <div className="border-r border-b border-emerald-400/25 relative">
                      {/* Center Crosshair */}
                      <div className="absolute inset-0 m-auto w-8 h-8 border border-emerald-400/60 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      </div>
                    </div>
                    <div className="border-b border-emerald-400/25" />
                    <div className="border-r border-emerald-400/25" />
                    <div className="border-r border-emerald-400/25" />
                    <div />
                  </div>

                  {/* Top Guide Banner */}
                  <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-xs px-3 py-1 text-[10px] font-mono text-emerald-300 rounded-sm border border-emerald-500/30">
                    <span>QUADRAT PROTOCOL: 1m × 1m (Nadir 90° overhead angle)</span>
                    <span>Hold parallel to ground at 1.2m height</span>
                  </div>

                  {/* Bottom Guide Banner */}
                  <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-xs px-3 py-1 text-[10px] font-mono text-slate-300 rounded-sm border border-slate-700">
                    <span>NORTH-EAST BORDER RULE ACTIVE</span>
                    <span>Frames Captured: {sampledFrames.length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            {isCameraActive && (
              <div className="flex items-center justify-center gap-3">
                <button
                  id="snap-quadrat-sample-btn"
                  onClick={captureCameraFrame}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-tight rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  <span>Capture Quadrat #{sampledFrames.length + 1}</span>
                </button>

                <button
                  onClick={() => {
                    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
                    setCameraFacing(nextFacing);
                    startCamera(nextFacing);
                  }}
                  className="p-2.5 bg-[#1C2622] hover:bg-[#25322D] text-slate-300 border border-[#2D3E37] rounded-sm cursor-pointer"
                  title="Switch Camera Facing (Front / Back)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  onClick={stopCamera}
                  className="px-3 py-2 bg-[#1C2622] hover:bg-red-950 text-slate-300 hover:text-red-300 border border-[#2D3E37] text-xs font-mono rounded-sm cursor-pointer"
                >
                  Stop Camera
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE B: MULTIPLE IMAGE UPLOAD */}
        {activeInputMode === "upload" && (
          <div className="flex flex-col gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#101715] hover:bg-[#15201C] rounded-sm p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultipleFiles}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white uppercase font-mono tracking-tight">
                Click to Select Multiple Field Quadrat Photos
              </p>
              <p className="text-xs text-slate-400 max-w-md">
                Select 3 to 15 images captured across your sampling transects or quadrats. Supports high-resolution
                JPEG, PNG, WebP field camera files.
              </p>
              <span className="text-[10px] font-mono px-2.5 py-1 bg-[#1A2521] text-emerald-300 rounded-sm border border-emerald-500/30 mt-2">
                Drag &amp; Drop Multiple Images Here
              </span>
            </div>
          </div>
        )}

        {/* MODE C: FIELD PRESETS (HIMALAYAN MEADOW, WESTERN GHATS, INVASIVE SCRUB) */}
        {activeInputMode === "presets" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CURATED_SURVEY_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className={`p-3.5 rounded-sm border flex flex-col justify-between gap-3 ${
                  selectedPresetId === preset.id
                    ? "bg-[#18231F] border-emerald-400 shadow-sm ring-1 ring-emerald-400"
                    : "bg-[#101715] border-[#25352F] hover:border-emerald-500/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-950/60 rounded-xs border border-emerald-500/30">
                      {preset.region}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{preset.frames.length} Frames</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white font-mono mt-1">{preset.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">{preset.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#202E29]">
                  <span className="text-[10px] font-mono text-slate-400">Zone: {preset.defaultSurveyZoneM2} m²</span>
                  <button
                    onClick={() => handleLoadPreset(preset.id)}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold rounded-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span>Load Preset</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CURRENTLY CAPTURED / UPLOADED FRAMES STRIP */}
        {sampledFrames.length > 0 && (
          <div className="mt-2 pt-3 border-t border-[#24302C]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono uppercase font-bold text-slate-300">
                Sampled Frames Strip ({sampledFrames.length} total)
              </span>
              <button
                onClick={() => setSampledFrames([])}
                className="text-[11px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {sampledFrames.map((frame, fIdx) => (
                <div
                  key={frame.id}
                  className={`relative group rounded-sm border overflow-hidden bg-black ${
                    selectedFrameDetailIdx === fIdx ? "border-emerald-400 ring-1 ring-emerald-400" : "border-[#2D3E37]"
                  }`}
                >
                  <img src={frame.imageSrc} alt={frame.label} className="w-full h-20 sm:h-24 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono px-1 py-0.2 bg-black/70 text-emerald-400 rounded-xs">
                        Q-{fIdx + 1}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFrame(frame.id);
                        }}
                        className="w-4 h-4 rounded-full bg-red-950/80 hover:bg-red-700 text-white flex items-center justify-center text-[10px] cursor-pointer"
                        title="Remove frame"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[9px] font-mono text-slate-200 truncate">{frame.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* STEP 3: BIODIVERSITY CHECK OPTION & ESTIMATION RUN BUTTON */}
      <section className="bg-[#141C19] border border-[#2D3748] rounded-sm p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Active Biodiversity Check Toggle */}
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              id="biodiversity-check-checkbox"
              checked={enableBiodiversityCheck}
              onChange={(e) => setEnableBiodiversityCheck(e.target.checked)}
              className="mt-1 w-4 h-4 rounded-xs text-emerald-500 bg-[#0F1412] border-[#2D3E37] focus:ring-emerald-400 cursor-pointer"
            />
            <div>
              <label
                htmlFor="biodiversity-check-checkbox"
                className="text-xs sm:text-sm font-bold text-white uppercase font-mono tracking-tight cursor-pointer flex items-center gap-2"
              >
                <span>Enable Deep Biodiversity &amp; Ecological Health Check</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-xs border border-emerald-500/40">
                  Shannon H&apos; + Simpson + Pielou
                </span>
              </label>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Calculates scientific species richness ($S$), Shannon-Wiener diversity ($H&apos;$), Simpson&apos;s
                dominance &amp; reciprocal diversity ($1/D$), Pielou&apos;s evenness ($J&apos;$), Margalef richness,
                native vs. invasive weed ratio, and ecological conservation status.
              </p>
            </div>
          </div>

          {/* Run Estimation Action Button */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              id="run-population-estimation-btn"
              disabled={sampledFrames.length === 0 || isCalculating}
              onClick={handleRunEstimation}
              className={`px-6 py-3 rounded-sm font-mono font-bold text-xs uppercase tracking-tight flex items-center gap-2 transition-all cursor-pointer ${
                sampledFrames.length === 0 || isCalculating
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              }`}
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Frames &amp; Groups...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 stroke-[2.5]" />
                  <span>Estimate Population &amp; Biodiversity</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* STEP 4: ESTIMATION RESULTS DASHBOARD */}
      {surveyReport && (
        <section className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Top Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#141C19] border border-[#2D3748] rounded-sm p-3.5 sm:p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Est. Population</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                {surveyReport.speciesEstimates
                  .reduce((acc, s) => acc + s.estimatedTotalPopulation, 0)
                  .toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-400">plants</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                Extrapolated to {surveyReport.surveyZoneAreaM2} m² zone
              </span>
            </div>

            <div className="bg-[#141C19] border border-[#2D3748] rounded-sm p-3.5 sm:p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Vegetation Density</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
                {surveyReport.overallDensityPerM2}{" "}
                <span className="text-xs font-normal text-slate-400">indiv/m²</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                Sampled area: {(surveyReport.framesCount * surveyReport.quadratAreaM2).toFixed(1)} m²
              </span>
            </div>

            <div className="bg-[#141C19] border border-[#2D3748] rounded-sm p-3.5 sm:p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Mean Canopy Cover</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 mt-1">
                {surveyReport.overallVegetationCover}%
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                {surveyReport.framesCount} quadrats evaluated
              </span>
            </div>

            <div className="bg-[#141C19] border border-[#2D3748] rounded-sm p-3.5 sm:p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Species Richness (S)</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300 mt-1">
                {surveyReport.biodiversity.speciesRichness}{" "}
                <span className="text-xs font-normal text-slate-400">taxa</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                {surveyReport.biodiversity.totalIndividualsSampled} individuals observed
              </span>
            </div>
          </div>

          {/* BIODIVERSITY & ECOLOGICAL HEALTH CHECK PANEL */}
          {enableBiodiversityCheck && (
            <div className="bg-[#141C19] border border-emerald-500/40 rounded-sm p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#24302C] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-tight">
                    Biodiversity Check &amp; Ecological Health Diagnostics
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Ecological Grade:</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-sm bg-emerald-500 text-black uppercase">
                    {surveyReport.biodiversity.ecologicalHealthGrade}
                  </span>
                </div>
              </div>

              {/* Ecological Summary and Diagnosis */}
              <div className="bg-[#101715] border border-[#24342E] rounded-sm p-3 text-xs text-slate-300 leading-relaxed">
                <strong className="text-emerald-400 font-mono text-[11px] uppercase block mb-1">
                  Phytosociological Summary:
                </strong>
                {surveyReport.biodiversity.ecologicalHealthSummary}
              </div>

              {/* Warning flags if invasive or low dominance */}
              {surveyReport.biodiversity.warnings.length > 0 && (
                <div className="space-y-1.5">
                  {surveyReport.biodiversity.warnings.map((warn, wIdx) => (
                    <div
                      key={wIdx}
                      className="p-2.5 rounded-sm bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Diversity Mathematical Indices Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                <div className="p-2.5 bg-[#101715] rounded-sm border border-[#24342E]">
                  <span className="text-[10px] font-mono text-slate-400 block">Shannon-Wiener (H&apos;)</span>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {surveyReport.biodiversity.shannonWienerIndex}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Max: {surveyReport.biodiversity.shannonMax}</span>
                </div>

                <div className="p-2.5 bg-[#101715] rounded-sm border border-[#24342E]">
                  <span className="text-[10px] font-mono text-slate-400 block">Pielou Evenness (J&apos;)</span>
                  <div className="text-lg font-bold font-mono text-cyan-300">
                    {surveyReport.biodiversity.pielouEvenness}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Scale 0.0 – 1.0</span>
                </div>

                <div className="p-2.5 bg-[#101715] rounded-sm border border-[#24342E]">
                  <span className="text-[10px] font-mono text-slate-400 block">Simpson Recip. (1/D)</span>
                  <div className="text-lg font-bold font-mono text-teal-300">
                    {surveyReport.biodiversity.simpsonReciprocal}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">
                    Dom: {surveyReport.biodiversity.simpsonDominance}
                  </span>
                </div>

                <div className="p-2.5 bg-[#101715] rounded-sm border border-[#24342E]">
                  <span className="text-[10px] font-mono text-slate-400 block">Margalef Richness</span>
                  <div className="text-lg font-bold font-mono text-amber-300">
                    {surveyReport.biodiversity.margalefRichness}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Species-Area Curve</span>
                </div>

                <div className="p-2.5 bg-[#101715] rounded-sm border border-[#24342E]">
                  <span className="text-[10px] font-mono text-slate-400 block">Berger-Parker Dom.</span>
                  <div className="text-lg font-bold font-mono text-slate-200">
                    {(surveyReport.biodiversity.bergerParkerDominance * 100).toFixed(1)}%
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Dominant species share</span>
                </div>

                <div className="p-2.5 bg-[#101715] rounded-sm border border-[#24342E]">
                  <span className="text-[10px] font-mono text-slate-400 block">Native vs. Invasive</span>
                  <div className="text-lg font-bold font-mono text-white">
                    <span className="text-emerald-400">{surveyReport.biodiversity.nativeVsInvasiveCount.native}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-red-400">{surveyReport.biodiversity.nativeVsInvasiveCount.invasive}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Taxa composition</span>
                </div>
              </div>
            </div>
          )}

          {/* SPECIES POPULATION STATISTICS & RELATIVE ABUNDANCE TABLE */}
          <div className="bg-[#141C19] border border-[#2D3748] rounded-sm p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#24302C] pb-3">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-tight">
                  Plant Grouping Estimates &amp; Population Statistics
                </h3>
              </div>

              {/* Export and Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="export-csv-btn"
                  onClick={handleExportCsv}
                  className="px-2.5 py-1.5 bg-[#18231F] hover:bg-[#23332D] text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Export Field Survey to CSV for Excel / R / QGIS"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  id="export-json-btn"
                  onClick={handleExportJson}
                  className="px-2.5 py-1.5 bg-[#18231F] hover:bg-[#23332D] text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Export Complete JSON Report"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JSON</span>
                </button>

                <button
                  id="copy-summary-btn"
                  onClick={handleCopySummary}
                  className="px-2.5 py-1.5 bg-[#18231F] hover:bg-[#23332D] text-slate-300 border border-[#2D3748] text-xs font-mono rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedState ? "Copied" : "Copy Summary"}</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-[#24302C] text-[11px] font-mono uppercase text-slate-400 bg-[#101715]">
                    <th className="p-3">Species / Taxon</th>
                    <th className="p-3">Observed</th>
                    <th className="p-3">Rel. Abundance</th>
                    <th className="p-3">Density (/m²)</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Cover</th>
                    <th className="p-3">Spatial Dispersion</th>
                    <th className="p-3">Est. Zone Population</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D2723]">
                  {surveyReport.speciesEstimates.map((sp, idx) => (
                    <tr key={idx} className="hover:bg-[#18231F] transition-colors">
                      <td className="p-3 font-mono">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold italic">{sp.scientificName}</span>
                            {sp.isInvasive && (
                              <span className="text-[9px] px-1 py-0.2 bg-red-950 text-red-300 rounded-xs border border-red-500/50 uppercase font-mono font-bold">
                                Invasive
                              </span>
                            )}
                            {sp.isMedicinal && (
                              <span className="text-[9px] px-1 py-0.2 bg-emerald-950 text-emerald-300 rounded-xs border border-emerald-500/40 uppercase font-mono">
                                Medicinal
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-sans">{sp.commonName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Family: {sp.family}</span>
                        </div>
                      </td>

                      <td className="p-3 font-mono font-semibold text-slate-200">
                        {sp.totalObservedCount} plants
                        <span className="text-[10px] text-slate-400 block font-normal">
                          mean: {sp.meanCountPerFrame}/quad
                        </span>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="flex flex-col gap-1 w-28">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-emerald-400 font-bold">{sp.relativeAbundance}%</span>
                          </div>
                          <div className="w-full bg-[#101715] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${sp.isInvasive ? "bg-red-400" : "bg-emerald-400"}`}
                              style={{ width: `${Math.min(100, sp.relativeAbundance)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono text-emerald-300 font-bold">{sp.densityPerM2}</td>

                      <td className="p-3 font-mono text-slate-300">
                        {sp.frequencyPercentage}%
                        <span className="text-[10px] text-slate-500 block">of sampled frames</span>
                      </td>

                      <td className="p-3 font-mono text-cyan-300">{sp.meanCanopyCoverage}%</td>

                      <td className="p-3 font-mono">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-xs border ${
                            sp.spatialDispersion.pattern === "Clustered / Contagious"
                              ? "bg-purple-950/60 text-purple-300 border-purple-500/40"
                              : sp.spatialDispersion.pattern === "Uniform / Regular"
                              ? "bg-blue-950/60 text-blue-300 border-blue-500/40"
                              : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {sp.spatialDispersion.pattern}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          VMR: {sp.spatialDispersion.varianceToMeanRatio}
                        </span>
                      </td>

                      <td className="p-3 font-mono">
                        <span className="text-white font-bold text-sm">
                          {sp.estimatedTotalPopulation.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          CI: {sp.populationRange[0]}–{sp.populationRange[1]}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenPlantDossier(sp.scientificName)}
                          className="px-2.5 py-1 bg-[#1A2521] hover:bg-emerald-500 hover:text-black text-emerald-300 text-[11px] font-mono rounded-sm border border-emerald-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                          title="Open plant details in Botanical Dossier"
                        >
                          <span>Dossier</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FRAME-BY-FRAME ANNOTATION INSPECTOR */}
          <div className="bg-[#141C19] border border-[#2D3748] rounded-sm p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#24302C] pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-tight">
                  Frame-by-Frame Plant Grouping &amp; Canopy Inspector
                </h3>
              </div>

              {/* Frame select buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {surveyReport.samples.map((frame, fIdx) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrameDetailIdx(fIdx)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-sm border transition-all cursor-pointer ${
                      selectedFrameDetailIdx === fIdx
                        ? "bg-emerald-500 text-black font-bold border-emerald-400 shadow-sm"
                        : "bg-[#101715] text-slate-300 border-[#273832] hover:border-emerald-500/40"
                    }`}
                  >
                    Quadrat #{fIdx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Inspected Frame Details */}
            {surveyReport.samples[selectedFrameDetailIdx] && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Visual Image with Group Bounding Annotations */}
                <div className="lg:col-span-6 relative bg-black rounded-sm border border-[#2D3E37] overflow-hidden aspect-[4/3]">
                  <img
                    src={surveyReport.samples[selectedFrameDetailIdx].imageSrc}
                    alt="Inspected frame"
                    className="w-full h-full object-cover"
                  />

                  {/* Bounding zone overlays */}
                  {surveyReport.samples[selectedFrameDetailIdx].detectedGroups.map((grp, gIdx) => {
                    const bz = grp.boundingZone || { x: 15 + gIdx * 25, y: 20, width: 30, height: 30 };
                    return (
                      <div
                        key={grp.id}
                        className="absolute border-2 border-emerald-400 bg-emerald-500/10 flex flex-col justify-between p-1 pointer-events-none rounded-xs"
                        style={{
                          left: `${bz.x}%`,
                          top: `${bz.y}%`,
                          width: `${bz.width}%`,
                          height: `${bz.height}%`,
                        }}
                      >
                        <span className="text-[9px] font-mono bg-black/80 text-emerald-300 px-1 py-0.5 rounded-xs truncate font-bold">
                          {grp.scientificName} ({grp.estimatedCount})
                        </span>
                        <span className="text-[8px] font-mono bg-black/80 text-cyan-300 px-1 py-0.2 self-end rounded-xs">
                          {grp.canopyCoverPercentage}% Cover
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Frame Detected Groups List */}
                <div className="lg:col-span-6 flex flex-col gap-3">
                  <div className="bg-[#101715] border border-[#24342E] p-3 rounded-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-white">
                        {surveyReport.samples[selectedFrameDetailIdx].label}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        Total Individuals: {surveyReport.samples[selectedFrameDetailIdx].totalIndividuals} | Cover:{" "}
                        {surveyReport.samples[selectedFrameDetailIdx].totalCanopyCoverage}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {surveyReport.samples[selectedFrameDetailIdx].detectedGroups.map((grp, idx) => (
                      <div
                        key={grp.id}
                        className="p-3 bg-[#101715] border border-[#24342E] rounded-sm flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-emerald-300 italic">
                              {grp.scientificName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">({grp.commonName})</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                            <span>Habit: {grp.growthHabit}</span>
                            <span>•</span>
                            <span>Family: {grp.family}</span>
                            <span>•</span>
                            <span>Confidence: {Math.round(grp.confidence * 100)}%</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold font-mono text-white">
                            {grp.estimatedCount} <span className="text-[10px] font-normal text-slate-400">indiv</span>
                          </div>
                          <div className="text-[11px] font-mono text-cyan-400 font-semibold">
                            {grp.canopyCoverPercentage}% Cover
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

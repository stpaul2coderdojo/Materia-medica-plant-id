import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  Zap,
  ZapOff,
  Sparkles,
  SlidersHorizontal,
  Layers,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  Target,
  Database,
} from "lucide-react";
import { PlantData, PlantNetOrgan } from "../types";
import { PlantService, FULL_BOTANICAL_DATABASE } from "../services/plantService";

interface CameraScannerProps {
  onPlantIdentified: (plant: PlantData, isOffline: boolean, source: string) => void;
  isOnlineMode: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onPlantIdentified,
  isOnlineMode,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMorphologyFilter, setShowMorphologyFilter] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState<PlantNetOrgan | "auto">("auto");

  // Morphological manual quick-filter state
  const [selectedLeafShape, setSelectedLeafShape] = useState<string>("any");
  const [selectedFlowerColor, setSelectedFlowerColor] = useState<string>("any");
  const [selectedMargin, setSelectedMargin] = useState<"entire" | "serrate" | "any">("any");
  const [selectedStemType, setSelectedStemType] = useState<"herb" | "shrub" | "tree" | "climber" | "any">("any");

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (err: any) {
          // AbortError is benign and occurs when stream is updated before play resolves
          if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
            console.warn("Video playback was interrupted:", err);
          }
        }
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Camera permission is required or camera is in use. You can also upload a photo or use curated test specimens below."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      setCameraError(null);
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (err: any) {
            if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
              console.warn("Video play error caught safely:", err);
            }
          }
        }
        setIsCameraActive(true);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Camera initialization error:", err);
          setCameraError(
            "Camera permission is required or camera is in use. You can also upload a photo or use curated test specimens below."
          );
          setIsCameraActive(false);
        }
      }
    };

    init();

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [facingMode]);

  // Toggle Camera Facing Mode
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Toggle Torch (if supported by hardware)
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities = (track.getCapabilities && track.getCapabilities()) as any;
        if (capabilities && capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !isTorchOn } as any],
          });
          setIsTorchOn(!isTorchOn);
        } else {
          setIsTorchOn(!isTorchOn);
        }
      } catch (err) {
        setIsTorchOn(!isTorchOn);
      }
    }
  };

  // Capture Still Frame from Video
  const captureFrame = async () => {
    if (!videoRef.current) return;

    setIsAnalyzing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg", 0.85);

        const result = await PlantService.identifyPlantFromImage(
          base64Image,
          "image/jpeg",
          "",
          selectedOrgan
        );
        onPlantIdentified(result.plant, result.isOfflineResult, result.source);
      }
    } catch (err) {
      console.error("Frame capture identification fallback triggered:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Photo File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string;
          if (base64) {
            const result = await PlantService.identifyPlantFromImage(
              base64,
              file.type || "image/jpeg",
              "",
              selectedOrgan
            );
            onPlantIdentified(result.plant, result.isOfflineResult, result.source);
          }
        } catch (err) {
          console.error("File processing identification fallback triggered:", err);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.onerror = () => {
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload error:", err);
      setIsAnalyzing(false);
    }
  };

  // Quick Select Sample Plant
  const selectSamplePlant = (plant: PlantData) => {
    onPlantIdentified(
      plant,
      true,
      "Curated Botanical Taxonomy & Pharmacopoeia Reference"
    );
  };

  // Run Morphological Decision Key
  const handleMorphologyMatch = () => {
    const matches = PlantService.matchMorphologicalKey({
      leafShape: selectedLeafShape,
      flowerColor: selectedFlowerColor,
      margin: selectedMargin,
      stemType: selectedStemType,
      organClass: selectedOrgan === "auto" ? "any" : selectedOrgan,
    });

    if (matches.length > 0) {
      onPlantIdentified(
        matches[0],
        true,
        `Offline Morphological Key (${matches.length} species matched)`
      );
    }
  };

  const organOptions: { id: PlantNetOrgan | "auto"; label: string; icon: string; desc: string }[] = [
    { id: "auto", label: "Auto Organ", icon: "⚡", desc: "Pl@ntNet-300K multi-organ detector" },
    { id: "leaf", label: "Leaf", icon: "🌿", desc: "Foliage venation & margins" },
    { id: "flower", label: "Flower", icon: "🌸", desc: "Corolla & stamen symmetry" },
    { id: "fruit", label: "Fruit / Seed", icon: "🍎", desc: "Pericarp & seed pod" },
    { id: "bark", label: "Bark / Stem", icon: "🪵", desc: "Cortical fissures & wood" },
    { id: "habit", label: "Habit", icon: "🌳", desc: "Whole plant canopy structure" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Pl@ntNet-300K Organ Targeting Bar */}
      <div className="flex items-center justify-between bg-[#161C1A] px-3 py-2 rounded-sm border border-[#2D3748]">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">
            Pl@ntNet-300K Organ Prior:
          </span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {organOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOrgan(opt.id)}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-sm border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                selectedOrgan === opt.id
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-sm"
                  : "bg-[#0F1412] text-slate-300 border-[#2D3748] hover:border-emerald-500/50 hover:text-emerald-300"
              }`}
              title={opt.desc}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scanner Viewport Box */}
      <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-sm sm:rounded-md overflow-hidden bg-[#000000] border border-[#2D3748] shadow-2xl">
        {/* Subtle geometric dot matrix background when video inactive */}
        <div className="absolute inset-0 opacity-20 bg-[#0F1412] pointer-events-none" />

        {/* Live Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCameraActive ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Torch Light Visual Filter */}
        {isTorchOn && (
          <div className="absolute inset-0 bg-emerald-300/10 pointer-events-none mix-blend-screen" />
        )}

        {/* Camera Permission Error / Fallback State */}
        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0F1412]/95 text-slate-300 z-10">
            <div className="p-3 mb-3 bg-[#161C1A] border border-[#2D3748] text-emerald-400 rounded-sm">
              <Camera className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-tight text-white mb-1">
              Live Botanical Scanner Ready
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4 font-mono">
              {cameraError ||
                "Point your camera at leaves, flowers, or seed pods for instant offline pharmacopoeial identification calibrated with the Pl@ntNet-300K Zenodo benchmark."}
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center">
              <button
                onClick={startCamera}
                className="px-5 py-2 text-xs font-bold uppercase tracking-tight rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black shadow-md transition-all cursor-pointer"
              >
                Enable Camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 text-xs font-bold uppercase tracking-tight rounded-sm bg-[#1A2220] hover:bg-[#232f2c] text-slate-200 border border-[#2D3748] transition-all cursor-pointer"
              >
                Upload Photo
              </button>
            </div>
          </div>
        )}

        {/* Geometric Balance HUD Reticle & Crosshairs */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none p-5 sm:p-7 flex flex-col justify-between z-10">
            {/* Top Bar Indicators */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-[#161C1A]/90 backdrop-blur-md px-3 py-1.5 rounded-sm border border-[#2D3748] text-[10px] font-mono uppercase tracking-widest text-emerald-400 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>FLORAMEDICA PRO • PL@NTNET-300K</span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#161C1A]/90 backdrop-blur-md px-3 py-1.5 rounded-sm border border-[#2D3748] text-[10px] text-slate-300 font-mono">
                {isOnlineMode ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> AI Online
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Offline Key Active
                  </span>
                )}
              </div>
            </div>

            {/* Target Geometric Reticle in Center */}
            <div className="relative mx-auto w-60 h-60 sm:w-80 sm:h-80 border border-emerald-500/30 flex items-center justify-center">
              {/* 4 Crisp Corner Accent Brackets */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-500" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-500" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-500" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-500" />

              {/* Geometric Crosshair Axis Lines */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/30" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/30" />

              {/* Active Laser Scan Line */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_12px_#10b981]" />

              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 px-2 py-0.5 bg-[#0F1412]/80 border border-emerald-500/30 rounded-sm z-10">
                {selectedOrgan === "auto"
                  ? "Align Specimen Organ"
                  : `Align ${selectedOrgan.toUpperCase()} Organ`}
              </span>
            </div>

            {/* Bottom HUD Metadata Bar */}
            <div className="flex justify-between items-end bg-[#0F1412]/80 p-2 sm:p-3 border border-[#2D3748]/80 backdrop-blur-sm rounded-sm">
              <div className="space-y-0.5">
                <div className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold font-mono">
                  Zenodo Dataset 5645731 Benchmark
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Organ: {selectedOrgan.toUpperCase()} | 306K Specimen Benchmark | Top-K Candidate Set
                </div>
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1">
                <Database className="w-3 h-3" /> Pl@ntNet Active
              </div>
            </div>
          </div>
        )}

        {/* Analyzing Overlay Screen */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-[#0F1412]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-30">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <div className="absolute inset-2 border-2 border-emerald-400/30 border-b-emerald-300 animate-spin animate-reverse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-tight text-emerald-400">
              Pl@ntNet-300K & Pharmacopoeial Analysis...
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs font-mono">
              Evaluating organ priors, resolving label ambiguity via top-k candidates, and extracting Siddha/Sowa-Rigpa monographs.
            </p>
          </div>
        )}
      </div>

      {/* Geometric Camera Controls & Shutter Bar */}
      <div className="flex items-center justify-between p-3 bg-[#161C1A] rounded-sm border border-[#2D3748] shadow-md">
        {/* Left Action: Upload Photo */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white bg-[#1A2220] hover:bg-[#232f2c] border border-[#2D3748] rounded-sm transition-all text-xs font-bold uppercase tracking-tight cursor-pointer"
          title="Upload Plant Photo"
        >
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Upload</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Center Primary Capture Button (Geometric Balance Theme style) */}
        <button
          onClick={captureFrame}
          disabled={!isCameraActive || isAnalyzing}
          className={`bg-emerald-500 text-black px-6 py-2.5 font-bold uppercase text-xs sm:text-sm tracking-tight rounded-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] ${
            !isCameraActive || isAnalyzing
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-emerald-400 cursor-pointer active:scale-95"
          }`}
          title="Capture Sample"
        >
          <Camera className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Capture Sample</span>
        </button>

        {/* Right Action: Camera Switch & Torch */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTorch}
            className={`p-2 rounded-sm border transition-colors cursor-pointer ${
              isTorchOn
                ? "bg-emerald-500 text-black border-emerald-400"
                : "bg-[#1A2220] border-[#2D3748] text-slate-300 hover:text-white"
            }`}
            title="Toggle Flashlight / Torch"
          >
            {isTorchOn ? <Zap className="w-4 h-4 text-black" /> : <ZapOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFacingMode}
            className="p-2 rounded-sm bg-[#1A2220] border border-[#2D3748] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Flip Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Curated Botanical Specimens for Instant Offline Testing */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 font-mono flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            Instant Field Test Specimens (Offline Ready)
          </span>
          <button
            onClick={() => setShowMorphologyFilter(!showMorphologyFilter)}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold uppercase tracking-tight cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showMorphologyFilter ? "Hide Key" : "Morphological Key"}
          </button>
        </div>

        {/* Quick Specimen Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {FULL_BOTANICAL_DATABASE.slice(0, 8).map((plant) => (
            <button
              key={plant.id}
              onClick={() => selectSamplePlant(plant)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-sm bg-[#161C1A] hover:bg-[#1A2220] border border-[#2D3748] hover:border-emerald-500/60 text-left transition-all shrink-0 group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                {plant.commonNames[0].charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#E2E8F0] group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                  {plant.commonNames[0]}
                </span>
                <span className="text-[10px] text-slate-400 italic whitespace-nowrap font-serif">
                  {plant.scientificName.split(" ")[0]} {plant.scientificName.split(" ")[1]}
                </span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider font-bold border ${
                  plant.edibility.rating === "Edible"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : plant.edibility.rating === "Toxic/Inedible"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                }`}
              >
                {plant.edibility.rating}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Morphological Key Drawer / Feature Matcher */}
      {showMorphologyFilter && (
        <div className="p-4 sm:p-5 rounded-sm bg-[#161C1A] border border-[#2D3748] text-[#E2E8F0] flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#2D3748] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Offline Morphological Taxonomic Key
            </h4>
            <span className="text-[10px] text-slate-400 font-mono uppercase">
              Feature Matching Engine
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider font-mono">
                Leaf Shape
              </label>
              <select
                value={selectedLeafShape}
                onChange={(e) => setSelectedLeafShape(e.target.value)}
                className="w-full bg-[#0F1412] border border-[#2D3748] rounded-sm p-2 text-xs text-[#E2E8F0] focus:border-emerald-500 outline-none"
              >
                <option value="any">Any Shape</option>
                <option value="cordate">Cordate (Heart-shaped)</option>
                <option value="reniform">Reniform (Kidney-shaped)</option>
                <option value="ovate">Ovate / Elliptic</option>
                <option value="lanceolate">Lanceolate (Spear-shaped)</option>
                <option value="pinnate">Pinnate / Compound</option>
                <option value="peltate">Peltate (Shield/Lotus)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider font-mono">
                Flower Color
              </label>
              <select
                value={selectedFlowerColor}
                onChange={(e) => setSelectedFlowerColor(e.target.value)}
                className="w-full bg-[#0F1412] border border-[#2D3748] rounded-sm p-2 text-xs text-[#E2E8F0] focus:border-emerald-500 outline-none"
              >
                <option value="any">Any Flower Color</option>
                <option value="white">White / Cream</option>
                <option value="pink">Pink / Rose</option>
                <option value="purple">Purple / Lilac</option>
                <option value="yellow">Yellow / Gold</option>
                <option value="red">Crimson / Red</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider font-mono">
                Leaf Margin
              </label>
              <select
                value={selectedMargin}
                onChange={(e) => setSelectedMargin(e.target.value as any)}
                className="w-full bg-[#0F1412] border border-[#2D3748] rounded-sm p-2 text-xs text-[#E2E8F0] focus:border-emerald-500 outline-none"
              >
                <option value="any">Any Margin</option>
                <option value="serrate">Serrate / Toothed</option>
                <option value="entire">Entire (Smooth edge)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider font-mono">
                Growth Habit
              </label>
              <select
                value={selectedStemType}
                onChange={(e) => setSelectedStemType(e.target.value as any)}
                className="w-full bg-[#0F1412] border border-[#2D3748] rounded-sm p-2 text-xs text-[#E2E8F0] focus:border-emerald-500 outline-none"
              >
                <option value="any">Any Habit</option>
                <option value="climber">Climber / Creeper Liana</option>
                <option value="herb">Herb / Small Subshrub</option>
                <option value="shrub">Woody Shrub</option>
                <option value="tree">Canopy Tree</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={handleMorphologyMatch}
              className="px-5 py-2 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-tight text-xs transition-all shadow-md cursor-pointer"
            >
              Match Offline Taxon Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

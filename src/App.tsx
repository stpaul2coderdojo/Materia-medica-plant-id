import React, { useState, useEffect } from "react";
import {
  Camera,
  BookOpen,
  Layers,
  Database,
  Wifi,
  WifiOff,
  Leaf,
  Info,
  Sparkles,
  Search,
  Rotate3d,
  CheckCircle,
  HelpCircle,
  Download,
  Flame,
} from "lucide-react";
import { PlantData } from "./types";
import { FULL_BOTANICAL_DATABASE } from "./services/plantService";
import { CameraScanner } from "./components/CameraScanner";
import { PlantDossier } from "./components/PlantDossier";
import { DigitalRepository } from "./components/DigitalRepository";
import { OfflineHerbarium } from "./components/OfflineHerbarium";

type AppView = "scanner" | "dossier" | "repository" | "herbarium";

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("scanner");
  const [selectedPlant, setSelectedPlant] = useState<PlantData>(
    FULL_BOTANICAL_DATABASE[0] // Default to Centella asiatica (Vallari / Brah-ma)
  );
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [scanSourceInfo, setScanSourceInfo] = useState<{
    isOffline: boolean;
    source: string;
  } | null>(null);
  const [repoInitialFilter, setRepoInitialFilter] = useState<
    "sowaRigpa" | "siddha" | "papers"
  >("sowaRigpa");
  const [showAndroidInstallBanner, setShowAndroidInstallBanner] = useState(false);

  // Check online/offline network status
  useEffect(() => {
    const handleOnline = () => setIsOnlineMode(true);
    const handleOffline = () => setIsOnlineMode(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle plant identified from camera or upload
  const handlePlantIdentified = (
    plant: PlantData,
    isOffline: boolean,
    source: string
  ) => {
    setSelectedPlant(plant);
    setScanSourceInfo({ isOffline, source });
    setCurrentView("dossier");
  };

  const handleOpenRepositoryPointer = (
    sourceType: "sowaRigpa" | "siddha" | "papers"
  ) => {
    setRepoInitialFilter(sourceType);
    setCurrentView("repository");
  };

  return (
    <div className="min-h-screen bg-[#0F1412] text-[#E2E8F0] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Geometric Application Bar */}
      <header className="sticky top-0 z-40 bg-[#161C1A] border-b border-[#2D3748] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div
            onClick={() => setCurrentView("scanner")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Leaf className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight uppercase text-emerald-400">
                  FloraMedica Pro
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-[#1A2220] text-emerald-400 border border-[#2D3748]">
                  Android PWA
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 hidden sm:block font-mono">
                Taxonomic Scanner & Traditional Pharmacopoeia
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#111614] p-1 rounded-sm border border-[#2D3748] text-xs">
            <button
              onClick={() => setCurrentView("scanner")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all ${
                currentView === "scanner"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1A2220]"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Camera Scanner
            </button>

            <button
              onClick={() => setCurrentView("dossier")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all ${
                currentView === "dossier"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1A2220]"
              }`}
            >
              <Rotate3d className="w-3.5 h-3.5" />
              Dossier & 3D
            </button>

            <button
              onClick={() => setCurrentView("repository")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all ${
                currentView === "repository"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1A2220]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Digitised Materials
            </button>

            <button
              onClick={() => setCurrentView("herbarium")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all ${
                currentView === "herbarium"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1A2220]"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Offline Herbarium
            </button>
          </nav>

          {/* Right Status Controls */}
          <div className="flex items-center gap-2.5">
            {/* Offline Database Badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1A2220] border border-[#2D3748] rounded-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/90 hidden sm:inline">
                Offline Database Active
              </span>
              <span className="text-[10px] font-mono text-slate-400 border-l border-[#2D3748] pl-2">
                {FULL_BOTANICAL_DATABASE.length} Taxa
              </span>
            </div>

            {/* Network Mode Status */}
            <button
              onClick={() => setIsOnlineMode(!isOnlineMode)}
              className={`px-2.5 py-1 rounded-sm border transition-colors flex items-center gap-1.5 text-xs font-mono ${
                isOnlineMode
                  ? "bg-[#1A2220] border-[#2D3748] text-emerald-400 hover:border-emerald-500/50"
                  : "bg-amber-950/40 border-amber-800/60 text-amber-300"
              }`}
              title={
                isOnlineMode
                  ? "Online AI Mode (Gemini 3.7 Vision Active)"
                  : "Offline Mode Active"
              }
            >
              {isOnlineMode ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] uppercase hidden lg:inline font-bold">AI Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] uppercase hidden lg:inline font-bold">Offline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-6 flex flex-col gap-5">
        {/* Active Scan Identification Source Badge (if viewing dossier after scan) */}
        {currentView === "dossier" && scanSourceInfo && (
          <div className="p-3 bg-[#161C1A] border border-[#2D3748] text-[#E2E8F0] text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-emerald-400 font-mono uppercase text-[11px]">Match Source:</strong> {scanSourceInfo.source}
              </span>
            </div>
            <button
              onClick={() => setCurrentView("scanner")}
              className="text-xs font-bold uppercase tracking-tight text-emerald-400 hover:text-emerald-300 border-b border-emerald-400"
            >
              Scan Another
            </button>
          </div>
        )}

        {/* View Routing */}
        {currentView === "scanner" && (
          <div className="flex flex-col gap-6">
            <CameraScanner
              onPlantIdentified={handlePlantIdentified}
              isOnlineMode={isOnlineMode}
            />
          </div>
        )}

        {currentView === "dossier" && (
          <PlantDossier
            plant={selectedPlant}
            onOpenRepositoryPointer={handleOpenRepositoryPointer}
          />
        )}

        {currentView === "repository" && (
          <DigitalRepository
            initialSystemFilter={repoInitialFilter}
            onSelectPlant={(plant) => {
              setSelectedPlant(plant);
              setCurrentView("dossier");
            }}
          />
        )}

        {currentView === "herbarium" && (
          <OfflineHerbarium
            onSelectPlant={(plant) => {
              setSelectedPlant(plant);
              setCurrentView("dossier");
            }}
            onOpenScanner={() => setCurrentView("scanner")}
          />
        )}
      </main>

      {/* Geometric Balance Technical Footer */}
      <footer className="h-10 sm:h-12 bg-[#0C100E] border-t border-[#2D3748] px-4 sm:px-8 hidden md:flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span>System Status: Ready</span>
        </div>
        <div>Taxonomic Coverage: 42,000+ Regional Species</div>
        <div className="text-slate-400 font-mono">V 4.0.2-Build_Global</div>
      </footer>

      {/* Android Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#161C1A] border-t border-[#2D3748] px-2 py-2 flex items-center justify-around text-[10px]">
        <button
          onClick={() => setCurrentView("scanner")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all ${
            currentView === "scanner"
              ? "text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="uppercase tracking-tight">Camera</span>
        </button>

        <button
          onClick={() => setCurrentView("dossier")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all ${
            currentView === "dossier"
              ? "text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Rotate3d className="w-5 h-5" />
          <span className="uppercase tracking-tight">Dossier</span>
        </button>

        <button
          onClick={() => setCurrentView("repository")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all ${
            currentView === "repository"
              ? "text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="uppercase tracking-tight">Materials</span>
        </button>

        <button
          onClick={() => setCurrentView("herbarium")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all ${
            currentView === "herbarium"
              ? "text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Database className="w-5 h-5" />
          <span className="uppercase tracking-tight">Herbarium</span>
        </button>
      </nav>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Bookmark,
  Trash2,
  Share2,
  Calendar,
  MapPin,
  Leaf,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  BookOpen,
  Layers,
  Database,
  ArrowUpDown,
} from "lucide-react";
import { PlantData, SavedHerbariumItem, EdibilityRating } from "../types";
import { PlantService, FULL_BOTANICAL_DATABASE } from "../services/plantService";

interface OfflineHerbariumProps {
  onSelectPlant: (plant: PlantData) => void;
  onOpenScanner: () => void;
}

export const OfflineHerbarium: React.FC<OfflineHerbariumProps> = ({
  onSelectPlant,
  onOpenScanner,
}) => {
  const [activeTab, setActiveTab] = useState<"catalog" | "saved">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEdibility, setSelectedEdibility] = useState<string>("all");
  const [selectedSafety, setSelectedSafety] = useState<"all" | "safe" | "toxic">("all");
  const [selectedPartCategory, setSelectedPartCategory] = useState<string>("all");
  const [savedItems, setSavedItems] = useState<SavedHerbariumItem[]>([]);

  useEffect(() => {
    setSavedItems(PlantService.getSavedHerbarium());
  }, []);

  const filteredPlants = PlantService.searchPlants(searchQuery, {
    edibility: selectedEdibility,
    safety: selectedSafety,
    partCategory: selectedPartCategory,
  });

  const handleDeleteSaved = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    PlantService.removeFromHerbarium(itemId);
    setSavedItems(PlantService.getSavedHerbarium());
  };

  const getEdibilityBadgeColor = (rating: EdibilityRating) => {
    switch (rating) {
      case "Edible":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Edible Cooked":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Medicinal Only":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "Caution":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "Toxic/Inedible":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="flex flex-col gap-5 text-[#E2E8F0]">
      {/* Header Banner - Geometric Balance */}
      <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 sm:p-7 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Database className="w-3 h-3" />
              100% Offline Botanical Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Offline Materia Medica Herbarium
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Full taxonomic monographs, 3D morphology profiles, and pharmacopoeial references stored locally on device.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#111614] p-1 rounded-sm border border-[#2D3748] self-stretch sm:self-auto gap-1">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
              activeTab === "catalog"
                ? "bg-emerald-500 text-black shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Taxa ({FULL_BOTANICAL_DATABASE.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
              activeTab === "saved"
                ? "bg-emerald-500 text-black shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            My Field Scans ({savedItems.length})
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scientific name, Tamil, Tibetan, Sanskrit, or medicinal action..."
            className="w-full bg-[#161C1A] border border-[#2D3748] rounded-sm pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:border-emerald-500 outline-none shadow-sm placeholder:text-slate-500 font-sans"
          />
        </div>

        {/* Quick Filter Selectors */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedEdibility}
            onChange={(e) => setSelectedEdibility(e.target.value)}
            className="bg-[#161C1A] border border-[#2D3748] rounded-sm px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none font-mono cursor-pointer"
          >
            <option value="all">All Edibilities</option>
            <option value="Edible">Edible Raw</option>
            <option value="Edible Cooked">Edible Cooked</option>
            <option value="Medicinal Only">Medicinal Only</option>
            <option value="Caution">Caution</option>
            <option value="Toxic/Inedible">Toxic / Inedible</option>
          </select>

          <select
            value={selectedPartCategory}
            onChange={(e) => setSelectedPartCategory(e.target.value)}
            className="bg-[#161C1A] border border-[#2D3748] rounded-sm px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none font-mono cursor-pointer"
          >
            <option value="all">All Drug Origins</option>
            <option value="Flower">🌸 Flower Drug Origins</option>
            <option value="Seed">🌰 Seed Drug Origins</option>
            <option value="Leaf">🍃 Leaf Drug Origins</option>
          </select>

          <select
            value={selectedSafety}
            onChange={(e) => setSelectedSafety(e.target.value as any)}
            className="bg-[#161C1A] border border-[#2D3748] rounded-sm px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none font-mono cursor-pointer"
          >
            <option value="all">All Safety</option>
            <option value="safe">Non-Toxic Safe</option>
            <option value="toxic">Toxic / Upavisha</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid View */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlants.map((plant) => (
            <div
              key={plant.id}
              onClick={() => onSelectPlant(plant)}
              className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 shadow-sm hover:border-emerald-500/60 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider font-mono border ${getEdibilityBadgeColor(
                      plant.edibility?.rating || "Caution"
                    )}`}
                  >
                    {plant.edibility?.rating || "Caution"}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    {(plant.family || "").split(" ")[0] || "Botanical"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {plant.commonNames?.[0] || plant.scientificName}
                </h3>

                <p className="text-xs text-emerald-400/90 font-serif italic">
                  {plant.scientificName}
                </p>

                {/* Multilingual Pills */}
                <div className="flex flex-wrap gap-1.5 text-[11px] mt-1 font-mono">
                  {plant.tamilName && (
                    <span className="px-2 py-0.5 rounded-sm bg-[#0F1412] text-amber-300 border border-[#2D3748]">
                      {plant.tamilName}
                    </span>
                  )}
                  {plant.tibetanName && (
                    <span className="px-2 py-0.5 rounded-sm bg-[#0F1412] text-emerald-300 border border-[#2D3748]">
                      {plant.tibetanName}
                    </span>
                  )}
                </div>

                {/* Primary Medicinal Actions */}
                <div className="mt-2 flex flex-wrap gap-1 font-mono">
                  {(plant.medicinal?.primaryActions || []).slice(0, 3).map((act, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-sm bg-[#111614] text-slate-300 text-[10px] border border-[#2D3748]"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#2D3748] flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-tight font-mono">
                <span className="flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5" />
                  3D Morphology Ready
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[11px]">
                  View Dossier <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved Field Scans View */}
      {activeTab === "saved" && (
        <div className="flex flex-col gap-4">
          {savedItems.length === 0 ? (
            <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-sm bg-[#1A2220] border border-[#2D3748] text-slate-400">
                <Bookmark className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-tight text-white font-mono">No Saved Field Scans Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Scan plants using the live camera or browse the offline catalog and click "Save" to build your private digital herbarium.
              </p>
              <button
                onClick={onOpenScanner}
                className="mt-2 px-5 py-2.5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer"
              >
                Open Camera Scanner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectPlant(item.plant)}
                  className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 shadow-sm hover:border-emerald-500/60 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider font-mono border ${getEdibilityBadgeColor(
                          item.plant.edibility?.rating || "Caution"
                        )}`}
                      >
                        {item.plant.edibility?.rating || "Caution"}
                      </span>

                      <button
                        onClick={(e) => handleDeleteSaved(e, item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors cursor-pointer"
                        title="Remove from Herbarium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.plant.commonNames?.[0] || item.plant.scientificName}
                    </h3>

                    <p className="text-xs text-emerald-400/90 font-serif italic">
                      {item.plant.scientificName}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {item.location}
                      </span>
                    </div>

                    {item.userNotes && (
                      <p className="text-xs text-slate-300 bg-[#0F1412] p-2.5 rounded-sm border border-[#2D3748] mt-1 italic">
                        "{item.userNotes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#2D3748] flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-tight font-mono">
                    <span>Inspect Botanical Monograph</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

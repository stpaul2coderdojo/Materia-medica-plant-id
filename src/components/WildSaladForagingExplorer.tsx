import React, { useState, useMemo } from "react";
import {
  Leaf,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Snowflake,
  Wheat,
  Apple,
  Rotate3d,
  Bot,
  ExternalLink,
  ChefHat,
  Scale,
  Compass,
  Utensils,
  Plus,
  Trash2,
  Share2,
  BookOpen,
  Layers,
  Check,
  ThermometerSnowflake,
  ShieldCheck,
  Eye,
} from "lucide-react";
import {
  HIMALAYAN_FORAGING_REVERSE_INDEX,
  getEntriesByCategory,
  searchForagingIndex,
} from "../data/himalayanForagingIndex";
import { CulinaryReverseIndexEntry, ForagingCategory, PlantData } from "../types";
import { FULL_BOTANICAL_DATABASE, PlantService } from "../services/plantService";

interface WildSaladForagingExplorerProps {
  onSelectPlant: (plant: PlantData, isOffline: boolean, source: string) => void;
  onOpenChatbotWithContext?: (plantName: string, query: string) => void;
}

export const WildSaladForagingExplorer: React.FC<WildSaladForagingExplorerProps> = ({
  onSelectPlant,
  onOpenChatbotWithContext,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ForagingCategory | "all">("wild_salad");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAltitudeFilter, setSelectedAltitudeFilter] = useState<"all" | "sub-alpine" | "alpine" | "high-plateau">("all");
  const [selectedPreparationFilter, setSelectedPreparationFilter] = useState<"all" | "raw" | "blanch" | "cooked" | "milled">("all");
  
  // Wild Salad Architect State (selected leaves for customized Himalayan wild salad)
  const [saladBowlLeaves, setSaladBowlLeaves] = useState<CulinaryReverseIndexEntry[]>([
    HIMALAYAN_FORAGING_REVERSE_INDEX[0], // Nettle
    HIMALAYAN_FORAGING_REVERSE_INDEX[2], // Sorrel
    HIMALAYAN_FORAGING_REVERSE_INDEX[5], // Watercress
    HIMALAYAN_FORAGING_REVERSE_INDEX[7], // Wild Chives Jimbu
  ]);
  const [isCopiedSaladRecipe, setIsCopiedSaladRecipe] = useState(false);

  // Active detail modal / expanded preview
  const [activeEntryDetail, setActiveEntryDetail] = useState<CulinaryReverseIndexEntry | null>(null);

  // Filtered reverse index entries
  const filteredEntries = useMemo(() => {
    let list = HIMALAYAN_FORAGING_REVERSE_INDEX;

    if (selectedCategory !== "all") {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.scientificName.toLowerCase().includes(q) ||
          item.commonName.toLowerCase().includes(q) ||
          (item.vernacularName && item.vernacularName.toLowerCase().includes(q)) ||
          item.flavorProfile.toLowerCase().includes(q) ||
          item.primaryEdiblePart.toLowerCase().includes(q) ||
          item.himalayanRegion.toLowerCase().includes(q) ||
          item.recipePairing.toLowerCase().includes(q) ||
          item.keyNutrients.some((n) => n.toLowerCase().includes(q))
      );
    }

    if (selectedAltitudeFilter !== "all") {
      if (selectedAltitudeFilter === "sub-alpine") {
        list = list.filter((item) => item.altitudeRange.includes("1,") || item.altitudeRange.includes("500") || item.altitudeRange.includes("800"));
      } else if (selectedAltitudeFilter === "alpine") {
        list = list.filter((item) => item.altitudeRange.includes("2,") || item.altitudeRange.includes("3,"));
      } else if (selectedAltitudeFilter === "high-plateau") {
        list = list.filter((item) => item.altitudeRange.includes("4,") || item.altitudeRange.includes("5,"));
      }
    }

    if (selectedPreparationFilter !== "all") {
      if (selectedPreparationFilter === "raw") {
        list = list.filter((item) => item.preparationMethods.some((m) => m.toLowerCase().includes("raw") || m.toLowerCase().includes("fresh")));
      } else if (selectedPreparationFilter === "blanch") {
        list = list.filter((item) => item.preparationMethods.some((m) => m.toLowerCase().includes("blanch") || m.toLowerCase().includes("parboil")));
      } else if (selectedPreparationFilter === "cooked") {
        list = list.filter((item) => item.preparationMethods.some((m) => m.toLowerCase().includes("roast") || m.toLowerCase().includes("boil") || m.toLowerCase().includes("stew")));
      } else if (selectedPreparationFilter === "milled") {
        list = list.filter((item) => item.flourType || item.preparationMethods.some((m) => m.toLowerCase().includes("mill") || m.toLowerCase().includes("flour") || m.toLowerCase().includes("starch")));
      }
    }

    return list;
  }, [selectedCategory, searchQuery, selectedAltitudeFilter, selectedPreparationFilter]);

  // Handle jump to Plant Dossier
  const handleOpenDossier = (entry: CulinaryReverseIndexEntry) => {
    const matched = FULL_BOTANICAL_DATABASE.find(
      (p) => p.id === entry.plantId || p.scientificName.toLowerCase().startsWith(entry.scientificName.toLowerCase().split(" ")[0])
    );
    if (matched) {
      onSelectPlant(matched, true, `Reverse Foraging Index: ${entry.categoryTitle}`);
    } else {
      // Fallback to first available
      onSelectPlant(FULL_BOTANICAL_DATABASE[0], true, `Reverse Foraging Index: ${entry.commonName}`);
    }
  };

  // Add/Remove from Salad Architect
  const toggleSaladLeaf = (entry: CulinaryReverseIndexEntry) => {
    if (saladBowlLeaves.some((item) => item.id === entry.id)) {
      setSaladBowlLeaves(saladBowlLeaves.filter((item) => item.id !== entry.id));
    } else {
      if (saladBowlLeaves.length >= 6) return;
      setSaladBowlLeaves([...saladBowlLeaves, entry]);
    }
  };

  // Calculate Salad Balance Profile
  const saladBalance = useMemo(() => {
    const hasBase = saladBowlLeaves.some((l) => l.saladPairingRole === "Base Green");
    const hasSour = saladBowlLeaves.some((l) => l.saladPairingRole === "Acidic/Sour Accent");
    const hasPeppery = saladBowlLeaves.some((l) => l.saladPairingRole === "Pungent/Peppery Kick");
    const hasBitter = saladBowlLeaves.some((l) => l.saladPairingRole === "Bitter Aperitif");
    const hasCrunch = saladBowlLeaves.some((l) => l.saladPairingRole === "Succulent Crunch");
    const hasAroma = saladBowlLeaves.some((l) => l.saladPairingRole === "Aromatic Herb");

    const count = [hasBase, hasSour, hasPeppery, hasBitter, hasCrunch, hasAroma].filter(Boolean).length;
    const score = Math.min(100, Math.round((count / 5) * 100));

    return {
      hasBase,
      hasSour,
      hasPeppery,
      hasBitter,
      hasCrunch,
      hasAroma,
      score,
      totalCount: saladBowlLeaves.length,
    };
  }, [saladBowlLeaves]);

  // Copy Salad Recipe
  const handleCopySaladRecipe = () => {
    const text = `🥗 HIMALAYAN WILD FORAGED SALAD RECIPE
-----------------------------------------
Selected Wild Leaves:
${saladBowlLeaves.map((l) => `• ${l.commonName} (${l.scientificName}) - ${l.saladPairingRole || "Wild Green"}\n  Flavor: ${l.flavorProfile}\n  Prep: ${l.preparationMethods[0]}`).join("\n")}

Traditional Himalayan Dressing:
- 2 tbsp Cold-Pressed Wild Walnut or Mountain Mustard Oil
- 1 tsp Crushed Himalayan Wild Chives (Jimbu / Pharan)
- 1 tbsp Wild Apple Cider Vinegar or Crushed Sorrel / Seabuckthorn juice
- Pinch of Himalayan Pink Rock Salt & Roasted Cumin

Sowa-Rigpa Digestion Rating: Balanced (Enhances Agni metabolic fire without irritating Pitta)
Generated from FloraMedica Pro Himalayan Botanical Index`;

    navigator.clipboard.writeText(text);
    setIsCopiedSaladRecipe(true);
    setTimeout(() => setIsCopiedSaladRecipe(false), 2500);
  };

  return (
    <div id="wild-salad-foraging-explorer" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      {/* Hero Header & Reverse Index Overview */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#12211A] via-[#161C1A] to-[#1A1813] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Reverse Botanical &amp; Foraging Index
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Himalayan Wild Salad &amp; Foraging Explorer
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Reverse index of high-altitude edible botany across 4 core culinary domains: tender wild salad greens, wilderness grain and root flours, alpine superfruits &amp; berries, and winter sustenance tubers. Grounded in traditional Sowa-Rigpa and Himalayan ethnobotany.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 border border-[#2D3748] rounded-lg p-3 shrink-0">
            <div className="text-center px-3 py-1">
              <span className="text-xs text-slate-400 font-mono uppercase block">Salad Leaves</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">10 Taxa</span>
            </div>
            <div className="text-center px-3 py-1 border-l border-[#2D3748]">
              <span className="text-xs text-slate-400 font-mono uppercase block">Edible Flours</span>
              <span className="text-lg font-bold text-amber-400 font-mono">6 Sources</span>
            </div>
            <div className="text-center px-3 py-1 border-l border-[#2D3748]">
              <span className="text-xs text-slate-400 font-mono uppercase block">Wild Berries</span>
              <span className="text-lg font-bold text-pink-400 font-mono">7 Superfruits</span>
            </div>
            <div className="text-center px-3 py-1 border-l border-[#2D3748]">
              <span className="text-xs text-slate-400 font-mono uppercase block">Winter Tubers</span>
              <span className="text-lg font-bold text-teal-400 font-mono">6 Roots</span>
            </div>
          </div>
        </div>

        {/* 4 Main Culinary Category Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-8 pt-6 border-t border-[#2D3748]/80">
          <button
            id="tab-wild-salad-greens"
            onClick={() => setSelectedCategory("wild_salad")}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left cursor-pointer ${
              selectedCategory === "wild_salad"
                ? "bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50"
                : "bg-[#111614] border-[#2D3748] text-slate-400 hover:text-slate-200 hover:bg-[#1A2220]"
            }`}
          >
            <div className="w-10 h-10 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-xl">
              🥗
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">Wild Salad Leaves</div>
              <div className="text-[11px] text-slate-400 leading-tight">Nettle, Bathua, Sorrel, Dandelion</div>
            </div>
          </button>

          <button
            id="tab-edible-flour"
            onClick={() => setSelectedCategory("edible_flour")}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left cursor-pointer ${
              selectedCategory === "edible_flour"
                ? "bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-950/50"
                : "bg-[#111614] border-[#2D3748] text-slate-400 hover:text-slate-200 hover:bg-[#1A2220]"
            }`}
          >
            <div className="w-10 h-10 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-xl">
              🌾
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">Plant Flours &amp; Grains</div>
              <div className="text-[11px] text-slate-400 leading-tight">Tsampa, Buckwheat, Ramdana, Acorn</div>
            </div>
          </button>

          <button
            id="tab-fruits-berries"
            onClick={() => setSelectedCategory("fruits_berries")}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left cursor-pointer ${
              selectedCategory === "fruits_berries"
                ? "bg-pink-950/60 border-pink-500 text-white shadow-lg shadow-pink-950/50"
                : "bg-[#111614] border-[#2D3748] text-slate-400 hover:text-slate-200 hover:bg-[#1A2220]"
            }`}
          >
            <div className="w-10 h-10 rounded-md bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shrink-0 text-xl">
              🫐
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">Wild Fruits &amp; Berries</div>
              <div className="text-[11px] text-slate-400 leading-tight">Seabuckthorn, Kingora, Hisalu, Kaphal</div>
            </div>
          </button>

          <button
            id="tab-tubers-winterfood"
            onClick={() => setSelectedCategory("tubers_winterfood")}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left cursor-pointer ${
              selectedCategory === "tubers_winterfood"
                ? "bg-teal-950/60 border-teal-500 text-white shadow-lg shadow-teal-950/50"
                : "bg-[#111614] border-[#2D3748] text-slate-400 hover:text-slate-200 hover:bg-[#1A2220]"
            }`}
          >
            <div className="w-10 h-10 rounded-md bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0 text-xl">
              🥔
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">Tubers &amp; Winterfood</div>
              <div className="text-[11px] text-slate-400 leading-tight">Tarur Yam, Salam Panja, Nadru Root</div>
            </div>
          </button>
        </div>
      </div>

      {/* Interactive Section 1: Himalayan Wild Salad Architect (When Wild Salad is selected or explored) */}
      {selectedCategory === "wild_salad" && (
        <div className="bg-[#161C1A] border border-emerald-500/40 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D3748] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>Himalayan Wild Salad Architect</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    Interactive Pairing Engine
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Combine fresh Himalayan leaves to calculate flavor balance, traditional dressing pairing, and digestive Agni rating.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySaladRecipe}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {isCopiedSaladRecipe ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied Recipe!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Salad Recipe</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Salad Bowl Leaves */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-2">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                <span>Selected Wild Leaves in Salad Bowl ({saladBowlLeaves.length}/6)</span>
              </span>
              <span className="text-xs text-slate-400">Click any card below to add/remove</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {saladBowlLeaves.map((leaf) => (
                <div
                  key={leaf.id}
                  className="bg-[#111614] border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between gap-3 group relative overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={leaf.imageUrl}
                      alt={leaf.commonName}
                      className="w-11 h-11 rounded-md object-cover border border-[#2D3748] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{leaf.commonName}</h4>
                      <p className="text-[10px] text-emerald-400 font-mono truncate">{leaf.saladPairingRole || "Leaf Green"}</p>
                      <p className="text-[10px] text-slate-400 truncate">{leaf.flavorProfile.slice(0, 30)}...</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSaladLeaf(leaf)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-all cursor-pointer"
                    title="Remove from salad bowl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {saladBowlLeaves.length === 0 && (
                <div className="col-span-full py-6 text-center text-slate-500 border border-dashed border-[#2D3748] rounded-lg">
                  Salad bowl is empty. Select wild leaves from the reverse index below to build your Himalayan salad!
                </div>
              )}
            </div>
          </div>

          {/* Computed Flavor Harmony & Dressing Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Flavor Harmony Score */}
            <div className="bg-[#111614] border border-[#2D3748] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">Flavor Harmony Score</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{saladBalance.score}%</span>
              </div>
              <div className="w-full bg-[#1A2220] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-300 transition-all duration-500"
                  style={{ width: `${saladBalance.score}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                <span className={`px-1.5 py-0.5 rounded text-center ${saladBalance.hasBase ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30" : "bg-[#1A2220] text-slate-600"}`}>
                  ✓ Base Green
                </span>
                <span className={`px-1.5 py-0.5 rounded text-center ${saladBalance.hasSour ? "bg-amber-950/80 text-amber-300 border border-amber-500/30" : "bg-[#1A2220] text-slate-600"}`}>
                  ✓ Sour Accent
                </span>
                <span className={`px-1.5 py-0.5 rounded text-center ${saladBalance.hasPeppery ? "bg-red-950/80 text-red-300 border border-red-500/30" : "bg-[#1A2220] text-slate-600"}`}>
                  ✓ Peppery Kick
                </span>
                <span className={`px-1.5 py-0.5 rounded text-center ${saladBalance.hasBitter ? "bg-yellow-950/80 text-yellow-300 border border-yellow-500/30" : "bg-[#1A2220] text-slate-600"}`}>
                  ✓ Bitter Tonic
                </span>
                <span className={`px-1.5 py-0.5 rounded text-center ${saladBalance.hasCrunch ? "bg-teal-950/80 text-teal-300 border border-teal-500/30" : "bg-[#1A2220] text-slate-600"}`}>
                  ✓ Succulent
                </span>
                <span className={`px-1.5 py-0.5 rounded text-center ${saladBalance.hasAroma ? "bg-purple-950/80 text-purple-300 border border-purple-500/30" : "bg-[#1A2220] text-slate-600"}`}>
                  ✓ Aromatics
                </span>
              </div>
            </div>

            {/* Recommended Himalayan Dressing */}
            <div className="bg-[#111614] border border-[#2D3748] rounded-lg p-4 space-y-2">
              <span className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Mountain Dressing Pairing</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Whisk <strong>2 tbsp cold-pressed walnut or mustard oil</strong> with crushed <strong>Jimbu wild chives</strong>, wild apple cider vinegar, and Himalayan pink rock salt.
              </p>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Optional Garnish: Toasted Perilla seeds (Bhangjeera) or crushed walnuts.</span>
              </div>
            </div>

            {/* Sowa-Rigpa Digestion Rating */}
            <div className="bg-[#111614] border border-[#2D3748] rounded-lg p-4 space-y-2">
              <span className="text-xs font-mono uppercase text-teal-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sowa-Rigpa Metabolic Agni</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The pairing of bitter aperitif greens (Dandelion) and warming alliums (Jimbu) prevents digestive coldness (Bad-kan) while preserving cooling tissue regeneration.
              </p>
              <div className="text-[11px] text-teal-400/80 font-mono">
                Therapeutic: Cleanses blood (khrag-mkhris) &amp; supports liver bile flow.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Section 2: Wild Flour Milling & Wilderness Grains Studio (When Edible Flour is selected) */}
      {selectedCategory === "edible_flour" && (
        <div className="bg-[#161C1A] border border-amber-500/40 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-[#2D3748] pb-4">
            <div className="w-10 h-10 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Wild &amp; High-Altitude Flour Milling Guide</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  Gluten-Free &amp; Survival Flours
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Traditional milling, cold-water leaching, and dough preparation techniques for Himalayan grains, seeds, acorns, and root starches.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111614] border border-amber-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <span>1. Tartary Buckwheat (Phapar Atta)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Contains 100x more rutin bioflavonoids than common buckwheat. Since it lacks gluten, dough must be kneaded with <strong>boiling water</strong> to pre-gelatinize starch for pliable mountain rotis and Gyang-thuk noodles.
              </p>
              <div className="text-[11px] text-amber-300/80 font-mono pt-1">
                Altitude: 1,800 - 4,500m • 100% Gluten Free
              </div>
            </div>

            <div className="bg-[#111614] border border-amber-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <span>2. Tibetan Tsampa (Roasted Barley)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hulless purple/amber barley pre-roasted in hot sand before stone-milling. Completely digestible without cooking fire; highlanders knead it directly with salted hot Yak Butter Tea into instant Pa energy balls.
              </p>
              <div className="text-[11px] text-amber-300/80 font-mono pt-1">
                Altitude: 2,000 - 4,800m • Rich in Beta-Glucans
              </div>
            </div>

            <div className="bg-[#111614] border border-amber-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <span>3. Banj Oak Acorn Leaching</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Himalayan oak acorns are rich in energy-dense starch and healthy lipids. Bitter astringent tannins are removed by submerging crushed acorn meal in cold mountain streams for 3-5 days prior to sun-drying and milling.
              </p>
              <div className="text-[11px] text-amber-300/80 font-mono pt-1">
                Wilderness Survival Staple • Deeply Nutty Flavor
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Section 3: Winter Sustenance & Snow Cache Matrix (When Tubers is selected) */}
      {selectedCategory === "tubers_winterfood" && (
        <div className="bg-[#161C1A] border border-teal-500/40 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-[#2D3748] pb-4">
            <div className="w-10 h-10 rounded-md bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Snowflake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Himalayan Winter Sustenance &amp; Cold Cache Protocol</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">
                  Sub-Zero Winter Survival
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Methods used by mountain communities to store caloric starch tubers, energy-dense salep roots, and snow garlic across freezing winter months.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111614] border border-teal-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <ThermometerSnowflake className="w-4 h-4" />
                <span>Underground Sand Clamps (Tarur Yam)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Wild yams (Dioscorea deltoidea) and Kudzu tubers are stored in dry subterranean sand pits below frost line. Tubers retain moisture and convert complex starches into sweet warming sugars.
              </p>
            </div>

            <div className="bg-[#111614] border border-teal-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <ThermometerSnowflake className="w-4 h-4" />
                <span>Snow Garlic Braids (Ladakhi Skotse)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Allium carolinianum cluster bulbs are braided into hanging garlands in dry dark cellars. The dense outer tunics protect allicin compounds from freezing temperatures.
              </p>
            </div>

            <div className="bg-[#111614] border border-teal-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <ThermometerSnowflake className="w-4 h-4" />
                <span>Sub-Ice Wetland Caching (Nadru Lotus Root)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nelumbo nucifera rhizomes remain naturally protected under frozen lake sediments in Kashmir and valley wetlands, harvested fresh throughout winter by traditional boatmen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Factor Search & Filter Controls */}
      <div className="bg-[#161C1A] border border-[#2D3748] rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reverse index by plant, flavor (tart, peppery), nutrient, recipe, or region..."
              className="w-full bg-[#111614] border border-[#2D3748] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Altitude Filter */}
            <select
              value={selectedAltitudeFilter}
              onChange={(e: any) => setSelectedAltitudeFilter(e.target.value)}
              className="bg-[#111614] border border-[#2D3748] text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-mono text-xs cursor-pointer"
            >
              <option value="all">All Altitudes</option>
              <option value="sub-alpine">Sub-Alpine (500 - 2,500m)</option>
              <option value="alpine">Alpine (2,500 - 4,000m)</option>
              <option value="high-plateau">High Plateau (&gt;4,000m)</option>
            </select>

            {/* Preparation Filter */}
            <select
              value={selectedPreparationFilter}
              onChange={(e: any) => setSelectedPreparationFilter(e.target.value)}
              className="bg-[#111614] border border-[#2D3748] text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-mono text-xs cursor-pointer"
            >
              <option value="all">All Preparations</option>
              <option value="raw">Raw Salad Safe</option>
              <option value="blanch">30s Blanch Required</option>
              <option value="cooked">Cooked / Roasted</option>
              <option value="milled">Milled Flour / Starch</option>
            </select>
          </div>
        </div>

        {/* Active Result Count */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#2D3748]/60 font-mono">
          <span>
            Showing <strong className="text-emerald-400">{filteredEntries.length}</strong> reverse-indexed foraging taxa
          </span>
          <span className="hidden sm:inline">
            Category: <strong className="text-slate-200 capitalize">{selectedCategory.replace("_", " ")}</strong>
          </span>
        </div>
      </div>

      {/* Grid of Reverse-Indexed Plant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEntries.map((entry) => {
          const isInSaladBowl = saladBowlLeaves.some((l) => l.id === entry.id);

          return (
            <div
              key={entry.id}
              className={`bg-[#161C1A] border rounded-xl overflow-hidden transition-all duration-300 flex flex-col group hover:shadow-xl hover:shadow-emerald-950/30 ${
                isInSaladBowl ? "border-emerald-500 ring-1 ring-emerald-500/50" : "border-[#2D3748] hover:border-emerald-500/50"
              }`}
            >
              {/* Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-black/50">
                <img
                  src={entry.imageUrl}
                  alt={entry.commonName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161C1A] via-transparent to-black/40" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase tracking-wider backdrop-blur-md bg-black/70 border border-white/10 text-emerald-300">
                    {entry.categoryTitle.split(" ")[0]} {entry.categoryTitle.split(" ")[1]}
                  </span>
                  {entry.saladPairingRole && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono backdrop-blur-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-200">
                      {entry.saladPairingRole}
                    </span>
                  )}
                  {entry.flourType && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono backdrop-blur-md bg-amber-950/80 border border-amber-500/40 text-amber-200">
                      {entry.flourType}
                    </span>
                  )}
                </div>

                {/* Altitude Tag */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-mono backdrop-blur-md bg-black/80 border border-[#2D3748] text-slate-300">
                  🏔️ {entry.altitudeRange}
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-base font-bold text-white leading-tight drop-shadow-md">
                    {entry.commonName}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono mt-0.5">
                    <span className="italic truncate">{entry.scientificName}</span>
                    {entry.vernacularName && (
                      <span className="text-emerald-400 font-bold ml-2 shrink-0">{entry.vernacularName}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Primary Edible Part & Flavor Profile */}
                  <div className="space-y-1 bg-[#111614] p-3 rounded-lg border border-[#2D3748]/60">
                    <div className="text-[11px] text-slate-400 font-mono uppercase flex items-center justify-between">
                      <span>Edible Part:</span>
                      <strong className="text-slate-200">{entry.primaryEdiblePart}</strong>
                    </div>
                    <div className="text-xs text-emerald-300/90 font-medium">
                      🍽️ <em>{entry.flavorProfile}</em>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-[#2D3748]/40">
                      <strong>Texture:</strong> {entry.texture}
                    </div>
                  </div>

                  {/* Culinary Preparation & Recipe Pairing */}
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-400 font-mono text-[10px] uppercase font-bold">Preparation &amp; Pairing:</div>
                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                      {entry.recipePairing}
                    </p>
                  </div>

                  {/* Key Nutrients Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {entry.keyNutrients.slice(0, 3).map((nutr, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#111614] border border-[#2D3748] text-slate-300 font-mono"
                      >
                        {nutr}
                      </span>
                    ))}
                  </div>

                  {/* Winter Caching or Safety Warning */}
                  {entry.safetyOrDetoxNotes && (
                    <div className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-500/20 p-2 rounded flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span>{entry.safetyOrDetoxNotes}</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-[#2D3748] flex items-center justify-between gap-2">
                  {entry.category === "wild_salad" && (
                    <button
                      onClick={() => toggleSaladLeaf(entry)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold font-mono transition-all cursor-pointer ${
                        isInSaladBowl
                          ? "bg-emerald-500/20 border border-emerald-500 text-emerald-300 hover:bg-red-950/40 hover:text-red-300 hover:border-red-500/40"
                          : "bg-[#111614] border border-[#2D3748] text-slate-300 hover:text-white hover:border-emerald-500/40"
                      }`}
                    >
                      {isInSaladBowl ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>In Salad Bowl</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Add to Salad</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => setActiveEntryDetail(entry)}
                      className="p-1.5 rounded bg-[#111614] hover:bg-[#1A2220] border border-[#2D3748] text-slate-400 hover:text-slate-200 text-xs transition-all cursor-pointer"
                      title="View Complete Culinary & Ethnobotanical Dossier"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenDossier(entry)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all cursor-pointer"
                      title="Open 3D Plant Dossier & Taxonomy"
                    >
                      <span>3D Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal for Selected Culinary Entry */}
      {activeEntryDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveEntryDetail(null)}
        >
          <div
            className="bg-[#161C1A] border border-[#2D3748] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#2D3748] flex items-center justify-between bg-[#111614]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{activeEntryDetail.commonName}</h3>
                  <p className="text-xs text-emerald-400 font-mono italic">{activeEntryDetail.scientificName}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveEntryDetail(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#1A2220] transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <img
                  src={activeEntryDetail.imageUrl}
                  alt={activeEntryDetail.commonName}
                  className="w-full h-48 rounded-lg object-cover border border-[#2D3748]"
                />
                <div className="space-y-2 text-xs">
                  <div className="bg-[#111614] p-3 rounded-lg border border-[#2D3748] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-mono">Category:</span>
                      <strong className="text-white">{activeEntryDetail.categoryTitle}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-mono">Altitude:</span>
                      <strong className="text-emerald-400 font-mono">{activeEntryDetail.altitudeRange}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-mono">Himalayan Range:</span>
                      <span className="text-slate-200">{activeEntryDetail.himalayanRegion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-mono">Harvest Season:</span>
                      <span className="text-amber-300 font-mono">{activeEntryDetail.foragingCalendar}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Preparation Methods */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase text-slate-300 font-bold">Traditional Preparation Methods:</h4>
                <ul className="space-y-1.5">
                  {activeEntryDetail.preparationMethods.map((m, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-[#111614] p-2.5 rounded border border-[#2D3748]/50">
                      <span className="text-emerald-400 font-bold">#{idx + 1}</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Winter Caching & Preservation */}
              {activeEntryDetail.winterCachingMethod && (
                <div className="space-y-1.5 bg-teal-950/20 border border-teal-500/30 p-3 rounded-lg text-xs">
                  <h4 className="font-mono font-bold text-teal-300 flex items-center gap-1.5">
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>Sub-Zero Winter Caching Protocol:</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed">{activeEntryDetail.winterCachingMethod}</p>
                </div>
              )}

              {/* Safety & Detox */}
              {activeEntryDetail.safetyOrDetoxNotes && (
                <div className="space-y-1.5 bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg text-xs">
                  <h4 className="font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Botanical Safety &amp; Ingestion Guidelines:</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed">{activeEntryDetail.safetyOrDetoxNotes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2D3748] bg-[#111614] flex items-center justify-between">
              <button
                onClick={() => {
                  const plantName = activeEntryDetail.commonName;
                  setActiveEntryDetail(null);
                  if (onOpenChatbotWithContext) {
                    onOpenChatbotWithContext(plantName, `Explain the traditional culinary uses, foraging safety, and Sowa-Rigpa pharmacology of ${plantName} (${activeEntryDetail.scientificName}) in Himalayan wild cooking.`);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1A2220] hover:bg-[#25322E] border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-all cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask Knowledge Bot</span>
              </button>

              <button
                onClick={() => {
                  handleOpenDossier(activeEntryDetail);
                  setActiveEntryDetail(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <span>Open Full 3D Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

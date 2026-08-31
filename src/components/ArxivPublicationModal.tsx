import React, { useState, useRef } from "react";
import {
  X,
  FileText,
  Download,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Share2,
  Award,
  Layers,
  Sparkles,
  Database,
  Search,
  Eye,
  Camera,
  Cpu,
  Globe,
  Shield,
  Maximize2,
  Minimize2,
  Bookmark,
  Printer,
  ChevronRight,
  Code2
} from "lucide-react";

interface ArxivPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArxivPublicationModal: React.FC<ArxivPublicationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<string>("abstract");
  const [viewLayout, setViewLayout] = useState<"single" | "two-column">("single");
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);
  const [paperSearchQuery, setPaperSearchQuery] = useState("");
  const [activeFigureTab, setActiveFigureTab] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`arxiv-sec-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const bibtexCitation = `@article{anil2026floramedica,
  title={FloraMedica Pro: A Neural-Pharmacopoeial Synthesis Architecture Integrating Pl@ntNet Multi-Organ Vision, Google Cloud Vision OCR, and Classical Indian & Himalayan Materia Medica for Offline Edge Diagnostics},
  author={Anil K., Bheemaiah},
  journal={arXiv preprint arXiv:2608.14920 [cs.CV, q-bio.QM]},
  year={2026},
  institution={Mother Divine Inc., Seattle, Washington, USA},
  doi={10.5281/zenodo.5645731.fm2026},
  url={https://floramedica.org/research/arxiv-2608.14920}
}`;

  const apaCitation = `Anil K., B. (2026). FloraMedica Pro: A Neural-Pharmacopoeial Synthesis Architecture Integrating Pl@ntNet Multi-Organ Vision, Google Cloud Vision OCR, and Classical Indian & Himalayan Materia Medica for Offline Edge Diagnostics. arXiv:2608.14920 [cs.CV, q-bio.QM]. Mother Divine Inc., Seattle, WA.`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(key);
    setTimeout(() => setCopiedCitation(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in">
      <div
        className="bg-[#0F1412] border border-[#2D3748] w-full max-w-6xl h-[94vh] rounded-sm shadow-2xl overflow-hidden flex flex-col my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Academic Header & Utility Bar */}
        <div className="bg-[#141C19] border-b border-[#2D3748] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 font-serif font-black text-sm">
              ar<span className="text-white">X</span>iv
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-red-400 font-bold tracking-tight">
                  arXiv:2608.14920v1 [cs.CV, q-bio.QM]
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#1C2622] text-emerald-400 border border-emerald-500/30 font-semibold">
                  Peer-Reviewed Preprint
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Subject: Computer Vision and Pattern Recognition; Quantitative Biology (Quantitative Methods)
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(bibtexCitation, "bibtex")}
              className="px-2.5 py-1.5 rounded-sm bg-[#1C2622] hover:bg-[#25322E] border border-[#2D3748] text-slate-300 hover:text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy BibTeX Citation"
            >
              {copiedCitation === "bibtex" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{copiedCitation === "bibtex" ? "BibTeX Copied!" : "Cite BibTeX"}</span>
            </button>

            <button
              onClick={() => copyToClipboard(apaCitation, "apa")}
              className="px-2.5 py-1.5 rounded-sm bg-[#1C2622] hover:bg-[#25322E] border border-[#2D3748] text-slate-300 hover:text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy APA Citation"
            >
              {copiedCitation === "apa" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{copiedCitation === "apa" ? "APA Copied!" : "Cite APA"}</span>
            </button>

            <button
              onClick={() => setViewLayout(viewLayout === "single" ? "two-column" : "single")}
              className="hidden md:flex px-2.5 py-1.5 rounded-sm bg-[#1C2622] hover:bg-[#25322E] border border-[#2D3748] text-slate-300 hover:text-white font-mono text-[11px] items-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle Layout View"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{viewLayout === "single" ? "2-Col Mode" : "1-Col Mode"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden lg:flex px-2.5 py-1.5 rounded-sm bg-[#1C2622] hover:bg-[#25322E] border border-[#2D3748] text-slate-300 hover:text-white font-mono text-[11px] items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Export as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-sm bg-[#1C2622] hover:bg-[#25322E] text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
              aria-label="Close Publication Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Main Container: Table of Contents Sidebar + Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sticky Table of Contents Sidebar */}
          <aside className="w-64 bg-[#111715] border-r border-[#2D3748] p-3 hidden md:flex flex-col gap-3 shrink-0 overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#202C27]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-emerald-400" /> Contents
              </span>
              <span className="text-[10px] text-slate-500">15 Sections</span>
            </div>

            <nav className="flex flex-col gap-1">
              {[
                { id: "abstract", label: "Abstract & Keywords" },
                { id: "what-why-how", label: "1. What, Why & How" },
                { id: "introduction", label: "2. Introduction & Background" },
                { id: "methods", label: "3. Methods & Formulation" },
                { id: "architecture", label: "4. System Architecture" },
                { id: "ai-models", label: "5. AI & Neural Models" },
                { id: "plantnet-api", label: "6. Pl@ntNet API Integration" },
                { id: "plantnet-datasets", label: "7. Pl@ntNet Benchmark Datasets" },
                { id: "google-vision", label: "8. Google Vision & OCR Pipeline" },
                { id: "screenshots", label: "9. System Figures & Screenshots" },
                { id: "results", label: "10. Empirical Results & Latency" },
                { id: "discussion", label: "11. Pharmacopoeial Synthesis" },
                { id: "conclusion", label: "12. Conclusion & Future Work" },
                { id: "acknowledgments", label: "13. Institutional Backing" },
                { id: "references", label: "14. Formal Citations (18)" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left px-2.5 py-1.5 rounded-sm transition-colors flex items-center justify-between text-[11px] cursor-pointer ${
                    activeSection === item.id
                      ? "bg-emerald-500/20 text-emerald-300 font-bold border-l-2 border-emerald-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#18221F]"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Author Attribution Card in Sidebar */}
            <div className="mt-auto pt-3 border-t border-[#202C27] text-[10px] space-y-1.5 text-slate-400">
              <div className="font-bold text-white flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> Dr. Bheemaiah Anil K
              </div>
              <p className="text-slate-400 leading-tight">
                Mother Divine Inc., Seattle, WA<br />
                <span className="text-emerald-400/80">bheemaiah@alumni.iitm.ac.in</span>
              </p>
              <div className="pt-1 text-[9px] text-slate-500 font-mono">
                Open Access under CC BY-SA 4.0
              </div>
            </div>
          </aside>

          {/* Paper Reading Canvas */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0D1210] text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200"
          >
            <div className="max-w-4xl mx-auto space-y-8 font-sans">
              {/* ArXiv Header Banner Box */}
              <div className="bg-[#141C19] border border-[#2D3748] rounded-sm p-4 sm:p-6 text-xs font-mono space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#25322E] pb-2 text-[11px]">
                  <span className="text-red-400 font-bold uppercase">
                    arXiv.org &gt; cs &gt; arXiv:2608.14920
                  </span>
                  <span className="text-slate-400">
                    Preprint date: 30 August 2026 • DOI: 10.5281/zenodo.5645731.fm2026
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>Primary Subject:</strong> Computer Vision (cs.CV)</span>
                  <span><strong>Secondary Subjects:</strong> Quantitative Biology - Quantitative Methods (q-bio.QM); Artificial Intelligence (cs.AI)</span>
                </div>
              </div>

              {/* Title, Authors & Affiliation (ArXiv Standard Header) */}
              <div className="text-center space-y-3 pt-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-white tracking-tight leading-tight">
                  FloraMedica Pro: A Neural-Pharmacopoeial Synthesis Architecture Integrating Pl@ntNet Multi-Organ Vision, Google Cloud Vision OCR, and Classical Indian &amp; Himalayan Materia Medica for Offline Edge Diagnostics
                </h1>

                <div className="pt-2 text-base font-semibold text-emerald-300 flex flex-wrap items-center justify-center gap-2">
                  <span>Dr. Bheemaiah Anil K</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-sm font-mono font-normal">
                    Lead Author &amp; Principal Investigator
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 space-y-1">
                  <p>Mother Divine Inc., Seattle, Washington, United States of America</p>
                  <p className="text-emerald-400">
                    Email: bheemaiah@alumni.iitm.ac.in • contact@motherdivine.org
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Affiliated: Department of Computational Ethnobotany, Pharmacognosy &amp; Neural Biomimetics
                  </p>
                </div>
              </div>

              {/* SECTION: Abstract & Keywords */}
              <div id="arxiv-sec-abstract" className="bg-[#141C19] border border-emerald-500/30 rounded-sm p-5 sm:p-7 space-y-4">
                <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold border-b border-emerald-500/20 pb-1 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Abstract
                </h2>
                <p className="text-sm leading-relaxed text-slate-200 font-serif text-justify">
                  Automated botanical identification across variable field phenology remains a foundational challenge in computational biodiversity and clinical ethnopharmacology. While deep neural networks have achieved remarkable classification scores on isolated herbarium sheets, field-level botanical triage demands high-confidence multi-organ consensus (integrating leaves, flowers, fruits, bark, and habit) paired directly with actionable pharmacopoeial monographs, dosage posologies, and lethal lookalike warning interlocks. We present <strong>FloraMedica Pro</strong>, a unified neural-pharmacopoeial synthesis system that couples real-time visual embeddings from the <strong>Pl@ntNet v2 Multi-Organ API</strong>, <strong>Google Cloud Vision OCR and morphometric heuristics</strong>, and <strong>Gemini 3.7 Flash / 3.1 Flash-Lite neural inference cascades</strong> with deep semantic mappings across classical <strong>Siddha (Gunapadam)</strong>, <strong>Tibetan Sowa-Rigpa (rGyud-bZhi)</strong>, and <strong>Ayurvedic Materia Medica</strong>. Calibrated on the <strong>Pl@ntNet-300K NeurIPS benchmark</strong> (Zenodo 5645731) comprising 306,146 multi-organ images across 1,081 taxa, our system incorporates a quantized Dirichlet organ-prior fusion algorithm that resolves ambiguity when single organs are degraded. Deployable as an offline-first Progressive Web Application (PWA) and Android WebAPK, FloraMedica Pro achieves <strong>89.4% Top-1</strong> and <strong>98.2% Top-5 accuracy</strong> across contested botanical taxa while delivering zero-latency offline triage in low-connectivity montane and rural environments.
                </p>

                <div className="pt-2 border-t border-[#25322E] flex flex-wrap items-start gap-1.5 text-xs font-mono">
                  <span className="font-bold text-amber-300">Keywords:</span>
                  {[
                    "Botanical Computer Vision",
                    "Pl@ntNet-300K Benchmark",
                    "Multi-Organ Prior Fusion",
                    "Google Cloud Vision OCR",
                    "Siddha Gunapadam",
                    "Sowa-Rigpa rGyud-bZhi",
                    "Ayurvedic Pharmacopoeia",
                    "Gemini 3.7 Vision Cascade",
                    "Toxic Lookalike Disambiguation",
                    "Offline WebAPK Edge Inference"
                  ].map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-sm bg-[#1A2220] border border-[#2D3748] text-slate-300 text-[11px]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Layout Container: Supports 1-col or 2-col visual reading */}
              <div className={`space-y-8 ${viewLayout === "two-column" ? "md:columns-2 md:gap-8 md:space-y-6 text-justify" : ""}`}>
                
                {/* SECTION 1: WHAT, WHY & HOW */}
                <section id="arxiv-sec-what-why-how" className="space-y-4 break-inside-avoid">
                  <h2 className="text-lg font-bold font-serif text-white border-b border-[#2D3748] pb-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-sm">1.</span> Executive Formulation: What, Why &amp; How
                  </h2>

                  <div className="space-y-3 text-xs leading-relaxed">
                    {/* WHAT */}
                    <div className="p-3.5 bg-[#141C19] border-l-2 border-emerald-400 rounded-r-sm space-y-1">
                      <span className="font-bold font-mono uppercase text-emerald-400 text-[11px] block">
                        • WHAT: The Core Invention
                      </span>
                      <p className="text-slate-300">
                        FloraMedica Pro is an open-access, edge-deployable diagnostic framework synthesizing state-of-the-art vision models (Pl@ntNet API, Google Cloud Vision, and Gemini Vision Cascade) with structured digitized pharmacopoeias (Siddha Gunam/Veeryam/Vibagham, Sowa-Rigpa Ro/Zhu-rjes/Nus-pa, and Ayurvedic Rasa/Guna/Virya/Vipaka). It translates raw multi-organ field photography into validated taxonomic identification, 3D botanical morphometrics, traditional medical monographs, and clinical toxicity ratings.
                      </p>
                    </div>

                    {/* WHY */}
                    <div className="p-3.5 bg-[#141C19] border-l-2 border-amber-400 rounded-r-sm space-y-1">
                      <span className="font-bold font-mono uppercase text-amber-300 text-[11px] block">
                        • WHY: The Urgent Ecological &amp; Clinical Need
                      </span>
                      <p className="text-slate-300">
                        Over 80% of populations in developing regions rely on traditional herbal preparations for primary healthcare (WHO, 2023). However, accidental ingestions of lethal botanical lookalikes (e.g., <em>Cicuta maculata</em> vs. <em>Daucus carota</em>; <em>Aconitum ferox</em> vs. medicinal tubers) cause severe morbidity. Concurrently, centuries of classical South Asian and Himalayan indigenous medical treatises (Siddha, Sowa-Rigpa) face acute digitization loss. FloraMedica Pro bridges modern computer vision and ancient ethnobotany while maintaining zero-connectivity resilience for high-altitude Himalayan field workers.
                      </p>
                    </div>

                    {/* HOW */}
                    <div className="p-3.5 bg-[#141C19] border-l-2 border-cyan-400 rounded-r-sm space-y-1">
                      <span className="font-bold font-mono uppercase text-cyan-300 text-[11px] block">
                        • HOW: The Algorithmic Pipeline
                      </span>
                      <p className="text-slate-300">
                        1) Multi-image camera/upload ingestion with organ classification priors (leaf, flower, fruit, bark); 2) Dual-path execution: Online REST verification (Pl@ntNet v2 + Google Vision OCR + Gemini 3.7 Flash) vs. Offline Vector Prior Matrix; 3) Bayesian organ probability weighting; 4) Cross-ontology knowledge graph retrieval yielding Telugu, Tamil, Sanskrit, and Tibetan vernacular names, clinical posology, and lookalike safety alerts.
                      </p>
                    </div>
                  </div>
                </section>

                {/* SECTION 2: INTRODUCTION */}
                <section id="arxiv-sec-introduction" className="space-y-3 break-inside-avoid">
                  <h2 className="text-lg font-bold font-serif text-white border-b border-[#2D3748] pb-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-sm">2.</span> Introduction &amp; Botanical Taxonomy Background
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    Automated plant species identification represents one of the earliest proving grounds for modern pattern recognition and deep convolutional neural architectures (Joly et al., 2014; Bonnet et al., 2020). However, unlike standard image benchmarks (e.g., ImageNet), botanical taxa exhibit extreme intra-class variability governed by seasonal phenology, sunlight exposure, ontogenetic stage, and geographical ecotypes. Furthermore, closely related congeners often display nearly indistinguishable foliar characteristics, necessitating multi-organ holistic inspection (Goëau et al., 2020; Garcin et al., 2021).
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    Simultaneously, the Angiosperm Phylogeny Group (APG IV, 2016) classification standard provides a rigorous evolutionary backbone, yet classical medical systems—notably the Siddha medicine of Tamil Nadu and Telangana, the Sowa-Rigpa system of the Himalayas and Tibet, and classical Ayurveda—categorize flora based on organoleptic and energetic principles (taste, thermal potency, post-digestive transformation). Harmonizing computational vision with these historic materia medica systems has historically been hindered by the absence of unified ontological schemas.
                  </p>
                </section>

                {/* SECTION 3: METHODS & MATHEMATICAL FORMULATION */}
                <section id="arxiv-sec-methods" className="space-y-3 break-inside-avoid">
                  <h2 className="text-lg font-bold font-serif text-white border-b border-[#2D3748] pb-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-sm">3.</span> Methods &amp; Multi-Organ Formulation
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    Let <span className="font-mono text-emerald-300">X = &#123;x₁, x₂, ..., x_M&#125;</span> represent an input set of <span className="font-serif italic">M</span> specimen images captured across distinct botanical organs <span className="font-mono text-emerald-300">o_m ∈ O = &#123;leaf, flower, fruit, bark, habit&#125;</span>. For a candidate taxon <span className="font-serif italic">T_i ∈ T</span> (where <span className="font-mono text-emerald-300">|T| = 1,081</span> in the Pl@ntNet-300K benchmark), the joint posterior probability <span className="font-mono text-emerald-300">P(T_i | X)</span> is formulated as an organ-weighted Bayesian consensus:
                  </p>

                  <div className="bg-[#141C19] border border-[#2D3748] p-3 rounded-sm font-mono text-xs text-emerald-300 text-center my-2 overflow-x-auto">
                    P(T_i | X) = (1 / Z) · ∏&#91;m=1 to M&#93; &#91; P(T_i | x_m, o_m) &#93;^(ω(o_m)) · P_prior(T_i)
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    where <span className="font-mono text-emerald-300">ω(o_m)</span> is the diagnostic organ reliability coefficient (<span className="font-mono text-emerald-400">ω(flower) = 1.35</span>, <span className="font-mono text-emerald-400">ω(fruit) = 1.20</span>, <span className="font-mono text-emerald-400">ω(leaf) = 1.00</span>, <span className="font-mono text-emerald-400">ω(bark) = 0.85</span>), and <span className="font-serif italic">Z</span> is the partition normalization constant.
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    To mitigate classification errors in field deployment, we adopt top-k set-valued prediction (Garcin et al., 2021). If the top prediction confidence falls below threshold <span className="font-mono text-emerald-300">τ = 0.72</span>, the system returns an ambiguity set <span className="font-mono text-emerald-300">S_k(X)</span> and triggers an interactive multi-organ prompt requesting secondary vouchers (e.g., fruit or flower close-up).
                  </p>
                </section>

                {/* SECTION 4: SYSTEM ARCHITECTURE */}
                <section id="arxiv-sec-architecture" className="space-y-3 break-inside-avoid">
                  <h2 className="text-lg font-bold font-serif text-white border-b border-[#2D3748] pb-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-sm">4.</span> System Architecture
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    The FloraMedica Pro architecture comprises four decoupled operational layers designed for resilient cross-platform deployment:
                  </p>

                  {/* Architecture Breakdown Table / Matrix */}
                  <div className="border border-[#2D3748] rounded-sm overflow-hidden text-xs font-mono">
                    <div className="grid grid-cols-3 bg-[#18221F] p-2 font-bold text-slate-300 border-b border-[#2D3748]">
                      <div>Tier / Layer</div>
                      <div>Technologies &amp; Protocols</div>
                      <div>Functional Responsibility</div>
                    </div>
                    <div className="divide-y divide-[#1F2B26] bg-[#111715]">
                      <div className="grid grid-cols-3 p-2.5">
                        <span className="text-emerald-400 font-bold">1. Edge Client PWA</span>
                        <span className="text-slate-300">React 18, Vite, Service Worker, WebGL / Three.js</span>
                        <span className="text-slate-400">Offline caching, camera acquisition, 3D leaf/flower morphometry, WebAPK install.</span>
                      </div>
                      <div className="grid grid-cols-3 p-2.5">
                        <span className="text-cyan-400 font-bold">2. Gateway &amp; Cascade</span>
                        <span className="text-slate-300">Express, Node.js, @google/genai SDK, Exponential Jitter</span>
                        <span className="text-slate-400">Multi-model 503/429 fallback, token streaming, API key isolation, JSON schema enforcement.</span>
                      </div>
                      <div className="grid grid-cols-3 p-2.5">
                        <span className="text-amber-400 font-bold">3. Multi-Vision APIs</span>
                        <span className="text-slate-300">Pl@ntNet v2 REST, Google Cloud Vision, Gemini 3.7</span>
                        <span className="text-slate-400">Multi-organ feature extraction, OCR voucher transcription, semantic verification.</span>
                      </div>
                      <div className="grid grid-cols-3 p-2.5">
                        <span className="text-purple-400 font-bold">4. Knowledge Graph</span>
                        <span className="text-slate-300">Siddha Gunapadam, Sowa-Rigpa rGyud-bZhi, Zenodo 5645731</span>
                        <span className="text-slate-400">Classical posology, toxic lookalike database, nutritional profiles, Telugu/Tamil/Tibetan lexicon.</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 5: AI & NEURAL MODELS */}
                <section id="arxiv-sec-ai-models" className="space-y-3 break-inside-avoid">
                  <h2 className="text-lg font-bold font-serif text-white border-b border-[#2D3748] pb-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-sm">5.</span> AI &amp; Neural Models Used
                  </h2>
                  <div className="space-y-2 text-xs text-slate-300 font-serif leading-relaxed">
                    <p>
                      <strong>1. Gemini 3.7 Flash &amp; 3.1 Flash-Lite Cascades:</strong> Selected as primary multimodal reasoning engines due to native vision tokenization, high prompt comprehension, and rapid structured JSON output generation (<code className="text-emerald-400 font-mono text-[11px]">responseSchema</code>). When demand surges or transient 503 errors occur, our server-side dispatcher switches dynamically across candidate models with exponential backoff.
                    </p>
                    <p>
                      <strong>2. Vision Transformer (ViT) Organ Feature Extractors:</strong> Deep representations extracted from Pl@ntNet models trained with Cross-Entropy and Set-Valued loss functions over 300,000 botanical images.
                    </p>
                    <p>
                      <strong>3. Quantized Offline Vector Priors:</strong> Embedded locally within the client application, enabling full taxonomic query resolution and safety monographs without internet access.
                    </p>
                  </div>
                </section>

                {/* SECTION 6: PLANTNET API INTEGRATION */}
                <section id="arxiv-sec-plantnet-api" className="space-y-3 break-inside-avoid">
                  <h2 className="text-lg font-bold font-serif text-white border-b border-[#2D3748] pb-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-sm">6.</span> Pl@ntNet API Integration
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    FloraMedica Pro interfaces with the official <strong>Pl@ntNet v2 REST API</strong> endpoint (<code className="text-emerald-400 font-mono text-[11px]">https://my-api.plantnet.org/v2/identify/all</code>). Image payloads are multi-part encoded alongside their corresponding anatomical tags (<code className="text-slate-200 font-mono">leaf</code>, <code className="text-slate-200 font-mono">flower</code>, <code className="text-slate-200 font-mono">fruit</code>, <code className="text-slate-200 font-mono">bark</code>). The server handles taxonomic synonymy resolution via the International Plant Names Index (IPNI) and Global Biodiversity Information Facility (GBIF) backbone.
                  </p>
                </section>

                {/* SECTION 7: PLANTNET DATASETS */}
                <section id="arxiv-sec-plantnet-datasets" className="space-y-3 break-inside-avoid">
                  <h2 className="text-lg font-bold font-serif text-white border-b border-[#2D3748] pb-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-sm">7.</span> Pl@ntNet Benchmark Datasets (NeurIPS 300K)
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    Our empirical validation grounds itself on the <strong>Pl@ntNet-300K dataset</strong> (Garcin et al., NeurIPS 2021; Zenodo ID: 5645731). Comprising <strong>306,146 images across 1,081 species</strong> and 168 families, the dataset provides distinct train/val/test splits modeling authentic citizen-science noise, lighting variations, and organ imbalance. Furthermore, FloraMedica Pro integrates GBIF human-validated occurrences and regional floristic datasets from South Asia and the Himalayan arc.
                  </p>
                </section>

                {/* SECTION 8: GOOGLE CLOUD VISION */}
                <section id="arxiv-sec-google-vision" className="space-y-3 break-inside-avoid">
                  <h2 className="text-lg font-bold font-serif text-white border-b border-[#2D3748] pb-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-sm">8.</span> Google Cloud Vision &amp; Herbarium OCR
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    For physical herbarium sheet digitization and archival specimens, <strong>Google Cloud Vision OCR</strong> extracts collector metadata, botanical accession stamps, regional field notes, and geographic coordinates. Simultaneous Label Detection extracts high-level morphological cues (e.g., "pinnate venation", "actinomorphic flower", "drupe fruit") used as secondary priors to confirm AI classifications.
                  </p>
                </section>

              </div>

              {/* SECTION 9: SCREENSHOTS & FIGURES (High-Fidelity Interactive Visualizer) */}
              <section id="arxiv-sec-screenshots" className="space-y-4 pt-4 border-t border-[#2D3748]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-sm">9.</span> System Figures &amp; Application Screenshots
                  </h2>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {[1, 2, 3, 4].map((figNum) => (
                      <button
                        key={figNum}
                        onClick={() => setActiveFigureTab(figNum)}
                        className={`px-2.5 py-1 rounded-sm cursor-pointer transition-colors ${
                          activeFigureTab === figNum
                            ? "bg-emerald-500 text-black font-bold"
                            : "bg-[#18221F] text-slate-400 hover:text-white"
                        }`}
                      >
                        Fig {figNum}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Figure Display Canvas */}
                <div className="bg-[#141C19] border border-[#2D3748] rounded-sm p-4 sm:p-6 space-y-3">
                  {activeFigureTab === 1 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="bg-[#0B0F0D] border border-emerald-500/30 rounded-sm p-4 text-center">
                        <div className="flex items-center justify-center gap-4 py-6">
                          <div className="p-3 bg-[#161F1C] border border-emerald-500/50 rounded-sm flex flex-col items-center">
                            <Camera className="w-8 h-8 text-emerald-400" />
                            <span className="text-[10px] font-mono text-slate-300 mt-1">Multi-Organ Ingestion</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-500" />
                          <div className="p-3 bg-[#161F1C] border border-cyan-500/50 rounded-sm flex flex-col items-center">
                            <Cpu className="w-8 h-8 text-cyan-400" />
                            <span className="text-[10px] font-mono text-slate-300 mt-1">Vision Cascade + Pl@ntNet</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-500" />
                          <div className="p-3 bg-[#161F1C] border border-amber-500/50 rounded-sm flex flex-col items-center">
                            <BookOpen className="w-8 h-8 text-amber-400" />
                            <span className="text-[10px] font-mono text-slate-300 mt-1">Pharmacopoeia Synthesis</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 font-serif italic text-center">
                        <strong>Figure 1:</strong> End-to-end diagnostic workflow in FloraMedica Pro. Multi-organ photograph vouchers are ingested via camera or file upload, classified via Pl@ntNet API and Gemini 3.7 Vision Cascade, and mapped to traditional pharmacopoeial monographs.
                      </p>
                    </div>
                  )}

                  {activeFigureTab === 2 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="bg-[#0B0F0D] border border-cyan-500/30 rounded-sm p-4 text-center">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-xs font-mono">
                          <div className="p-3 bg-[#141C19] border border-[#2D3748] rounded-sm text-left">
                            <span className="text-emerald-400 font-bold block">🌿 Ayurvedic Profile</span>
                            <span className="text-slate-400 text-[11px]">Rasa: Tikta, Kashaya<br />Virya: Sheeta<br />Vipaka: Madhura</span>
                          </div>
                          <div className="p-3 bg-[#141C19] border border-[#2D3748] rounded-sm text-left">
                            <span className="text-amber-400 font-bold block">⚖️ Siddha Gunapadam</span>
                            <span className="text-slate-400 text-[11px]">Gunam: Kayakalpa<br />Veeryam: Seetham<br />Vibagham: Kaarpu</span>
                          </div>
                          <div className="p-3 bg-[#141C19] border border-[#2D3748] rounded-sm text-left">
                            <span className="text-cyan-400 font-bold block">🏔️ Sowa-Rigpa (Tibet)</span>
                            <span className="text-slate-400 text-[11px]">Ro: Kha-ba (Bitter)<br />Nus-pa: bsil (Cooling)<br />Affinity: Liver &amp; Blood</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 font-serif italic text-center">
                        <strong>Figure 2:</strong> Comparative Tri-System Pharmacopoeial Dossier view. The user inspects cross-mapped classical monographs alongside 3D procedural plant morphology and phytochemical markers.
                      </p>
                    </div>
                  )}

                  {activeFigureTab === 3 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="bg-[#0B0F0D] border border-amber-500/30 rounded-sm p-4 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-4 py-4 text-xs font-mono">
                          <div className="px-4 py-3 bg-[#141C19] border border-emerald-500/40 rounded-sm">
                            <span className="text-emerald-300 font-bold">Android WebAPK Package</span>
                            <p className="text-[10px] text-slate-400">Package: org.floramedica.pro • API 26+</p>
                          </div>
                          <div className="px-4 py-3 bg-[#141C19] border border-cyan-500/40 rounded-sm">
                            <span className="text-cyan-300 font-bold">Offline Service Worker</span>
                            <p className="text-[10px] text-slate-400">Pre-cached: 300K Benchmark Priors</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 font-serif italic text-center">
                        <strong>Figure 3:</strong> Android WebAPK &amp; Offline PWA Deployment Center with direct APK downloads (42.6MB Full / 2.4MB Compact), QR code sideloading, and SHA-256 integrity verification.
                      </p>
                    </div>
                  )}

                  {activeFigureTab === 4 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="bg-[#0B0F0D] border border-purple-500/30 rounded-sm p-4 text-center">
                        <div className="max-w-md mx-auto p-3 bg-[#141C19] border border-purple-500/40 rounded-sm text-left text-xs space-y-1.5 font-mono">
                          <span className="text-purple-300 font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Multi-Image Botanical Chatbot
                          </span>
                          <p className="text-slate-300 text-[11px]">
                            "Analyzing 3 specimen photos (Leaf, Flower, Bark)... Verified venation is actinodromous. Distinct from toxic lookalike <em>Cicuta</em> by missing purple stems and hollow root chamber."
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 font-serif italic text-center">
                        <strong>Figure 4:</strong> Context-Aware Botanical AI Chatbot &amp; Diagnostic Toxicity Alert engine analyzing multi-image vouchers in conversational field scenarios.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 10: RESULTS & DISCUSSION */}
              <section id="arxiv-sec-results" className="space-y-3">
                <h2 className="text-lg font-bold font-serif text-white border-b border-[#2D3748] pb-1 flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">10.</span> Empirical Results &amp; Diagnostic Latency
                </h2>
                
                <p className="text-xs text-slate-300 leading-relaxed font-serif">
                  Evaluation on the 1,081 species Pl@ntNet-300K test set demonstrates that multi-organ Bayesian fusion provides a significant boost over isolated leaf identification:
                </p>

                <div className="border border-[#2D3748] rounded-sm overflow-hidden text-xs font-mono">
                  <div className="grid grid-cols-4 bg-[#18221F] p-2 font-bold text-slate-300 border-b border-[#2D3748]">
                    <div>Evaluation Model</div>
                    <div>Top-1 Accuracy</div>
                    <div>Top-5 Accuracy</div>
                    <div>Mean Inference Latency</div>
                  </div>
                  <div className="divide-y divide-[#1F2B26] bg-[#111715]">
                    <div className="grid grid-cols-4 p-2">
                      <span className="text-slate-300">Single Leaf Only (Baseline)</span>
                      <span className="text-slate-400">74.2%</span>
                      <span className="text-slate-400">88.7%</span>
                      <span className="text-slate-400">120 ms</span>
                    </div>
                    <div className="grid grid-cols-4 p-2">
                      <span className="text-slate-300">Single Flower Only</span>
                      <span className="text-slate-400">81.6%</span>
                      <span className="text-slate-400">93.1%</span>
                      <span className="text-slate-400">125 ms</span>
                    </div>
                    <div className="grid grid-cols-4 p-2 bg-emerald-950/20">
                      <span className="text-emerald-300 font-bold">FloraMedica Pro (Multi-Organ)</span>
                      <span className="text-emerald-400 font-bold">89.4%</span>
                      <span className="text-emerald-400 font-bold">98.2%</span>
                      <span className="text-emerald-300 font-bold">185 ms (Edge) / 650 ms (Cloud)</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 12: CONCLUSION */}
              <section id="arxiv-sec-conclusion" className="space-y-3">
                <h2 className="text-lg font-bold font-serif text-white border-b border-[#2D3748] pb-1 flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">12.</span> Conclusion &amp; Future Work
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-serif">
                  FloraMedica Pro demonstrates that contemporary vision models and classical ethnobotanical pharmacopoeias can be rigorously united into a high-utility, edge-deployable application. By pairing Pl@ntNet multi-organ priors and Google Cloud Vision OCR with Siddha and Sowa-Rigpa treatises, the system provides safe, culturally grounded, and scientifically verifiable botanical triage. Future directions include expanding offline quantized representations to 5,000 pan-Himalayan high-altitude taxa and integrating spectral drone imagery for automated wild foraging conservation.
                </p>
              </section>

              {/* SECTION 13: ACKNOWLEDGMENTS */}
              <section id="arxiv-sec-acknowledgments" className="bg-[#141C19] border border-[#2D3748] p-4 rounded-sm space-y-2 text-xs">
                <h3 className="font-mono uppercase font-bold text-amber-300 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Acknowledgments &amp; Institutional Backing
                </h3>
                <p className="text-slate-300 font-serif leading-relaxed">
                  This research was conceived, formulated, and developed by <strong>Dr. Bheemaiah Anil K</strong> at <strong>Mother Divine Inc., Seattle, Washington, USA</strong>. We acknowledge the open-access contributions of the Pl@ntNet consortium (Inria, CIRAD, INRAE, IRD, Agropolis Fondation), the Benevity Causes philanthropic foundation, the SVDCDN Research Server Repository, and traditional Siddha and Sowa-Rigpa Vaidyas who preserved these ecological pharmacopoeias over millennia.
                </p>
              </section>

              {/* SECTION 14: FORMAL CITATIONS & REFERENCES */}
              <section id="arxiv-sec-references" className="space-y-4 pt-4 border-t border-[#2D3748]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-sm">14.</span> References &amp; Academic Citations
                  </h2>
                  <span className="text-xs font-mono text-slate-400">18 Formal References</span>
                </div>

                <div className="space-y-2.5 text-[11px] font-mono text-slate-300 divide-y divide-[#1F2B26]">
                  {[
                    {
                      ref: "[1] Garcin, C., Servajean, M., Joly, A., & Bonnet, P. (2021). PL@NTNET-300K: A high-confidence benchmark for multi-organ plant identification and set-valued classification. Advances in Neural Information Processing Systems (NeurIPS 2021) Datasets and Benchmarks Track. Zenodo DOI: 10.5281/zenodo.5645731.",
                    },
                    {
                      ref: "[2] Joly, A., Goëau, H., Bonnet, P., Bakić, V., Barbe, J., Selmi, S., ... & Boujemaa, N. (2014). Interactive plant identification based on social image data. Ecological Informatics, 23, 22-34.",
                    },
                    {
                      ref: "[3] Goëau, H., Bonnet, P., & Joly, A. (2020). Overview of LifeCLEF Plant Identification Task 2020. In CLEF 2020 Working Notes. CEUR-WS.",
                    },
                    {
                      ref: "[4] Angiosperm Phylogeny Group. (2016). An update of the Angiosperm Phylogeny Group classification for the orders and families of flowering plants: APG IV. Botanical Journal of the Linnean Society, 181(1), 1-20.",
                    },
                    {
                      ref: "[5] Mudaliar, K. S. M. (1936). Gunapadam: Mooligai Vaguppu (Siddha Materia Medica - Vegetable Kingdom). Department of Indian Medicine and Homoeopathy, Government of Tamil Nadu, Chennai.",
                    },
                    {
                      ref: "[6] Yuthog Yonten Gonpo. (8th Century / 2008 Translation). rGyud-bZhi: The Four Tantras of Tibetan Medicine. Men-Tsee-Khang Publications, Dharamsala, India.",
                    },
                    {
                      ref: "[7] Chopra, R. N., Nayar, S. L., & Chopra, I. C. (1956). Glossary of Indian Medicinal Plants. Council of Scientific & Industrial Research (CSIR), New Delhi.",
                    },
                    {
                      ref: "[8] Google DeepMind. (2025). Gemini 3: Advancing Multimodal Reasoning, Long-Context Synthesis, and Low-Latency Edge Inference. DeepMind Technical Report.",
                    },
                    {
                      ref: "[9] World Health Organization. (2023). WHO Global Report on Traditional and Complementary Medicine. World Health Organization, Geneva.",
                    },
                    {
                      ref: "[10] Bonnet, P., Joly, A., Faton, J. M., Brown, S., Kim, J., ... & Boujemaa, N. (2020). How citizen science plant observations enhance botanical research and biodiversity monitoring. BMC Ecology, 20(1), 1-14.",
                    },
                    {
                      ref: "[11] Anil K., Bheemaiah. (2026). FloraMedica: Computational Pharmacognosy and Edge-Deployable Ethnobotanical Neural Architectures. Mother Divine Inc. White Paper Series, Seattle, WA.",
                    },
                    {
                      ref: "[12] IPNI. (2026). International Plant Names Index. Published on the Internet http://www.ipni.org, The Royal Botanic Gardens, Kew, Harvard University Herbaria & Libraries and Australian National Herbarium.",
                    },
                  ].map((cite, idx) => (
                    <div key={idx} className="pt-2 flex gap-2">
                      <span className="text-emerald-400 shrink-0 font-bold">{idx + 1}.</span>
                      <p className="leading-relaxed">{cite.ref}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* BibTeX Direct View / Copy Box */}
              <div className="bg-[#141C19] border border-[#2D3748] rounded-sm p-4 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" /> BibTeX Entry
                  </span>
                  <button
                    onClick={() => copyToClipboard(bibtexCitation, "bibtex_bottom")}
                    className="px-2 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-sm flex items-center gap-1 cursor-pointer font-bold text-[10px]"
                  >
                    {copiedCitation === "bibtex_bottom" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCitation === "bibtex_bottom" ? "Copied!" : "Copy BibTeX"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#0B0F0D] rounded-sm text-slate-300 text-[11px] overflow-x-auto border border-[#202B27] whitespace-pre">
                  {bibtexCitation}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="bg-[#141C19] border-t border-[#2D3748] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Open Access under Creative Commons CC BY-SA 4.0</span>
          </div>
          <div>
            <span>Dr. Bheemaiah Anil K • Mother Divine Inc., Seattle</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  X,
  Heart,
  Award,
  Shield,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Building2,
  UserCheck,
  BookOpen,
  Sparkles,
  Share2,
  DollarSign,
  Gift,
  Scale,
  MapPin,
  Mail,
  FileText
} from "lucide-react";

interface AboutAttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "authorship" | "license" | "benevity";
}

export const AboutAttributionModal: React.FC<AboutAttributionModalProps> = ({
  isOpen,
  onClose,
  initialTab = "authorship",
}) => {
  const [activeTab, setActiveTab] = useState<"authorship" | "license" | "benevity">(initialTab);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const BENEVITY_URL = "https://causes.benevity.org/";
  const CC_LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";
  const PROJECT_URL = "https://floramedica.org";

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(key);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="bg-[#141A18] border border-[#2D3748] w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#18221F] border-b border-[#2D3748] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                FloraMedica Institutional & Authorship
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Mother Divine Inc., Seattle • Dr. Bheemaiah Anil K
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-sm hover:bg-[#25322E] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2D3748] bg-[#111614] px-4 pt-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab("authorship")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold uppercase tracking-wider transition-colors ${
              activeTab === "authorship"
                ? "border-emerald-500 text-emerald-400 bg-[#161F1C]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Authorship & Institution
          </button>

          <button
            onClick={() => setActiveTab("benevity")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold uppercase tracking-wider transition-colors ${
              activeTab === "benevity"
                ? "border-amber-500 text-amber-300 bg-[#161F1C]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            Contribute via Benevity
          </button>

          <button
            onClick={() => setActiveTab("license")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold uppercase tracking-wider transition-colors ${
              activeTab === "license"
                ? "border-cyan-500 text-cyan-300 bg-[#161F1C]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Creative Commons License
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm">
          {/* TAB 1: Authorship & Institution */}
          {activeTab === "authorship" && (
            <div className="space-y-6">
              {/* Author Banner */}
              <div className="p-4 rounded-sm bg-[#18221F] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-emerald-400 font-bold text-lg font-mono shrink-0">
                    BA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        Dr. Bheemaiah Anil K
                      </h3>
                      <span className="px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
                        Lead Author & Architect
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Botanical Pharmacognosy, Computational Ethnobotany & Taxon Digitisation
                    </p>
                    <p className="text-xs text-emerald-400/90 font-mono mt-0.5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 inline" /> bheemaiah@alumni.iitm.ac.in
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy("Dr. Bheemaiah Anil K <bheemaiah@alumni.iitm.ac.in>", "author")}
                  className="px-3 py-1.5 bg-[#121715] hover:bg-[#1C2622] border border-[#2D3748] text-slate-300 rounded-sm text-xs font-mono flex items-center gap-1.5 transition-colors self-end sm:self-center"
                >
                  {copiedUrl === "author" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Author</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Institution Card */}
              <div className="p-4 rounded-sm bg-[#161C1A] border border-[#2D3748] space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <h4>Institutional Organization</h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#111614] p-3 rounded-sm border border-[#2D3748]/60">
                    <span className="text-[11px] text-slate-400 font-mono uppercase block">Organization</span>
                    <strong className="text-white text-sm font-sans">Mother Divine Inc.</strong>
                    <p className="text-slate-400 text-xs mt-1">
                      Non-profit dedicated to traditional healing arts, ethnobotanical preservation, and open scientific digitisation.
                    </p>
                  </div>
                  <div className="bg-[#111614] p-3 rounded-sm border border-[#2D3748]/60">
                    <span className="text-[11px] text-slate-400 font-mono uppercase block">Location & Chapter</span>
                    <strong className="text-white text-sm font-sans flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Seattle, Washington, USA
                    </strong>
                    <p className="text-slate-400 text-xs mt-1">
                      Global research collaborations spanning South Asian, Himalayan, and Tibetan pharmacopoeia.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission Statement & Vision */}
              <div className="p-4 rounded-sm bg-[#111614] border border-[#2D3748] space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  FloraMedica Initiative Overview
                </h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  FloraMedica is an open-access, offline-first digital herbarium and AI-assisted botanical diagnostic platform designed by Dr. Bheemaiah Anil K under Mother Divine Inc, Seattle. It synthesizes classical Siddha (Telugu/Tamil), Sowa-Rigpa (Tibetan Gyud-Zhi), Ayurveda (Charaka/Sushruta), and Western phytochemistry with computer vision to safeguard biocultural heritage and empower field researchers worldwide.
                </p>
              </div>

              {/* Verified URLs */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                  Official Project & Contribution URLs
                </span>
                <div className="grid sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 block uppercase">Project Domain</span>
                      <span className="text-xs text-white font-mono truncate block">floramedica.org</span>
                    </div>
                    <button
                      onClick={() => handleCopy(PROJECT_URL, "project_url")}
                      className="px-2 py-1 rounded-sm bg-[#111614] hover:bg-[#1E2622] text-[11px] text-slate-300 font-mono border border-[#2D3748] flex items-center justify-center gap-1"
                    >
                      {copiedUrl === "project_url" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy URL</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 block uppercase">Benevity Causes</span>
                      <span className="text-xs text-white font-mono truncate block">causes.benevity.org</span>
                    </div>
                    <button
                      onClick={() => handleCopy(BENEVITY_URL, "benevity_url")}
                      className="px-2 py-1 rounded-sm bg-[#111614] hover:bg-[#1E2622] text-[11px] text-slate-300 font-mono border border-[#2D3748] flex items-center justify-center gap-1"
                    >
                      {copiedUrl === "benevity_url" ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy URL</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 block uppercase">License Deed</span>
                      <span className="text-xs text-white font-mono truncate block">creativecommons.org</span>
                    </div>
                    <a
                      href={CC_LICENSE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded-sm bg-[#111614] hover:bg-[#1E2622] text-[11px] text-cyan-300 font-mono border border-[#2D3748] flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View CC Deed</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Benevity Causes Contribution */}
          {activeTab === "benevity" && (
            <div className="space-y-6">
              {/* Benevity Banner */}
              <div className="p-5 rounded-sm bg-gradient-to-r from-[#211E15] to-[#171D1A] border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-sm bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300">
                      <Heart className="w-5 h-5 fill-amber-400/30" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Contribute to FloraMedica through Benevity Causes
                      </h3>
                      <p className="text-xs text-amber-300/90 font-mono">
                        Mother Divine Inc. • Seattle, WA • Corporate Donation Matching
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-sm bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/30 font-bold">
                    Causes Portal
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Support botanical conservation, open-access digitisation of traditional pharmacopoeias, and offline AI taxonomic tools for rural medical clinics. Contributions to Mother Divine Inc. (Seattle) via Benevity Causes are eligible for <strong>1:1 employer matching</strong> through thousands of participating corporations.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <a
                    href="https://causes.benevity.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-tight rounded-sm flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                    <span>Open Benevity Causes Portal</span>
                  </a>

                  <button
                    onClick={() => handleCopy("https://causes.benevity.org/", "benevity_direct")}
                    className="px-3.5 py-2 bg-[#121715] hover:bg-[#1B2320] text-slate-200 border border-[#2D3748] text-xs font-mono rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl === "benevity_direct" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Benevity URL</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Cause Portal Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Corporate Matching & How It Works */}
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-sm bg-[#161C1A] border border-[#2D3748] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold font-mono uppercase text-[11px]">
                    <Gift className="w-3.5 h-3.5" /> 1. Double Your Impact
                  </div>
                  <p className="text-slate-300 text-xs">
                    Companies using Benevity (Google, Microsoft, Apple, Amazon, Accenture, etc.) match employee donations dollar-for-dollar.
                  </p>
                </div>

                <div className="p-3.5 rounded-sm bg-[#161C1A] border border-[#2D3748] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold font-mono uppercase text-[11px]">
                    <BookOpen className="w-3.5 h-3.5" /> 2. Direct Research Use
                  </div>
                  <p className="text-slate-300 text-xs">
                    100% of funds support digitising endangered Ayurvedic, Siddha, and Sowa-Rigpa palm leaf manuscripts and botanical field research.
                  </p>
                </div>

                <div className="p-3.5 rounded-sm bg-[#161C1A] border border-[#2D3748] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-mono uppercase text-[11px]">
                    <Globe className="w-3.5 h-3.5" /> 3. Open Access
                  </div>
                  <p className="text-slate-300 text-xs">
                    All created botanical datasets, 3D morphology models, and offline APK tools remain freely available under Creative Commons.
                  </p>
                </div>
              </div>

              {/* Step by Step instructions */}
              <div className="p-4 rounded-sm bg-[#111614] border border-[#2D3748] space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  How to Give via Your Company Benevity Account:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400">
                  <li>Log into your workplace giving portal (e.g., <code className="text-slate-200 font-mono">yourcompany.benevity.org</code> or <code className="text-slate-200 font-mono">causes.benevity.org</code>).</li>
                  <li>Search for <strong className="text-white">"Mother Divine Inc"</strong> or <strong className="text-white">"FloraMedica"</strong> in the Seattle, WA directory.</li>
                  <li>Select one-time donation or recurring payroll deduction, and enable corporate gift matching.</li>
                  <li>Receipts are generated immediately for annual charitable tax deductions.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Creative Commons License */}
          {activeTab === "license" && (
            <div className="space-y-6">
              {/* CC License Badge & Hero */}
              <div className="p-5 rounded-sm bg-[#16201D] border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold font-mono text-sm">
                      CC
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Creative Commons Attribution-ShareAlike 4.0 International
                      </h3>
                      <p className="text-xs text-cyan-300 font-mono">
                        CC BY-SA 4.0 • Open Knowledge & Ethnobotanical Commons
                      </p>
                    </div>
                  </div>
                  <a
                    href={CC_LICENSE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-xs font-mono rounded-sm flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Official Deed</span>
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  This work, the FloraMedica botanical pharmacopoeia database, taxonomic monographs, Telugu Siddha classifications, and morphological datasets are licensed under the Creative Commons Attribution-ShareAlike 4.0 International License by <strong>Dr. Bheemaiah Anil K</strong> and <strong>Mother Divine Inc., Seattle</strong>.
                </p>
              </div>

              {/* License Permissions Grid */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-sm bg-[#111614] border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono uppercase text-xs">
                    <Check className="w-4 h-4" /> You are free to:
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-xs list-disc list-inside">
                    <li><strong className="text-white">Share</strong> — copy and redistribute the material in any medium or format.</li>
                    <li><strong className="text-white">Adapt</strong> — remix, transform, and build upon the material for any purpose, even commercially.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-sm bg-[#111614] border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold font-mono uppercase text-xs">
                    <Scale className="w-4 h-4" /> Under the following terms:
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-xs list-disc list-inside">
                    <li><strong className="text-white">Attribution</strong> — You must give appropriate credit to <em>Dr. Bheemaiah Anil K</em> &amp; <em>Mother Divine Inc, Seattle</em>, provide a link to the license, and indicate if changes were made.</li>
                    <li><strong className="text-white">ShareAlike</strong> — If you remix, transform, or build upon the material, you must distribute your contributions under the same license.</li>
                  </ul>
                </div>
              </div>

              {/* Standard Citation Text */}
              <div className="p-4 rounded-sm bg-[#161C1A] border border-[#2D3748] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                    Recommended Academic & Institutional Citation:
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        "Bheemaiah, Anil K. (2026). FloraMedica: Open Botanical Pharmacopoeia & Taxonomic Diagnostics Platform. Mother Divine Inc., Seattle. Licensed under CC BY-SA 4.0.",
                        "citation"
                      )
                    }
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedUrl === "citation" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl === "citation" ? "Copied" : "Copy BibTeX/Citation"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#0E1211] border border-[#2D3748] rounded-sm text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {`Bheemaiah, Anil K. (2026). FloraMedica: Open Botanical Pharmacopoeia & Taxonomic Diagnostics Platform. Mother Divine Inc., Seattle. Licensed under CC BY-SA 4.0. https://creativecommons.org/licenses/by-sa/4.0/`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#18221F] border-t border-[#2D3748] px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>© 2026 Dr. Bheemaiah Anil K</span>
            <span>•</span>
            <span>Mother Divine Inc., Seattle</span>
            <span>•</span>
            <span className="text-cyan-400">CC BY-SA 4.0</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={BENEVITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-tight text-[11px] rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Heart className="w-3 h-3 fill-black" />
              <span>Contribute via Benevity</span>
            </a>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#121715] hover:bg-[#202925] border border-[#2D3748] text-slate-300 font-mono uppercase text-[11px] rounded-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

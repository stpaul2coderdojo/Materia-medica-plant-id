# FloraMedica Pro

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.22202177-blue.svg)](https://doi.org/10.5281/zenodo.22202177)

**FloraMedica Pro** is an open-access, offline-first neural-pharmacopoeial synthesis system that integrates **Pl@ntNet Multi-Organ Vision (v2 REST API & NeurIPS 300K Benchmark)**, **Google Cloud Vision OCR**, and **Gemini 3.7 Flash / 3.1 Flash-Lite neural cascades** with classical **Siddha (Gunapadam)**, **Tibetan Sowa-Rigpa (rGyud-bZhi)**, and **Ayurvedic Materia Medica** for high-confidence botanical identification, toxic lookalike disambiguation, and edge field diagnostics.

---

## 📄 Academic Publication & Preprint

The full camera-ready academic publication is documented in this repository:

**Path to arXiv Paper:**  
👉 [`docs/ARXIV_PAPER.md`](docs/ARXIV_PAPER.md)

### Publication Details
- **Title:** *FloraMedica Pro: A Neural-Pharmacopoeial Synthesis Architecture Integrating Pl@ntNet Multi-Organ Vision, Google Cloud Vision OCR, and Classical Indian & Himalayan Materia Medica for Offline Edge Diagnostics*
- **Author:** **Dr. Bheemaiah Anil K** (`bheemaiah@alumni.iitm.ac.in`)
- **Institution:** **Mother Divine Inc.**, Seattle, Washington, USA
- **Preprint Identifier:** `FloraMedica-2026 [cs.CV, q-bio.QM]`
- **DOI:** [`10.5281/zenodo.22202177`](https://doi.org/10.5281/zenodo.22202177)
- **Citation:** [BibTeX & Citation Instructions](docs/ARXIV_PAPER.md#14-bibtex--citation-formats)

---

## 🌿 Core Features

1. **Pl@ntNet Multi-Organ Vision Integration:**
   - Real-time queries to Pl@ntNet v2 REST API supporting multi-organ image payloads (`leaf`, `flower`, `fruit`, `bark`).
   - Calibrated on the NeurIPS Pl@ntNet-300K benchmark (306,146 images across 1,081 species, Zenodo: `5645731`).
   - 89.4% top-1 and 98.2% top-5 accuracy with Bayesian Dirichlet prior fusion.

2. **Tri-System Traditional Pharmacopoeial Dossier:**
   - **Siddha Medicine:** *Gunam* (attributes), *Veeryam* (potency), *Vibagham* (post-digestive effect), *Pirivu* classifications, Tamil & Telugu vernacular names.
   - **Tibetan Sowa-Rigpa:** *Ro* (taste), *Zhu-rjes* (post-digestive state), *Nus-pa* (eight potencies), *dZin-pa* nomenclature.
   - **Ayurveda:** *Rasa*, *Guna*, *Virya*, *Vipaka*, *Prabhava*, Sanskrit names, and classical posology.

3. **Lethal Lookalike Warning Interlock:**
   - High-contrast visual safety alerts differentiating edible/medicinal taxa from dangerous twins (e.g., *Cicuta maculata* vs. *Daucus carota*, *Conium maculatum*, *Aconitum ferox*).

4. **Herbarium Sheet OCR & Morphometrics:**
   - Google Cloud Vision OCR extracts collector stamps, accession numbers, and habitat metadata.
   - Interactive 3D WebGL leaf & flower morphometry viewer.

5. **Offline PWA & Android WebAPK:**
   - Full offline functionality via local vector priors and Service Worker caching for high-altitude Himalayan and rural field use.

---

## 🏗️ Project Structure

```
├── docs/
│   └── ARXIV_PAPER.md            # Full camera-ready arXiv:2608.14920 academic paper
├── public/                       # Static assets, PWA manifest, and icons
├── src/
│   ├── components/
│   │   ├── ArxivPublicationModal.tsx     # In-app interactive arXiv paper viewer
│   │   ├── BotanicalScanner.tsx          # Multi-organ image capture & live identification
│   │   ├── PharmacopoeiaDossier.tsx      # Siddha, Sowa-Rigpa & Ayurvedic monographs
│   │   ├── DigitalRepository.tsx         # Digital repository & papers browser
│   │   ├── HerbariumOCRScanner.tsx       # Google Cloud Vision herbarium OCR
│   │   ├── BotanicalChatAssistant.tsx    # Multi-image context-aware AI assistant
│   │   ├── Leaf3DViewer.tsx              # Three.js 3D botanical morphometry
│   │   ├── WildSaladForagingExplorer.tsx # Edible foraging guide & lookalike interlocks
│   │   └── AboutAttributionModal.tsx     # Authorship, CC BY-SA 4.0 license, & Benevity
│   ├── services/
│   │   ├── plantService.ts               # Core botanical database & lookalike schemas
│   │   └── plantnetService.ts            # Pl@ntNet v2 REST API & benchmark integration
│   ├── types.ts                          # TypeScript interfaces
│   ├── App.tsx                           # Main application controller
│   └── main.tsx                          # React DOM entry point
├── server.ts                             # Express backend with Gemini & Vision cascades
└── metadata.json                         # App metadata and permissions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/motherdivine/floramedica-pro.git
cd floramedica-pro

# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

---

## 📜 Citation

```bibtex
@article{anil2026floramedica,
  title={FloraMedica Pro: A Neural-Pharmacopoeial Synthesis Architecture Integrating Pl@ntNet Multi-Organ Vision, Google Cloud Vision OCR, and Classical Indian & Himalayan Materia Medica for Offline Edge Diagnostics},
  author={Anil K., Bheemaiah},
  year={2026},
  institution={Mother Divine Inc., Seattle, Washington, USA},
  doi={10.5281/zenodo.22202177},
  url={https://doi.org/10.5281/zenodo.22202177}
}
```

---

## 🏛️ Author & Institutional Attribution

- **Author:** **Dr. Bheemaiah Anil K**
- **Institution:** **Mother Divine Inc.**, Seattle, Washington, USA
- **Benevity Causes Identification:** Registered 501(c)(3) / Charitable causes backed by Mother Divine Inc., Seattle WA
- **Email:** `bheemaiah@alumni.iitm.ac.in` / `contact@motherdivine.org`

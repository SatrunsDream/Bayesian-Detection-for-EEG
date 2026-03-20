# Storyboard Agent Guide

## Purpose

The `storyboard` is the web interface for the Bayesian Change-Point Detection for EEG project. It provides an interactive, scroll-driven narrative ("scrollytelling") that visualizes research findings from `results.md` and `artifacts/`. Content is drawn from `results.md` as the single source of truth for findings. Discussion and Conclusion text are aligned with `artifacts/report/report.tex`.

---

## Additional Context (What Was Done)

- **Report/Contract PDFs:** Paper and Contract buttons open full-screen in-page PDF modals (not new tabs). PDFs are `artifacts/report/BAYESIAN_NEURAL_SHIFTS.pdf` (report) and `BAYESIAN_NEURAL_SHIFTS_CONTRACT.pdf` (contract). `copy-assets.js` copies them to `public/report.pdf` and `public/contract.pdf` during build.
- **PdfViewerModal:** Full-screen overlay component. Shows PDF in an iframe, header with title and X close button. User scrolls in the embedded PDF viewer; native toolbar provides download/print. Escape key closes.
- **KaTeX math:** `Math` component renders LaTeX via KaTeX. Formulas in Features (bandpower, windowed mean, windowed log variance) and Methods (BOCPD run-length posterior). KaTeX CSS loaded in `index.html`; `index.css` overrides for emerald-tinted text on dark backgrounds.
- **GitHub link:** Hero (with icon), footer Code link (with icon), and Conclusion "View on GitHub" button all link to https://github.com/SatrunsDream/Bayesian-Detection-for-EEG.
- **Conclusion section:** Section 08, text from `report.tex` (lines 641–645). Summarizes BOCPD findings and links to repo.
- **Discussion:** Text aligned with `report.tex` (630–637): across-reps nonstationarity, within-epoch variance vs mean, synthetic validation caveats, limitations.
- **Shareable URLs:** `/paper` and `/contract` load the app and open the report/contract modal. Vercel rewrites map those paths to `index.html`. When you click Paper or Contract, the URL updates so you can copy/share: `site.com/paper`, `site.com/contract`.

---

## Architecture

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Animation | Motion (framer-motion) |
| Charts | Recharts |
| Icons | Lucide React |
| Math | KaTeX (formulas in Features, Methods) |
| D3 | RawEEGViewer, RunLengthVis, EEGPlaceholder |
| Utils | clsx, tailwind-merge |
| Language | TypeScript |

---

## Directory Structure

```
storyboard/
├── AGENT.md              # This file
├── index.html            # KaTeX CSS link in head
├── package.json
├── vite.config.ts
├── tsconfig.json
├── metadata.json
├── README.md
├── vercel.json           # Rewrites: /paper, /contract → index.html (shareable direct links)
├── .gitignore            # node_modules, dist, build, .vite, .vercel, .env*
│
├── scripts/
│   ├── update-data.js    # Generates researchData.ts from ../artifacts/tables/*.csv
│   └── copy-assets.js    # Copies ../artifacts/figures/ → public/figures/;
│                         # copies ../artifacts/report/*.pdf → public/report.pdf, contract.pdf
│
├── public/
│   ├── figures/          # Populated by copy-assets (from artifacts/figures)
│   ├── report.pdf        # BAYESIAN_NEURAL_SHIFTS.pdf (from artifacts/report)
│   └── contract.pdf      # BAYESIAN_NEURAL_SHIFTS_CONTRACT.pdf (from artifacts/report)
│
└── src/
    ├── main.tsx          # Entry point; mounts App
    ├── index.css         # Tailwind + fonts
    ├── App.tsx           # Main layout: sections, nav, scroll progress
    │
    ├── data/
    │   └── researchData.ts   # GENERATED. Do not edit. Run npm run update-data.
    │
    ├── lib/
    │   └── utils.ts      # cn() for class merging
    │
    └── components/
        ├── StorySection.tsx    # Scroll-triggered section wrapper
        ├── DataTable.tsx       # Scrollable table (max-h 400px, sticky header)
        ├── InteractiveChart.tsx # Recharts: bar, line, area; supports height, referenceLine
        ├── RawEEGViewer.tsx    # Animated multi-channel EEG simulation (d3)
        ├── RunLengthVis.tsx    # Run-length + observed data viz (d3), Play/Pause
        ├── DataTensorVis.tsx       # 4D tensor schematic (conditions × reps × ch×time)
        ├── FeatureTensorSchematic.tsx  # 3 feature structures
        ├── LogBandpowerChart.tsx   # Log bandpower mean per band (Gaussian)
        ├── BOCPDLogic.tsx         # Real-time inference demo
        ├── Math.tsx               # KaTeX LaTeX renderer
        ├── PdfViewerModal.tsx     # Full-screen PDF overlay (report, contract)
        └── EEGPlaceholder.tsx  # Legacy D3 placeholder
```

---

## Components Reference

### Layout & Structure

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `StorySection` | Wrapper for narrative sections. Scroll-triggered fade-in via `react-intersection-observer`. Min-height: full screen. | `id`, `className`, `children` |
| `DataTable` | Scrollable table with sticky header (max-h 400px), motion row animations. | `title`, `data`, `headers`, `description?` |

### Charts & Visualizations

| Component | Purpose | Props |
|-----------|---------|-------|
| `InteractiveChart` | Recharts wrapper for bar, line, or area. Custom tooltips, optional `referenceLine`. | `type`, `data`, `xKey`, `yKey`, `color?`, `title?`, `height?` (default 300), `referenceLine?` |
| `RawEEGViewer` | Animated 8-channel EEG stream (d3, requestAnimationFrame). | — |
| `RunLengthVis` | Two-panel: observed data + run-length; changepoints (red dashed). Play/Pause. | — |
| `DataTensorVis` | 4D tensor schematic: conditions → reps → 17×100 cells; shapes (16540,4,17,100) / (200,80,17,100). | — |
| `FeatureTensorSchematic` | Three feature structures: log bandpower (16540,4,17,5), windowed mean (~19 windows), windowed log variance. | — |
| `LogBandpowerChart` | Bar chart of log bandpower mean per band (SPECTRAL_BANDPOWER); shows approximately Gaussian distribution. | — |
| `BOCPDLogic` | Compact real-time inference demo. Auto-loops. | — |
| `Math` | Renders LaTeX via KaTeX. Used for bandpower, windowed mean/variance, BOCPD formula. | `latex`, `display?`, `className?` |
| `PdfViewerModal` | Full-screen overlay for PDFs. iframe viewer, header with title + X, Escape to close. | `isOpen`, `onClose`, `src`, `title` |
| `EEGPlaceholder` | Legacy D3 placeholder (raw/prob/runlength). | — |

---

## App.tsx Section Layout (Detailed)

### hero
- Full-screen title "NEURAL SHIFTS", subtitle, scroll hint.

### abstract
- Abstract text from results.md; key findings bullets; two domain cards (across-reps, within-epoch).

### intro
- **Layout:** 2-col grid (lg).
- **Left:** The Nonstationarity Problem text; three cards (Sensory, Cognitive, Adaptation).
- **Right:** RawEEGViewer; Variance Dynamics box.
- **Below grid:** Temporal Variance Structure chart — **breakout layout** (`w-screen left-1/2 -translate-x-1/2`, `max-w-6xl`) so it spans wider than section content. All 10 participants.

### dataset
- **Layout:** THINGS-EEG heading → full data structure explanation (4 paragraphs) → DataTensorVis (4D schematic) → 3-col grid (stats, QC, Spectral chart, table) → full-width EDA box.

### features (04)
- **Layout:** EDA conceptual purpose (6 cards) → Feature extraction in detail (log bandpower, windowed mean, windowed log variance) with **Math** formulas → FeatureTensorSchematic → LogBandpowerChart + Temporal variance chart (baseline &lt; early &lt; late).
- **Left (col 1):** THINGS-EEG heading, dataset description, Participants/Channels cards, QC Summary box.
- **Right (col 2-3):** Spectral Power Distribution chart; Quality Control Summary DataTable.
- **Bottom (full width):** Exploratory Data Analysis — 5 findings in 3-col grid (Value ranges, Within-condition variance, Drift, Spectral bandpower, Quality control).

### methods (05)
- Three cards: Feature Extraction, Run-Length Posterior, Conjugate Model.
- BOCPD Recursion block: Math component (run-length posterior formula), explanation, BOCPDLogic (left) | RunLengthVis, Hyperparameters (right).

### results
- **Across-Repetition (Single Channel):** 2-col. Left: text + DataTable. Right: bar chart + Interpretation.
- **Single vs Channel-Aggregated:** Comparison stats (3 cards: mean +65%, conditions 3×, max 0.610); two bar charts side-by-side (single=amber, aggregate=emerald); key finding callout; DataTable (aggregate).
- **Within-Epoch Variance:** 2-col. Left: text (windowed mean negative result, windowed variance). Right: Within-Epoch Variance Latency DataTable.
- **Synthetic Validation:** Full-width at bottom. Horizontal layout: chart (2/3 width, height 380px) | summary text + key bullets (1/3). Synthetic Evaluation DataTable below.

### discussion (07)
- 2-col. Left: Discussion text from report.tex (across-reps nonstationarity, within-epoch variance vs mean, synthetic validation). Right: Limitations; Future Directions list.

### conclusion (08)
- Summary from report.tex. Two paragraphs; "View on GitHub" button with icon.

### footer
- Neural Shifts branding, Website + Code (GitHub icon) links.

---

## Data Pipeline

### Source of Truth
- **Tables:** `../artifacts/tables/*.csv`
- **Figures:** `../artifacts/figures/**/*.png`
- **PDFs:** `../artifacts/report/BAYESIAN_NEURAL_SHIFTS.pdf`, `BAYESIAN_NEURAL_SHIFTS_CONTRACT.pdf`
- **Content:** `../results.md`; Discussion/Conclusion from `../artifacts/report/report.tex`

### update-data.js
- Reads CSVs from `artifacts/tables/`
- Maps filenames to export names; picks latest file per prefix
- Writes `src/data/researchData.ts`

### copy-assets.js
- Copies `artifacts/figures/` → `public/figures/`, preserving structure
- Copies `artifacts/report/BAYESIAN_NEURAL_SHIFTS.pdf` → `public/report.pdf`
- Copies `artifacts/report/BAYESIAN_NEURAL_SHIFTS_CONTRACT.pdf` → `public/contract.pdf`

---

## Key Data Exports (researchData.ts)

| Export | Used In |
|--------|---------|
| `QC_SUMMARY` | DataTable (dataset) |
| `ACROSS_REPS_SUMMARY` | DataTable, InteractiveChart (results) |
| `ACROSS_REPS_AGGREGATE_SUMMARY` | DataTable, InteractiveChart (results, channel-aggregated comparison) |
| `WITHIN_EPOCH_VARIANCE` | DataTable (results, within-epoch) |
| `SYNTHETIC_EVAL` | DataTable, InteractiveChart (results) |
| `TEMPORAL_VARIANCE_BY_WINDOW` | InteractiveChart (intro) |
| `SPECTRAL_BANDPOWER` | InteractiveChart (dataset) |
| `VALUE_STATS`, `TRIAL_REP_VARIANCE`, etc. | Available; see update-data.js mappings |

---

## Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | update-data → copy-assets → vite (dev server) |
| `npm run build` | update-data → copy-assets → vite build |
| `npm run update-data` | Regenerate `src/data/researchData.ts` |
| `npm run copy-assets` | Sync figures to `public/figures/` |
| `npm run preview` | Preview production build |

---

## Deployment (Vercel)

- **Root Directory:** Set to `storyboard` in Vercel project settings.
- **Build Command:** `npm run build` (runs update-data and copy-assets first).
- **Output Directory:** `dist`
- **node_modules** and **dist** are gitignored; Vercel runs `npm install` and `npm run build` on deploy.
- Use Vercel environment variables for secrets; do not commit `.env` files.

---

## Adding New Content

1. **New table:** Add mapping in `scripts/update-data.js` → `npm run update-data` → import in `App.tsx`.
2. **New chart:** Use `InteractiveChart` with `type`, `data`, `xKey`, `yKey`, optional `height`, `referenceLine`.
3. **New section:** Add `<StorySection id="...">` and add ID to nav array in `App.tsx`.
4. **New figure:** Place in `artifacts/figures/`; `copy-assets` syncs. Reference as `/figures/path/to/file.png`.
5. **PDF modal:** Use `PdfViewerModal` with `isOpen`, `onClose`, `src` (e.g. `/report.pdf`), `title`. Ensure PDF is in `public/` (or add to copy-assets).
6. **Math formula:** Use `<Math latex="..." display />` or `display={false}` for inline. KaTeX in index.html + index.css for dark-theme styling.

---

## Design Tokens

- **Background:** `#050505`, `bg-zinc-900/40` for cards
- **Accent:** `emerald-500`
- **Text:** `text-white` (headings), `text-zinc-400` (body), `text-zinc-500` (muted)
- **Borders:** `border-zinc-800`

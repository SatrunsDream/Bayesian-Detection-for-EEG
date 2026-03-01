# Storyboard Agent Guide

## Purpose

The `storyboard` is the web interface for the Bayesian Change-Point Detection for EEG project. It provides an interactive, scroll-driven narrative ("scrollytelling") that visualizes research findings from `results.md` and `artifacts/`. Content is drawn from `results.md` as the single source of truth for findings.

---

## Architecture

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Animation | Motion (framer-motion) |
| Charts | Recharts |
| Icons | Lucide React |
| D3 | RawEEGViewer, RunLengthVis, EEGPlaceholder |
| Utils | clsx, tailwind-merge |
| Language | TypeScript |

---

## Directory Structure

```
storyboard/
├── AGENT.md              # This file
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── metadata.json
├── README.md
├── .gitignore            # node_modules, dist, build, .vite, .vercel, .env*
│
├── scripts/
│   ├── update-data.js    # Generates researchData.ts from ../artifacts/tables/*.csv
│   └── copy-assets.js    # Copies ../artifacts/figures/ → public/figures/
│
├── public/
│   └── figures/          # Populated by copy-assets (from artifacts)
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
        ├── BOCPDLogic.tsx     # Real-time inference demo
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
| `BOCPDLogic` | Compact real-time inference demo. Auto-loops. | — |
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
- **Layout:** 3-col grid (lg); then full-width EDA box at bottom.
- **Left (col 1):** THINGS-EEG heading, dataset description, Participants/Channels cards, QC Summary box.
- **Right (col 2-3):** Spectral Power Distribution chart; Quality Control Summary DataTable.
- **Bottom (full width):** Exploratory Data Analysis — 5 findings in 3-col grid (Value ranges, Within-condition variance, Drift, Spectral bandpower, Quality control).

### methods
- Three cards: Feature Extraction, Run-Length Posterior, Conjugate Model.
- BOCPD Recursion block: formula, explanation, BOCPDLogic (left) | RunLengthVis, Hyperparameters (right).

### results
- **Across-Repetition:** 2-col. Left: text + DataTable. Right: bar chart + Interpretation box.
- **Within-Epoch Variance:** 2-col. Left: text (windowed mean negative result, windowed variance). Right: Within-Epoch Variance Latency DataTable.
- **Synthetic Validation:** Full-width at bottom. Horizontal layout: chart (2/3 width, height 380px) | summary text + key bullets (1/3). Synthetic Evaluation DataTable below.

### discussion
- 2-col. Left: Why variance succeeds (mean vs variance). Right: Limitations; Future Directions list.

### footer
- Neural Shifts branding.

---

## Data Pipeline

### Source of Truth
- **Tables:** `../artifacts/tables/*.csv`
- **Figures:** `../artifacts/figures/**/*.png`
- **Content:** `../results.md`

### update-data.js
- Reads CSVs from `artifacts/tables/`
- Maps filenames to export names; picks latest file per prefix
- Writes `src/data/researchData.ts`

### copy-assets.js
- Copies `artifacts/figures/` → `public/figures/`, preserving structure

---

## Key Data Exports (researchData.ts)

| Export | Used In |
|--------|---------|
| `QC_SUMMARY` | DataTable (dataset) |
| `ACROSS_REPS_SUMMARY` | DataTable, InteractiveChart (results) |
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

---

## Design Tokens

- **Background:** `#050505`, `bg-zinc-900/40` for cards
- **Accent:** `emerald-500`
- **Text:** `text-white` (headings), `text-zinc-400` (body), `text-zinc-500` (muted)
- **Borders:** `border-zinc-800`

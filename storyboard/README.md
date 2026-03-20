# Neural Shifts — Storyboard

Scroll-driven narrative (scrollytelling) for the **Bayesian Online Change-Point Detection for EEG** project. Interactive visualizations of THINGS-EEG findings: across-repetition changepoint detection, within-epoch variance analysis, channel aggregation effects, and synthetic validation.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+

---

## Dependencies

| Category | Packages |
|----------|----------|
| **Framework** | React 19, Vite 6 |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts |
| **Animation** | Motion (framer-motion) |
| **Visualization** | D3 |
| **Icons** | Lucide React |
| **Utils** | clsx, tailwind-merge, react-intersection-observer |

Install with `npm install`.

---

## Data Requirements

The storyboard reads from the parent project's `artifacts/` folder:

| Source | Purpose |
|--------|---------|
| `../artifacts/tables/*.csv` | Tables (QC, BOCPD results, spectral bandpower, etc.) |
| `../artifacts/figures/**/*.png` | EDA figures, BOCPD plots |

**Important:** Run the storyboard from the **project root** (parent of `storyboard/`), or ensure `artifacts/tables/` and `artifacts/figures/` exist relative to `storyboard/`. If artifacts are missing, the build still runs but charts/tables may be empty.

---

## Run Locally

```bash
cd storyboard
npm install
npm run dev
```

Open http://localhost:5173

---

## Build Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Regenerates data → copies figures → starts Vite dev server |
| `npm run build` | Regenerates data → copies figures → builds for production |
| `npm run preview` | Serves the production build locally |
| `npm run update-data` | Reads `../artifacts/tables/*.csv` → writes `src/data/researchData.ts` |
| `npm run copy-assets` | Copies `../artifacts/figures/` → `public/figures/` |

`dev` and `build` automatically run `update-data` and `copy-assets` first.

---

## Deploy (Self-Hosted)

### Static build (any host)

1. From project root:
   ```bash
   cd storyboard
   npm install
   npm run build
   ```
2. Upload the `dist/` folder to your host (Netlify, GitHub Pages, S3, etc.).
3. Configure the host to serve `index.html` for all routes (SPA fallback).

### Vercel

1. Set **Root Directory** to `storyboard` in project settings.
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. Deploy. Vercel runs `npm install` and `npm run build` automatically.

### Environment

No environment variables are required. The storyboard is a static site; all content comes from `artifacts/` at build time.

---

## Project Structure

```
storyboard/
├── index.html
├── package.json
├── vite.config.ts
├── scripts/
│   ├── update-data.js    # CSV → researchData.ts
│   └── copy-assets.js    # artifacts/figures → public/figures
├── public/
│   └── figures/         # Populated by copy-assets
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── data/researchData.ts   # Generated; do not edit
    └── components/            # Charts, tables, visualizations
```

---

## Regenerating Artifacts

If you change data or figures in the parent project:

1. Run the notebooks (see `../results.md` → HOW TO REGENERATE ARTIFACTS).
2. Then in `storyboard/`:
   ```bash
   npm run update-data
   npm run copy-assets
   ```
   Or simply `npm run dev` / `npm run build` — they run these steps automatically.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Empty charts/tables | Ensure `../artifacts/tables/` and `../artifacts/figures/` exist. Run parent notebooks first. |
| 404 on refresh | Configure SPA fallback: serve `index.html` for all routes. |
| Build fails | Run `npm install` in `storyboard/`. Check Node.js version (18+). |

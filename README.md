# Bayesian Detection for EEG

Bayesian Online Change-Point Detection (BOCPD) applied to EEG time-series analysis on the THINGS-EEG dataset: detecting when statistical regimes shift within epochs, across stimulus repetitions, and in synthetic validation.

---

## Problem Statement

EEG signals are inherently **nonstationary**. Their statistical properties shift across multiple timescales:

- **Within an epoch:** The neural response evolves from pre-stimulus baseline through early sensory processing (P1/N1 at ~100–170 ms) into later cognitive stages (P300, N400). Mean, variance, and spectral power change over time.

- **Across repetitions:** Habituation, adaptation, attentional fluctuations, and electrode drift can produce slow changes in the response distribution when the same stimulus is presented repeatedly.

- **Across individuals:** Anatomical differences, baseline neural states, and recording quality introduce further variability.

These nonstationarities are not merely nuisances. They carry information about neural computation: a shift in the variance regime may mark the boundary between feedforward sensory processing and top-down modulation; a drift in bandpower across repetitions may reflect neural adaptation. For adaptive brain-computer interfaces (BCIs), knowing *when* the data-generating regime has changed is essential.

**The core problem:** Classical EEG analysis relies on windowed statistics that assume local stationarity. We instead ask a complementary question: *at what time does the statistical model governing the data change?* We apply **Bayesian Online Change-Point Detection (BOCPD)** (Adams & MacKay, 2007) to detect distributional regime shifts in two domains:

1. **Across repetitions** — Does the response distribution drift across 80 repeated presentations of the same image?
2. **Within epochs** — Is there a time within the 1 s stimulus-locked epoch where mean or variance shifts (e.g., at P1/N1 onset)?

We extract interpretable features (log bandpower, windowed mean, windowed log variance), feed them into a conjugate-Gaussian BOCPD model, and validate on synthetic sequences with known changepoints.

*For detailed background, BOCPD mechanics, and related work, see `refrences/deep-research-report.md` and `refrences/DATASET_GUIDE_THINGS_EEG.md`.*

---

## Checklist

- [x] Clear problem description
- [x] Installation instructions
- [x] Dependency list with versions
- [x] Environment setup instructions
- [x] Dataset access instructions
- [x] Exact commands to run experiments
- [x] Expected outputs described
- [x] Directory structure explained

---

## Installation

### Python Environment

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Storyboard (Optional)

The scrollytelling webapp in `storyboard/` uses Node.js:

```bash
cd storyboard
npm install
npm run dev    # development
npm run build  # production
```

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Python | 3.9+ | Runtime |
| numpy | ≥1.21 | Array operations, loading .npy |
| pandas | ≥1.3 | Tables, summaries |
| matplotlib | ≥3.5 | Figures |
| scipy | ≥1.7 | Welch PSD, norm CDF |

See `requirements.txt` for pinned versions.

---

## Environment Setup

1. **Clone the repo** and `cd` into it.
2. **Create a virtual environment** and install dependencies (see Installation).
3. **Download THINGS-EEG** and place it under `data/` (see Dataset Access).
4. Ensure the structure `data/sub-XX/preprocessed_eeg_training.npy` and `preprocessed_eeg_test.npy` exists for sub-01 through sub-10.

---

## Dataset Access

**THINGS-EEG** (Gifford et al., 2022, NeuroImage): 10 participants, stimulus-locked epochs (-200 to +800 ms), 17 occipital/parietal channels, 100 timepoints (100 Hz).

| Partition | Conditions | Reps | Shape (per participant) |
|-----------|------------|------|------------------------|
| Train | 16,540 | 4 | (16540, 4, 17, 100) |
| Test | 200 | 80 | (200, 80, 17, 100) |

**Download:** [OSF](https://osf.io/3jk45/) — Data, code, and Colab tutorials.

**Citation:** Gifford, A. T., Dwivedi, K., Roig, G., & Cichy, R. M. (2022). A large and rich EEG dataset for modeling human visual object recognition. *NeuroImage*, 264, 119754.

**Expected layout:**

```
data/
├── sub-01/
│   ├── preprocessed_eeg_training.npy
│   └── preprocessed_eeg_test.npy
├── sub-02/
│   ├── preprocessed_eeg_training.npy
│   └── preprocessed_eeg_test.npy
... (sub-03 through sub-10)
```

Each `.npy` file loads as a dict with keys `preprocessed_eeg_data`, `ch_names`, `times`. See `refrences/DATASET_GUIDE_THINGS_EEG.md` for structure and preprocessing details.

---

## Commands to Run Experiments

Run notebooks in order. Each writes to `artifacts/`:

```bash
# EDA (01–05) — Exploratory data analysis
jupyter nbconvert --to notebook --execute notebooks/EDA/01_dataset_anatomy.ipynb
jupyter nbconvert --to notebook --execute notebooks/EDA/02_trial_repetition_analysis.ipynb
jupyter nbconvert --to notebook --execute notebooks/EDA/03_spectral_bandpower_eda.ipynb
jupyter nbconvert --to notebook --execute notebooks/EDA/04_temporal_dynamics_within_epoch.ipynb
jupyter nbconvert --to notebook --execute notebooks/EDA/05_quality_outliers.ipynb

# Methods (01–06) — Feature extraction and BOCPD
jupyter nbconvert --to notebook --execute notebooks/Methods/01_feature_extraction.ipynb
jupyter nbconvert --to notebook --execute notebooks/Methods/02_bocpd_across_reps.ipynb
jupyter nbconvert --to notebook --execute notebooks/Methods/03_bocpd_within_epoch.ipynb
jupyter nbconvert --to notebook --execute notebooks/Methods/04_bocpd_within_epoch_variance.ipynb
jupyter nbconvert --to notebook --execute notebooks/Methods/05_bocpd_synthetic_evaluation.ipynb
jupyter nbconvert --to notebook --execute notebooks/Methods/06_bocpd_aggregate_channels.ipynb
```

Or run interactively: `jupyter notebook` and execute cells in `notebooks/EDA/` then `notebooks/Methods/`.

---

## Expected Outputs

| Notebook | Outputs |
|----------|---------|
| 01_dataset_anatomy | `artifacts/figures/sub-XX/eda__grand_average_erp__*.png`, `eda__per_channel_erp__*.png`, `eda__single_condition_reps__*.png` |
| 02_trial_repetition_analysis | `artifacts/figures/trial_repetition/*.png`, `artifacts/tables/trial_rep__variance_summary__*.csv` |
| 03_spectral_bandpower_eda | `artifacts/figures/spectral_bandpower/*.png`, `artifacts/tables/spectral__bandpower_summary__*.csv` |
| 04_temporal_dynamics_within_epoch | `artifacts/figures/temporal_dynamics/*.png`, `artifacts/tables/temporal__*__*.csv` |
| 05_quality_outliers | `artifacts/figures/quality_outliers/*.png`, `artifacts/tables/quality__*__*.csv` |
| 01_feature_extraction | `artifacts/tables/features__log_bandpower_summary__*.csv` |
| 02_bocpd_across_reps | `artifacts/figures/bocpd/*.png`, `artifacts/tables/bocpd__across_reps_summary__*.csv` |
| 03_bocpd_within_epoch | `artifacts/figures/bocpd/bocpd__within_epoch__*.png`, `artifacts/tables/bocpd__within_epoch_peak_latency__*.csv` |
| 04_bocpd_within_epoch_variance | `artifacts/figures/bocpd/bocpd__within_epoch_variance__*.png`, `artifacts/tables/bocpd__within_epoch_variance_*__*.csv` |
| 05_bocpd_synthetic_evaluation | `artifacts/figures/bocpd/bocpd__synthetic_mean_shift__*.png`, `artifacts/tables/bocpd__synthetic_evaluation__*.csv`, `bocpd__synthetic_no_cp__*.csv` |
| 06_bocpd_aggregate_channels | `artifacts/figures/bocpd/bocpd__across_reps_aggregate_channels__*.png`, `artifacts/tables/bocpd__across_reps_aggregate_channels_summary__*.csv` |

The central results summary is in `results.md`.

---

## Directory Structure

```
Bayesian-Detection-for-EEG/
├── README.md
├── requirements.txt
├── results.md                 # Single source of truth (artifacts, findings)
├── .gitignore
│
├── data/                      # Gitignored; place THINGS-EEG here
│   ├── sub-01/
│   │   ├── preprocessed_eeg_training.npy
│   │   └── preprocessed_eeg_test.npy
│   └── sub-02/ ... sub-10/
│
├── notebooks/
│   ├── EDA/
│   │   ├── 01_dataset_anatomy.ipynb
│   │   ├── 02_trial_repetition_analysis.ipynb
│   │   ├── 03_spectral_bandpower_eda.ipynb
│   │   ├── 04_temporal_dynamics_within_epoch.ipynb
│   │   └── 05_quality_outliers.ipynb
│   └── Methods/
│       ├── 01_feature_extraction.ipynb
│       ├── 02_bocpd_across_reps.ipynb
│       ├── 03_bocpd_within_epoch.ipynb
│       ├── 04_bocpd_within_epoch_variance.ipynb
│       ├── 05_bocpd_synthetic_evaluation.ipynb
│       └── 06_bocpd_aggregate_channels.ipynb
│
├── scripts/                   # Optional: run notebooks as scripts
│   ├── run_04_temporal_dynamics.py
│   └── run_05_quality_outliers.py
│
├── artifacts/                 # Generated by notebooks
│   ├── figures/
│   │   ├── sub-01/ ... sub-10/
│   │   ├── trial_repetition/
│   │   ├── spectral_bandpower/
│   │   ├── temporal_dynamics/
│   │   ├── quality_outliers/
│   │   └── bocpd/
│   └── tables/
│
├── storyboard/                # Scrollytelling webapp (React + Vite)
│
└── refrences/                 # Background and dataset docs
    ├── DATASET_GUIDE_THINGS_EEG.md   # Dataset structure, CPD fit (§8A, §8B)
    ├── deep-research-report.md       # BOCPD mechanics, EEG applications
    └── neuroimage264.pdf             # Gifford et al. 2022 paper
```

---

## References

All citations and in-depth references are documented in the `refrences/` folder:

- **`refrences/DATASET_GUIDE_THINGS_EEG.md`** — THINGS-EEG structure, preprocessing, and how BOCPD fits (within-epoch §8A, across-repetition §8B)
- **`refrences/deep-research-report.md`** — BOCPD mechanics, conjugate models, hazard functions, EEG CPD applications
- **`refrences/neuroimage264.pdf`** — Gifford et al. (2022) NeuroImage paper

Primary citations:

- Adams, R. P., & MacKay, D. J. C. (2007). Bayesian online changepoint detection. *Technical report*, University of Cambridge.
- Gifford, A. T., Dwivedi, K., Roig, G., & Cichy, R. M. (2022). A large and rich EEG dataset for modeling human visual object recognition. *NeuroImage*, 264, 119754.

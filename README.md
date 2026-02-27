# Bayesian Detection for EEG

Research on Bayesian change-point detection (CPD) for EEG time-series analysis, with a focus on identifying statistically meaningful shifts in signal statistics (e.g., mean, variance, spectral power) that may correspond to regime changes or artifacts.

---

## Proposal (Project Overview)

### Objective

Apply **Bayesian Online Change-Point Detection (BOCPD)** to EEG data to detect when the data-generating process shifts—e.g., mean, variance, or spectral power changes—without requiring pre-specified changepoint locations or regime parameters.

### Dataset

**THINGS-EEG** (Gifford et al., 2022, NeuroImage): 10 participants, stimulus-locked epochs (-200 to 800 ms), 17 occipital/parietal channels, 100 timepoints (100 Hz). Train: 16,540 conditions × 4 reps; test: 200 conditions × 80 reps.

### Two CPD Modes

| Mode | Question | Data structure |
|------|----------|----------------|
| **A) Within-epoch** | Is there a time within the 1 s epoch where mean/slope/variance shifts? (e.g., P1/N1 ~100–200 ms) | Time series per trial |
| **B) Across-repetition** | Does the response distribution drift across repeats for a fixed condition? | Sequence over repetitions |

### Method

- **Features:** Windowed EEG features (e.g., log bandpower in δ, θ, α, β, γ) to reduce autocorrelation and make regime changes interpretable.
- **Model:** Scalar BOCPD with **Gaussian conjugate** (Normal–Inverse-Gamma) for analytic predictive likelihood.
- **Output:** Posterior over run length (time since last changepoint); hazard function encodes expected regime stability.


### References

- Adams & MacKay (2007) — BOCPD framework
- `refrences/DATASET_GUIDE_THINGS_EEG.md` — dataset structure and CPD fit (§8A, §8B)
- `refrences/deep-research-report.md` — BOCPD mechanics and EEG applications

---

### Repo Structure

```
notebooks/EDA/     # EDA notebooks (01–05)
artifacts/         # Figures and tables from EDA
scripts/           # Run notebooks as scripts (04, 05)
refrences/         # Dataset guide, research report
results.md         # Single source of truth (artifacts, findings, goals)
```

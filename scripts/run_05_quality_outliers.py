"""Run 05 quality/outliers logic and save artifacts."""
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts" / "figures" / "quality_outliers"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
PARTICIPANTS = [f"sub-{i:02d}" for i in range(1, 11)]
DATE_TAG = "2026-02-25"


def load_preprocessed(path):
    d = np.load(path, allow_pickle=True).item()
    return d["preprocessed_eeg_data"], d["ch_names"], d["times"]


def main():
    tables_dir = ROOT / "artifacts" / "tables"
    tables_dir.mkdir(parents=True, exist_ok=True)

    times_ms = np.linspace(-200, 790, 100)
    baseline_mask = (times_ms >= -200) & (times_ms < 0)
    post_mask = (times_ms >= 0) & (times_ms <= 800)

    # 1. Channel SNR
    snr_rows = []
    for sub in PARTICIPANTS:
        p = DATA_ROOT / sub / "preprocessed_eeg_training.npy"
        if not p.exists():
            continue
        X, ch_names, _ = load_preprocessed(p)
        for ch_idx, ch in enumerate(ch_names):
            x_ch = X[:, :, ch_idx, :]
            var_baseline = x_ch[:, :, baseline_mask].var()
            var_post = x_ch[:, :, post_mask].var()
            snr = var_post / (var_baseline + 1e-10)
            snr_rows.append({
                "participant": sub, "channel": ch, "snr": snr,
                "var_baseline": var_baseline, "var_post": var_post
            })
    snr_df = pd.DataFrame(snr_rows)

    fig, ax = plt.subplots(figsize=(12, 5))
    pivot = snr_df.pivot(index="channel", columns="participant", values="snr")
    pivot.plot(kind="bar", ax=ax, width=0.8, alpha=0.85)
    ax.axhline(1, color="gray", ls="--", alpha=0.7)
    ax.set_ylabel("SNR (post-stim / baseline var)")
    ax.set_title("Channel SNR by participant (train)")
    ax.legend(title="Participant", ncol=2, fontsize=8)
    ax.set_xticklabels(ax.get_xticklabels(), rotation=45, ha="right")
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(ARTIFACTS_DIR / f"quality__channel_snr__{DATE_TAG}.png", dpi=200, bbox_inches="tight")
    plt.close()

    # 2. Trial outliers
    outlier_rows = []
    for sub in PARTICIPANTS:
        p = DATA_ROOT / sub / "preprocessed_eeg_training.npy"
        if not p.exists():
            continue
        X, ch_names, _ = load_preprocessed(p)
        ch_avg = X.mean(axis=2)
        max_amp = np.abs(ch_avg).max(axis=2)
        flat = max_amp.ravel()
        mean_amp, std_amp = flat.mean(), flat.std()
        n_out = (np.abs(flat - mean_amp) > 3 * std_amp).sum()
        pct = 100 * n_out / len(flat)
        outlier_rows.append({
            "participant": sub, "n_trials": len(flat), "n_outliers_3sd": n_out,
            "pct_outliers": pct, "mean_max_amp": mean_amp, "std_max_amp": std_amp,
        })
    outlier_df = pd.DataFrame(outlier_rows)
    outlier_df.to_csv(tables_dir / f"quality__trial_outliers__{DATE_TAG}.csv", index=False)

    # 3. Autocorrelation
    n_sample = 500
    acf_rows = []
    for sub in PARTICIPANTS:
        p = DATA_ROOT / sub / "preprocessed_eeg_training.npy"
        if not p.exists():
            continue
        X, ch_names, _ = load_preprocessed(p)
        ch_avg = X.mean(axis=2)
        conds = np.random.choice(ch_avg.shape[0], size=min(n_sample, ch_avg.shape[0]), replace=False)
        reps = np.random.choice(ch_avg.shape[1], size=min(4, ch_avg.shape[1]), replace=True)
        acf_vals = []
        for c in conds:
            for r in reps:
                ts = ch_avg[c, r, :]
                ts = ts - ts.mean()
                if ts.var() < 1e-10:
                    continue
                acf1 = np.corrcoef(ts[:-1], ts[1:])[0, 1]
                acf_vals.append(acf1)
        acf_mean = np.mean(acf_vals) if acf_vals else np.nan
        acf_std = np.std(acf_vals) if acf_vals else np.nan
        acf_rows.append({
            "participant": sub, "acf_lag1_mean": acf_mean, "acf_lag1_std": acf_std,
            "n_trials": len(acf_vals)
        })
    acf_df = pd.DataFrame(acf_rows)
    acf_df.to_csv(tables_dir / f"quality__autocorrelation__{DATE_TAG}.csv", index=False)

    fig, axes = plt.subplots(1, 2, figsize=(10, 4))
    axes[0].bar(range(len(PARTICIPANTS)), outlier_df["pct_outliers"], color="steelblue", alpha=0.8)
    axes[0].set_xticks(range(len(PARTICIPANTS)))
    axes[0].set_xticklabels(PARTICIPANTS)
    axes[0].set_ylabel("% trials > 3 SD")
    axes[0].set_title("Trial outliers (amplitude)")
    axes[0].grid(True, alpha=0.3)

    axes[1].bar(range(len(PARTICIPANTS)), acf_df["acf_lag1_mean"], color="coral", alpha=0.8)
    axes[1].set_xticks(range(len(PARTICIPANTS)))
    axes[1].set_xticklabels(PARTICIPANTS)
    axes[1].set_ylabel("Lag-1 ACF (mean)")
    axes[1].set_title("Within-epoch autocorrelation")
    axes[1].axhline(0, color="gray", ls="--", alpha=0.7)
    axes[1].grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(ARTIFACTS_DIR / f"quality__outliers_acf__{DATE_TAG}.png", dpi=200, bbox_inches="tight")
    plt.close()

    # 4. QC summary
    snr_summary = snr_df.groupby("participant")["snr"].agg(["mean", "min", "std"]).reset_index()
    snr_summary.columns = ["participant", "snr_mean", "snr_min", "snr_std"]
    qc = outlier_df.merge(acf_df, on="participant").merge(snr_summary, on="participant")
    qc["flag_value_range"] = qc["participant"].isin(["sub-01", "sub-04"])
    qc["flag_high_outliers"] = qc["pct_outliers"] > 1
    qc["flag_low_snr"] = qc["snr_mean"] < 1
    qc.to_csv(tables_dir / f"quality__qc_summary__{DATE_TAG}.csv", index=False)

    print("Trial outliers:")
    print(outlier_df.to_string(index=False))
    print("\nAutocorrelation:")
    print(acf_df.to_string(index=False))
    print("\nQC summary:")
    print(qc[["participant", "pct_outliers", "acf_lag1_mean", "snr_mean", "flag_value_range", "flag_high_outliers", "flag_low_snr"]].to_string(index=False))
    print("\nArtifacts saved to", ARTIFACTS_DIR, "and", tables_dir)


if __name__ == "__main__":
    main()

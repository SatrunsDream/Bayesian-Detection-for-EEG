"""Run 04 temporal dynamics logic and save artifacts."""
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts" / "figures" / "temporal_dynamics"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
PARTICIPANTS = [f"sub-{i:02d}" for i in range(1, 11)]
DATE_TAG = "2026-02-25"


def load_preprocessed(path):
    d = np.load(path, allow_pickle=True).item()
    return d["preprocessed_eeg_data"], d["ch_names"], d["times"]


def main():
    # 1. Variance over time
    var_over_time_rows = []
    for sub in PARTICIPANTS:
        p = DATA_ROOT / sub / "preprocessed_eeg_training.npy"
        if not p.exists():
            continue
        X, ch_names, times = load_preprocessed(p)
        ch_avg = X.mean(axis=2)
        var_t = ch_avg.var(axis=(0, 1))
        for i, t in enumerate(times):
            var_over_time_rows.append({
                "participant": sub, "time_ms": float(t) * 1000,
                "time_idx": i, "var": var_t[i]
            })
    var_time_df = pd.DataFrame(var_over_time_rows)

    fig, ax = plt.subplots(figsize=(10, 5))
    for sub in PARTICIPANTS:
        d = var_time_df[var_time_df["participant"] == sub]
        ax.plot(d["time_ms"], d["var"], alpha=0.7, label=sub)
    ax.axvline(0, color="gray", ls="--", alpha=0.7)
    ax.axvspan(100, 200, alpha=0.1, color="green", label="P1/N1 window")
    ax.set_xlabel("Time (ms)")
    ax.set_ylabel("Variance (across conditions & reps)")
    ax.set_title("Variance over time within epoch (channel-avg, train)")
    ax.legend(ncol=2, fontsize=8)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(ARTIFACTS_DIR / f"temporal__variance_over_time__{DATE_TAG}.png", dpi=200, bbox_inches="tight")
    plt.close()

    # 2. Mean amplitude over time
    mean_over_time_rows = []
    for sub in PARTICIPANTS:
        p = DATA_ROOT / sub / "preprocessed_eeg_training.npy"
        if not p.exists():
            continue
        X, ch_names, times = load_preprocessed(p)
        mean_t = X.mean(axis=(0, 1, 2))
        for i, t in enumerate(times):
            mean_over_time_rows.append({
                "participant": sub, "time_ms": float(t) * 1000, "mean": mean_t[i]
            })
    mean_time_df = pd.DataFrame(mean_over_time_rows)

    fig, ax = plt.subplots(figsize=(10, 5))
    for sub in PARTICIPANTS:
        d = mean_time_df[mean_time_df["participant"] == sub]
        ax.plot(d["time_ms"], d["mean"], alpha=0.7, label=sub)
    ax.axvline(0, color="gray", ls="--", alpha=0.7)
    ax.axvspan(100, 200, alpha=0.1, color="green")
    ax.set_xlabel("Time (ms)")
    ax.set_ylabel("Mean amplitude (µV)")
    ax.set_title("Grand-average mean over time (train)")
    ax.legend(ncol=2, fontsize=8)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(ARTIFACTS_DIR / f"temporal__mean_over_time__{DATE_TAG}.png", dpi=200, bbox_inches="tight")
    plt.close()

    # 3. Peak latency
    tables_dir = ROOT / "artifacts" / "tables"
    tables_dir.mkdir(parents=True, exist_ok=True)
    peak_rows = []
    for sub in PARTICIPANTS:
        d = var_time_df[var_time_df["participant"] == sub]
        idx_max = d["var"].idxmax()
        peak_rows.append({
            "participant": sub,
            "peak_time_ms": d.loc[idx_max, "time_ms"],
            "peak_var": d.loc[idx_max, "var"],
        })
    peak_df = pd.DataFrame(peak_rows)
    peak_df.to_csv(tables_dir / f"temporal__peak_variance_latency__{DATE_TAG}.csv", index=False)

    # 4. Variance by window
    window_rows = []
    for sub in PARTICIPANTS:
        d = var_time_df[var_time_df["participant"] == sub]
        bl = (d["time_ms"] >= -200) & (d["time_ms"] < 0)
        er = (d["time_ms"] >= 0) & (d["time_ms"] < 200)
        lt = (d["time_ms"] >= 200) & (d["time_ms"] <= 800)
        window_rows.append({
            "participant": sub,
            "baseline_var": d.loc[bl, "var"].mean(),
            "early_var": d.loc[er, "var"].mean(),
            "late_var": d.loc[lt, "var"].mean(),
        })
    window_df = pd.DataFrame(window_rows)
    window_df.to_csv(tables_dir / f"temporal__variance_by_window__{DATE_TAG}.csv", index=False)

    fig, ax = plt.subplots(figsize=(8, 5))
    x = np.arange(len(PARTICIPANTS))
    w = 0.25
    ax.bar(x - w, window_df["baseline_var"], width=w, label="Baseline (-200–0 ms)", color="gray", alpha=0.8)
    ax.bar(x, window_df["early_var"], width=w, label="Early (0–200 ms)", color="steelblue", alpha=0.8)
    ax.bar(x + w, window_df["late_var"], width=w, label="Late (200–800 ms)", color="coral", alpha=0.8)
    ax.set_xticks(x)
    ax.set_xticklabels(PARTICIPANTS)
    ax.set_ylabel("Mean variance")
    ax.set_title("Variance by time window (train)")
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(ARTIFACTS_DIR / f"temporal__variance_by_window__{DATE_TAG}.png", dpi=200, bbox_inches="tight")
    plt.close()

    print("Peak variance latency:")
    print(peak_df.to_string(index=False))
    print("\nVariance by window:")
    print(window_df.to_string(index=False))
    print("\nArtifacts saved to", ARTIFACTS_DIR, "and", tables_dir)


if __name__ == "__main__":
    main()

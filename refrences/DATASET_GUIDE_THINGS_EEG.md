THINGS-EEG (Preprocessed) — Practical + Conceptual Guide
0) What this dataset is (one-paragraph mental model)

This dataset is EEG recorded while participants viewed many natural images of objects (from the THINGS image database) in a rapid serial visual presentation (RSVP) stream. The key idea is: each “condition” is a specific image, and you have repeated EEG trials for each image. The authors structured the release to support modeling (especially “encoding”: predicting EEG from images) by providing a large training partition (many images, fewer repeats each) and a test partition (fewer images, many repeats each). 

neuroimage264

1) Experimental design in plain English

Each participant completed four sessions. Images were presented in sequences of 20, quickly, to collect a huge number of trials efficiently.

Core timing (important for interpreting “times”):

Each image is shown for 100 ms.

Stimulus onset asynchrony (SOA) is 200 ms (so a new image starts every 200 ms).

Trials/epochs are extracted from -200 ms to +800 ms relative to stimulus onset. 

neuroimage264

There was also an orthogonal target detection task (Buzz Lightyear images). Crucially, target trials are excluded from the modeling dataset the authors analyze/release for the main purposes. 

neuroimage264

2) Train vs Test partitions (what “condition” means)

A “condition” = an image identity.

The dataset is split by object concepts:

Training partition: many object concepts, multiple images per concept.

Test partition: fewer object concepts, one image per concept.
This split prevents leakage: test concepts do not appear in training concepts. 

neuroimage264

Why the repetition counts differ:

Training: many images → fewer repeats each (still enough to learn mapping).

Test: fewer images → many repeats each (enables high-SNR averages, noise ceilings, robust evaluation). 

neuroimage264

3) What’s in the preprocessed .npy files

You described this structure (and it matches what the paper reports conceptually):

Each preprocessed_eeg_*.npy loads to a Python dictionary with:

preprocessed_eeg_data: EEG array

ch_names: list of channel names (strings)

times: vector of time points (seconds relative to stimulus onset)

Shapes (the most important part)

Training:

preprocessed_eeg_data has shape:
[participants, conditions, repetitions, channels, timepoints]

Paper-reported (per participant) “BioTrain” shape:
(16540 training image conditions, 4 repeats, 17 channels, 100 time points) 

neuroimage264


Your packaging adds a leading participant axis (e.g., 16 participants in your note; the paper collected 10 participants—so double-check your actual file after loading).

Test:

Paper-reported (per participant) “BioTest” shape:
(200 test image conditions, 80 repeats, 17 channels, 100 time points) 

neuroimage264

Interpretation of axes:

conditions: which image

repetitions: repeated EEG responses to the same image

channels: selected occipital/parietal electrodes (17)

timepoints: downsampled time grid across -0.2s to +0.8s (100 samples at 100 Hz)

4) Preprocessing pipeline (what was done before you see these arrays)

This matters because it explains what “the numbers” mean and what steps you do not need to repeat.

4.1 Recording and initial settings

Recorded with 64-channel cap (10–10 system).

Sampling rate during acquisition: 1000 Hz

Online filter: 0.1–100 Hz

Online reference: Fz 

neuroimage264

4.2 Epoching (trial extraction)

They cut the continuous EEG into stimulus-locked epochs:

Epoch window: [-200 ms, +800 ms] relative to each image onset. 

neuroimage264

4.3 Baseline correction (per trial, per channel)

For each trial and channel, they subtract the mean of the pre-stimulus baseline.

If x_c(t) is the signal at channel c and time t, and baseline indices correspond to t ∈ [-200, 0):

Baseline mean:
b_c = (1 / |B|) * Σ_{t ∈ B} x_c(t)

Corrected signal:
x̃_c(t) = x_c(t) - b_c

This removes DC offsets and slow drifts at the trial level. 

neuroimage264

4.4 Downsampling

After epoching, they downsample to 100 Hz, yielding 100 time points over the 1-second epoch window. 

neuroimage264


(That’s why times has length 100.)

4.5 Channel selection (17 posterior channels)

They keep 17 occipital/parietal channels (posterior visual areas), listed in the paper:
O1, Oz, O2, PO7, PO3, POz, PO4, PO8, P7, P5, P3, P1, Pz, P2, P4, P6, P8 

neuroimage264

So these signals are already spatially restricted to the most relevant scalp region for visual processing.

4.6 Trial selection / repetition selection

Target trials (Buzz Lightyear) excluded from further analysis.

Training: they retain 4 repeats per training image condition.

Test: they retain 80 repeats per test image condition. 

neuroimage264

4.7 Multivariate Noise Normalization (MVNN)

They apply “multivariate noise normalization” per session (often used to whiten correlated sensor noise). 

neuroimage264

Practical intuition:

EEG channels have correlated noise (volume conduction, shared artifacts).

MVNN tries to transform channel space so that noise covariance is closer to identity.

A common form (high-level):

Estimate noise covariance Σ (often from baseline or residuals).

Compute whitening matrix W = Σ^{-1/2}.

Transform each trial’s channel vector at each timepoint:
y(t) = W x(t)

You usually do not re-do MVNN unless you’re reprocessing from raw.

5) How to load and sanity-check the data (copy/paste starter)
import numpy as np

def load_preprocessed(path):
    d = np.load(path, allow_pickle=True).item()
    X = d["preprocessed_eeg_data"]
    ch_names = d["ch_names"]
    times = d["times"]
    return X, ch_names, times

Xtr, ch_tr, t_tr = load_preprocessed("preprocessed_eeg_training.npy")
Xte, ch_te, t_te = load_preprocessed("preprocessed_eeg_test.npy")

print("TRAIN X shape:", Xtr.shape)
print("TEST  X shape:", Xte.shape)
print("Num channels:", len(ch_tr), len(ch_te))
print("Time grid (s):", t_tr[0], "to", t_tr[-1], "len:", len(t_tr))

assert ch_tr == ch_te, "Channel lists differ between train/test."
assert np.allclose(t_tr, t_te), "Time grids differ between train/test."

# Helpful axis naming (adjust if your file differs)
# Example expected:
# TRAIN: [P, 16540, 4, 17, 100]
# TEST:  [P,   200, 80, 17, 100]

If your shapes differ from expectations, do not guess. Print the shape, and then confirm which axis corresponds to what by checking:

does len(ch_names) match one axis?

does len(times) match one axis?

6) Mapping trials to image conditions (what “Image Set wiki” implies)

Your note says: to match each EEG “condition” to an image condition, you refer to the Image Set wiki.

Conceptually, that means there exists a stable indexing scheme:

condition index i in [0 … n_conditions-1] corresponds to a specific image file / concept / metadata row.

The training set likely maps to (concept, exemplar) pairs.

The test set maps to 200 test concepts (1 image each).

So your pipeline should treat:

X[:, i, ...] as “EEG for image i”
and merge it with image metadata via that mapping.

Practical advice:

Create a table conditions.csv with columns like: split, condition_index, concept_id, image_id, image_path, category.

Everything downstream becomes dramatically easier (decoding, RSA, encoding models, visualizations).

7) What most people do with this dataset (and what your “end goal” can be)

The paper’s central modeling objective is “encoding”: learn a function that maps from image features (often extracted by a DNN) to EEG responses. 

neuroimage264

A clean, realistic end-to-end pipeline:

Load EEG arrays and metadata mapping (image ↔ condition index).

Basic QC:

Plot grand average ERP across all conditions (average over conditions and repeats).

Plot per-channel ERP and channel-average ERP.

Build simple baselines:

Linear classification/decoding: can you distinguish subsets of images/categories from EEG at certain time windows?

Encoding model (core):

Choose image features:

simplest: pretrained CNN embedding (e.g., ResNet layer features)

For each timepoint and channel, fit a regression from image features → EEG value.

Evaluate:

correlation across conditions at each timepoint

decoding generalization checks

optionally: noise ceiling style split-half reliability

Package results:

a short report + a small webpage (figures, key findings, methods)

That’s “fully on theme” with how the dataset was intended to be used.

8) How your Bayesian change-point idea can fit (optional but very compatible)

Even though this dataset is not a continuous “streaming EEG” file (it’s epoched), you can still do change-point style modeling in at least two ways:

A) Within-epoch change points (per trial)

For each trial (or averaged ERP), treat time as a series and ask:
“Is there a time where the mean/slope/variance shifts significantly?”

This can identify onset/transition moments (e.g., early visual response vs later components).

B) Across repetitions (nonstationarity across trials)

For a fixed condition and channel/time window feature, look at the sequence over repetitions:
“Does the response distribution drift across repeats?”

That’s closer to adaptation / state-change questions.

This aligns with your earlier adaptation question because “detecting when the data-generating process changes” is basically the Bayesian framing of “are we adapting to signal or to noise/state drift?”

9) Suggested “first notebook” checklist (minimum to be confident you’re doing it right)

Print shapes + confirm axis meanings.

Confirm times range is ~ -0.2 to 0.8 seconds with 100 points.

Compute and plot:

ERP = X.mean(axis=(conditions_axis, repetitions_axis)) → shape [participants, channels, time] (or without participants if you select one).

Plot per-participant channel-average ERP and check it looks plausible (clear stimulus-locked structure).

Confirm train vs test difference:

train has many conditions, few repeats

test has few conditions, many repeats

Once those pass, you’re ready to model.

10) Citation

Gifford, A. T., Dwivedi, K., Roig, G., & Cichy, R. M. (2022). A large and rich EEG dataset for modeling human visual object recognition. NeuroImage, 264, 119754. 
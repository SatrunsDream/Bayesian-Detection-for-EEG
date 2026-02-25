# Bayesian Change-Point Detection for EEG Time-Series Analysis

## Motivation: EEG nonstationarity and why change points matter for adaptive BCIs

Electroencephalography (EEG) is notoriously **nonstationary**: the signal’s statistical properties can drift within a session (e.g., vigilance fluctuations, changing task engagement), across sessions/days (e.g., electrode placement/impedance changes), and across individuals. citeturn10search0turn10search16turn10search18turn10search13 These shifts often look like *distribution shift* (covariate shift / concept drift), which disrupts fixed decoders and creates the practical need for robust monitoring and (sometimes) adaptation. citeturn10search0turn10search2turn10search16turn10search8

A change-point detection (CPD) layer is a natural “safety gate” for adaptive brain–computer interfaces (BCIs): instead of continuously updating a decoder (risking “tracking noise”), CPD can trigger **targeted actions** only when there is strong evidence that the data-generating regime has changed. This aligns with common BCI concerns that nonstationarity (including user-state changes) can degrade performance unless managed carefully. citeturn10search0turn10search16turn10search27

EEG change points are also clinically and practically meaningful because many relevant events are intrinsically **state transitions**: seizure onset/progression, burst-suppression transitions (anesthesia), or artifact onset (eye movements, muscle bursts, electrode pops). citeturn15view0turn17view0turn4search27turn9search24 Public datasets explicitly annotate several of these phenomena, including the entity["organization","CHB-MIT Scalp EEG Database","eeg seizure dataset"] (pediatric scalp EEG with seizures, annotated) citeturn9search4turn9search8 and the entity["organization","TUH EEG Seizure Corpus","clinical eeg seizure dataset"] / entity["organization","TUH EEG Artifact Corpus","clinical eeg artifact dataset"] (clinical EEG with seizure and artifact annotations). citeturn9search1turn9search24turn9search5

## Foundational Bayesian change-point models

Bayesian CPD methods can be roughly split into **offline (retrospective) segmentation** and **online (sequential) detection**.

### Offline Bayesian segmentation

Classic Bayesian formulations treat a time series as a partition into regimes (segments), then infer a posterior distribution over the partition structure and segment parameters.

* **Product partition models (PPMs)**: entity["people","Daniel Barry","statistician"] and entity["people","James A. Hartigan","statistician"] introduced PPMs for multiple change-point problems, emphasizing computational convenience from the product-form partition prior (cohesion functions). citeturn11search0turn11search4turn11search25  
* **Hierarchical Bayesian change-point analysis**: entity["people","Bradley P. Carlin","biostatistician"] with entity["people","Alan E. Gelfand","statistician"] and entity["people","Adrian F. M. Smith","statistician"] developed hierarchical Bayesian approaches to changepoints, helping formalize uncertainty in both the change locations and regime parameters. citeturn11search2turn11search6  
* **Model comparison and regime-switch formulations**: entity["people","Siddhartha Chib","econometrician"] presented Bayesian estimation and comparison of multiple change-point models, relating changepoints to latent regime indicators and principled Bayesian model comparison. citeturn11search1turn11search9turn11search5  
* **Retrospective multiple changepoints**: entity["people","David A. Stephens","statistician"] (among others) contributed Bayesian retrospective identification strategies and examples, helping establish practical inference workflows. citeturn11search16turn11search23

A concise synthesis of Bayesian changepoint formulations (including PPMs and Bayesian computational strategies) is also provided in the “analysis of changepoint models” chapter by entity["people","Idris A. Eckley","statistician"], entity["people","Paul Fearnhead","changepoint statistician"], and entity["people","Rebecca Killick","statistician"]. citeturn11search21turn11search32

### Online Bayesian change-point detection

A canonical turning point for online Bayesian CPD is the Bayesian Online Change-Point Detection (BOCPD) framework by entity["people","Ryan Prescott Adams","bocpd author"] and entity["people","David J. C. MacKay","information theory researcher"]. citeturn6search12turn12search27 Their approach maintains a *full posterior* over “run length” (time since last changepoint) and updates this distribution sequentially as new samples arrive—precisely the structure you want for adaptive BCIs that must operate in real time.

Related online work includes online inference for *multiple* changepoints by entity["people","Ziwei Liu","statistician"] and Paul Fearnhead, offering exact online formulations for multiple changepoint problems in a Bayesian setting. citeturn1search11

## Bayesian Online Change-Point Detection mechanics for EEG features

This section gives the “mathematical intuition” you asked for, focusing on what you would actually implement for EEG streams (raw samples or extracted features like bandpower).

### Run-length posterior recursion

BOCPD defines a latent variable \(r_t\), the **run length** at time \(t\): the number of time steps since the most recent changepoint. citeturn6search12turn12search27 The key quantity is the filtering posterior:
\[
p(r_t \mid x_{1:t}),
\]
which is updated using a message-passing recursion.

At a high level, BOCPD uses two ingredients. citeturn6search12turn12search27

1. **Hazard function** \(H(r)\): \(H(r)\) is the conditional probability that a changepoint occurs *now*, given the current run length is \(r\). With a constant hazard \(H(r)=h\), segment durations are geometrically distributed. citeturn6search12turn12search27  
2. **Predictive likelihood** under the within-run observation model: \(p(x_t \mid r_{t-1}, x_{t-r_{t-1}:t-1})\), i.e., the probability of the new point given the data since the last changepoint (because those data determine the within-segment parameter posterior). citeturn6search12turn12search27

The recursion updates the joint \(p(r_t, x_{1:t})\) from \(p(r_{t-1}, x_{1:t-1})\) by considering two possibilities: either **growth** (no changepoint, \(r_t=r_{t-1}+1\)) or **reset** (changepoint, \(r_t=0\)). citeturn6search12turn12search27 Normalizing across all \(r_t\) yields \(p(r_t \mid x_{1:t})\).

### The role of conjugacy in Gaussian EEG modeling

BOCPD is modular: if you can compute predictive probabilities efficiently, you can plug in many observation models. citeturn6search12turn12search27 For EEG, a common pragmatic choice is to run BOCPD on **features** computed per short window (e.g., every 0.5–2 seconds): log bandpower (\(\delta,\theta,\alpha,\beta,\gamma\)), line noise power, Hjorth parameters, amplitude variance, etc. This has two advantages: (i) it reduces autocorrelation compared to raw samples, and (ii) it makes “regime changes” interpretable as changes in mean/variance/power. citeturn15view0turn9search24turn10search16

For scalar Gaussian features per window, a standard conjugate model is:
\[
x \mid \mu,\sigma^2 \sim \mathcal{N}(\mu,\sigma^2), \quad (\mu,\sigma^2) \sim \text{Normal-Inverse-Gamma}.
\]
Conjugacy gives an analytic posterior update and an analytic predictive distribution for \(x_t\), keeping each BOCPD update fast. citeturn6search12turn12search27

For multivariate feature vectors (or multi-channel summaries), the analogous conjugate choice is a Normal–Inverse-Wishart (NIW) model; but in EEG, full covariance modeling can be unstable in high dimensions unless you regularize aggressively (see the shrinkage section below). citeturn8search1turn8search0turn8search6

### Hazard functions: encoding expected regime durations

The hazard function \(H(r)\) is where you inject domain knowledge: expected stability of regimes, expected artifact durations, or task-structured transitions (e.g., blocks/trials). BOCPD treats the hazard as part of the generative model. citeturn6search12turn12search27

In cognitive and behavioral modeling, hazard-rate learning (how quickly the agent expects changes) is itself a topic of research; BOCPD-style models have been used to relate hazard assumptions to adaptive learning behavior. citeturn1search18turn18search32 For your EEG/BCI use case, you can treat hazard selection as (i) a hyperparameter tuned on labeled events (seizure onset / artifacts), or (ii) a sensitivity knob controlling false alarms vs detection delay.

### Computational complexity and approximations

Exact BOCPD naively updates all run lengths up to \(t\), yielding \(O(t^2)\) total work over a stream. citeturn6search12turn12search27 Practical deployments therefore use approximations such as truncating run lengths, pruning low-probability run lengths, or approximate inference schemes. This issue is explicit in EEG/ECoG applications: entity["people","Rakesh Malladi","electrical engineer"], entity["people","Giridhar P. Kalamangalam","neurologist"], and entity["people","Behnaam Aazhang","electrical engineer"] propose both an online Bayesian CPD algorithm and a lower-complexity approximation (linear-time in the number of points) for epileptic activity segmentation. citeturn17view0

## EEG-specific applications of change-point detection

Below is a synthesis of **peer-reviewed** work applying changepoint / change-detection ideas to EEG or closely related neural recordings (scalp EEG, intracranial EEG/ECoG, M/EEG), spanning seizure detection, artifact detection, ERP change analysis, and network-state transitions.

### Seizure-related regime changes and spectral nonstationarity

**Schröder & Ombao — FreSpeD (2019, JASA)**  
Research question: Can we detect subtle pre-seizure and seizure-spread changes in multi-channel seizure EEG, with frequency-specific interpretability? citeturn15view0turn15view2  
Dataset: Multi-channel epileptic seizure EEG recording (paper emphasizes focal region identification and seizure timing). citeturn15view0turn15view2  
Method: Frequency-specific changepoint detection using a CUSUM-type statistic within binary segmentation; detects changes in autospectra and cross-coherence, not just time-domain shifts. citeturn15view0turn15view2  
Results: FreSpeD identifies seizure onset timing and the seizure focal region, and detects subtle cross-coherence changes immediately before onset that earlier analyses missed. citeturn15view0turn15view2  
Limitations: The core FreSpeD algorithm is not a fully Bayesian posterior-over-run-length method (it is CUSUM + binary segmentation), so uncertainty quantification differs from BOCPD-style posteriors. citeturn15view0

**Malladi, Kalamangalam, Aazhang (2013, Asilomar)**  
Research question: Can we perform online Bayesian segmentation of epileptic activity without needing to pre-specify the number of brain states or state parameters, and while handling non-i.i.d. structure? citeturn17view0  
Dataset: Epileptic patient ECoG (and discussion includes EEG/ECoG characteristics). citeturn17view0  
Method: Online Bayesian CPD extended beyond i.i.d. segment assumptions; includes a quadratic exact approach and a linear-time approximate approach motivated by list-decoding style approximations. citeturn17view0  
Results: Demonstrates segmentation of ECoG into state-like regimes; emphasizes suitability for real-time monitoring due to online operation and reduced complexity approximations. citeturn17view0turn16search1  
Limitations: Conference paper scope; practical performance depends heavily on the chosen likelihood model for segment dynamics and on approximation settings. citeturn17view0

**Kirch, Muhsal, Ombao (2015, JASA)**  
Research question: How can we detect changes in multivariate time series with an explicit application to EEG data? citeturn20search0  
Dataset: EEG application (paper is explicitly positioned as “with application to EEG data”). citeturn20search0  
Method: Multivariate changepoint detection theory and tests (not BOCPD), aimed at statistically controlled detection in multivariate time series. citeturn20search0  
Results and limitations: This line of work is important because it connects EEG change detection to multivariate time-series change theory; however, it is not inherently designed as an “artifact flagger” and may require careful feature/assumption matching for EEG. citeturn20search0

**Saab & Gotman (2005, Clinical Neurophysiology)**  
Research question: Can we detect seizure onset in scalp EEG with tunable trade-offs between sensitivity, false detections, and detection delay? citeturn19search0  
Method/result: Proposes an onset detection/warning system based on estimating seizure probability over EEG windows, emphasizing an explicit sensitivity–delay–false alarm tradeoff via thresholds. citeturn19search0  
Why it matters here: This is a good foil for Bayesian CPD—thresholded systems highlight the same operational tradeoffs that Bayesian posteriors can surface probabilistically.

### Artifacts and non-neural “faults” as change points

**Garnett, Osborne, Reece, Roberts (2010, The Computer Journal)**  
Research question: Can we do sequential Bayesian prediction in the presence of changepoints and *faults*, and does this help on EEG-like signals? citeturn14view4turn6search5  
Data: Demonstrations include EEG with an epileptic event and EEG contaminated by saccade/EOG artifacts (treated as faults). citeturn14view4turn6search5  
Method: Gaussian process (GP) framework that infers a posterior over changepoint location and can separate “plant” (true signal) from “fault” (artifact) contributions under explicit models. citeturn14view4turn6search5  
Results: The EEG examples show posterior localization of seizure onset and the ability to model/remove EOG artifact under the fault model. citeturn14view4turn6search5  
Limitations: GP modeling can be computationally heavier than conjugate BOCPD for long streams; it also requires kernel/hyperparameter choices and (for faults) some artifact shape assumptions. citeturn14view4

### General EEG change detection systems

**Gao et al. (2018, Frontiers in Physiology)**  
Research question: How can we do unsupervised, real-time change detection in EEG streams for clinical monitoring? citeturn13search5turn14view5  
Method: Windowed feature extraction + AR modeling + anomaly scoring + a randomized power martingale statistical test to declare changes. citeturn13search5turn14view5  
Results: Demonstrates automated detection on EEG monitoring data and discusses sensitivity vs false alarms via thresholding (e.g., reports both detections and false detections relative to expert decisions). citeturn19search2turn14view5  
Limitations: This is not Bayesian CPD, but it is an important comparator because it addresses the same real-time constraints and uses statistical testing rather than posterior run-length uncertainty. citeturn13search5

**Chen, Lu, Shang, Xie (2019, IEEE Access)**  
Research question: Can EEG change points be detected via structural time-series modeling of EEG dynamics? citeturn13search15turn13search3  
Method: Structural time-series analysis and a detection procedure for EEG change points (IEEE Access paper; widely cited in EEG anomaly/change detection surveys). citeturn13search15turn13search3  
Limitations: Not a Bayesian run-length posterior method; interpretability depends on modeling choices (sub-band filtering + structural model components). citeturn13search15

**Mohamed Saaid et al. (2011, conference proceedings chapter)**  
Research question: How can we locate change points in EEG via model fitting with heuristic optimization? citeturn14view2turn13search2  
Method: Models EEG with a sinusoidal–Heaviside function and uses particle swarm optimization (PSO) to fit parameters and the changepoint location. citeturn13search2turn13search20  
Why it is useful here: It is a representative “optimization-first” alternative that highlights what Bayesian CPD replaces: instead of a single best changepoint estimate, Bayesian methods return a calibrated uncertainty distribution over changepoint timing.

### Cognitive state transitions and network-level change points

**Yokoyama & Kitajo (2022, NeuroImage)**  
Research question: Can we detect change points in *dynamical network structure* of synchronous neural oscillations using probabilistic inference, including in real EEG? citeturn22search0turn14view3turn22search2  
Dataset: Includes empirical EEG demonstrations (paper states it applies to EEG data as well as modeled data). citeturn14view3turn22search3  
Method: Combines dynamical model-based network analysis (phase-coupled oscillator model) with sequential Bayesian inference; uses information-theoretic criteria (notably KL divergence between prior and posterior) to quantify changes. citeturn14view3turn22search0  
Results: Demonstrates detection of change points in estimated network couplings and success on EEG examples. citeturn14view3turn22search3  
Limitations: This is higher-level than “mean/variance change in a single channel”; it requires a network estimation pipeline and assumptions about oscillator phase coupling. citeturn14view3

**Sommer et al. (2022, Brain Sciences)**  
Research question: How can changepoints be reliably detected in noisy neuroscience time series, with relevance to single-trial ERP measurements? citeturn4search23turn12search4  
Dataset: Includes an example application to single-trial ERP amplitudes (N250 during face learning). citeturn4search23turn12search4  
Method: Piecewise regression / changepoint estimation methods compared under noise; presents a method (RESPERM) and compares against segmented regression approaches. citeturn4search23turn12search4  
Why it matters: Trial-by-trial ERP amplitude/latency can drift due to cognitive state changes; changepoint framing makes “when did learning shift?” statistically explicit. citeturn12search4

**Weindel et al. (2024, Imaging Neuroscience)**  
Research question: Can we discover trial-wise sequences of cognitive events in multivariate neural signals such as EEG/MEG? citeturn12search31  
Why it matters: This kind of “event boundary” discovery overlaps conceptually with changepoint detection—especially when your goal is to label state transitions in neural time series without dense manual annotation. citeturn12search31  
Limitation for your scope: Depending on the specific method details, this may be closer to event segmentation than classic BOCPD run-length inference; but it is a useful bridge to cognitive-state transition modeling. citeturn12search31

## Comparison to non-Bayesian approaches and deep learning CPD

Change detection has a large toolbox; positioning Bayesian CPD is easier if you compare along **uncertainty**, **online operation**, **assumptions**, and **computational cost**.

### Classical sequential detectors: CUSUM and friends

CUSUM charts trace back to entity["people","E. S. Page","statistician"]’s foundational work and remain a dominant baseline for quickest change detection. citeturn7search8turn7search0 Modern tutorials and reviews describe how CUSUM and related methods (e.g., Shiryaev–Roberts procedures) optimize different detection criteria (false alarm constraints vs detection delay). citeturn7search19turn7search31turn7search7

Relation to Bayesian CPD: many Bayesian methods can be seen as maintaining a *posterior belief* over changepoint occurrence rather than a single running statistic—often improving interpretability (probabilities) and enabling principled thresholding/fusion with other uncertainty signals. citeturn6search12turn12search27

### Offline segmentation baselines: dynamic programming and PELT

Offline CPD often minimizes a cost + penalty over segmentations and can be solved efficiently with methods such as PELT (pruned exact linear time) by entity["people","Rebecca Killick","statistician"] and colleagues. citeturn7search6turn7search22 Practical offline libraries implement a wide variety of these methods; for example, the Python library entity["organization","ruptures","python changepoint library"] is explicitly designed for offline segmentation of nonstationary signals with exact/approximate algorithms. citeturn21search3turn21search11

Relation to Bayesian CPD: if your BCI requirement is *online*, these offline methods are best used as (i) evaluation baselines on recorded data, and (ii) sanity checks for whether your Bayesian detector is overly sensitive. citeturn6search12turn21search3

### HMM-based segmentation

Hidden Markov models (HMMs) and related switching state-space models can be viewed as a probabilistic segmentation approach where changes occur via latent state transitions rather than explicit changepoint priors. Chib’s Bayesian multiple change-point work directly connects to regime-switch/HMM thinking. citeturn11search1turn11search12 For EEG, HMM/state-space approaches are widely used for ongoing state tracking (e.g., anesthesia depth tracking and burst suppression state estimation), but they correspond to a different modeling commitment than BOCPD’s explicit run-length posterior. citeturn4search27turn4search24

### Deep learning for CPD and EEG anomalies

Deep learning CPD methods (supervised and unsupervised) are now broad enough to warrant dedicated reviews, emphasizing performance and evaluation practices across datasets and tasks. citeturn13search31 In EEG specifically, deep networks dominate *classification* tasks like seizure detection, but this often shifts the problem from “detect changepoints” to “classify windows,” which can obscure uncertainty about *when* the regime truly changed. citeturn5academia41turn9search12

A useful hybrid idea for your project framing is: **use Bayesian CPD as an interpretable boundary detector**, and treat deep learning as a feature extractor or as a competing approach whose outputs can be monitored for drift/change. Deep learning papers that explicitly address uncertainty/label ambiguity in EEG (e.g., Bayesian uncertainty-aware training frameworks) illustrate why *calibrated uncertainty* is a key theme in modern EEG detection. citeturn5academia41

## Hierarchical Bayesian extensions for multichannel and multisubject EEG

Real EEG deployments rarely involve a single clean channel. Two principles become central: (i) **share statistical strength** across channels/subjects to stabilize estimates, and (ii) **encourage sparsity** so that you can localize which channels/features truly changed.

### Modeling across channels and trials with hierarchical priors

Multichannel EEG often shows inter-trial variability that can confound naive averaging. Hierarchical Bayesian models address this by explicitly modeling shared structure plus trial-level variation; an example is hierarchical Bayesian spatio-temporal decomposition for multichannel EEG (multiple trials, contrasting conditions). citeturn8search3turn8search39turn12search34

For spectral features, Bayesian work has built structured models of EEG spectral dynamics (e.g., region-referenced spectral power dynamics with Bayesian modeling) that formalize how spectral power evolves and varies across regions. citeturn8search11 These ideas can be paired with changepoint models by letting **segment parameters be hierarchical**, e.g., segment means in bandpower share a group prior across channels.

### Shrinkage priors and empirical Bayes: stabilizing multivariate CPD

High-dimensional covariance and connectivity estimates are unstable without regularization; shrinkage estimators for EEG connectivity are a concrete example of how to make multi-channel dependence estimation well-posed. citeturn8search6

For Bayesian regularization, weakly informative variance priors (e.g., half‑t priors) help avoid pathologies of overly diffuse inverse-gamma priors in hierarchical variance components. citeturn8search1turn8search9 For sparse “which channel changed?” inference, global–local shrinkage priors such as the horseshoe are canonical. citeturn8search0turn8search4turn8search36

Why this matters for your project: if you aim to detect changepoints in *many* EEG-derived features (channels × bands × connectivity measures), shrinkage can prevent “everything looks like a change” and improve interpretability by concentrating posterior mass on a small subset of truly changing dimensions. citeturn8search0turn8search1turn8search6

## Evaluation, implementation guidance, and an adaptive-BCI synthesis

### How change points are validated in EEG

EEG changepoints can be validated in several ways, and the literature often mixes them:

* **Against expert annotations** (common in seizures): compare detected changepoints to annotated seizure onset/offset times (detection delay, sensitivity, false alarm rate). The CHB-MIT dataset explicitly provides seizure annotations (e.g., 182 annotated seizures reported in the PhysioNet release notes). citeturn9search4turn9search8 The TUH seizure corpus was designed as a large clinical corpus with seizure event annotations. citeturn9search1turn9search13  
* **Against artifact labels**: the TUH EEG Artifact Corpus includes labeled artifacts (eye movement, chewing, shivering, electrode pop/static/lead artifacts, muscle), enabling artifact-onset detection evaluation. citeturn9search24  
* **Against experimental structure**: ERP/learning experiments can validate changepoints by alignment to task blocks or known manipulation times, then test whether changepoints correspond to behavioral shifts (e.g., learning phases). citeturn12search4turn12search5  
* **Against synthetic ground truth**: generate piecewise stationary EEG-like features with injected changepoints to evaluate calibration and robustness under controlled SNR and drift. This is widely recommended in CPD evaluation surveys because it isolates algorithmic behavior from labeling ambiguity. citeturn6search17turn6search35

### Metrics commonly used

CPD surveys and sequential detection tutorials emphasize several standard metrics. citeturn6search35turn7search31turn6search17 For EEG you typically report:

* **Event-level detection**: sensitivity/recall for true events (e.g., seizure onset detected within tolerance), and false positives per hour (or per minute). citeturn19search0turn9search12  
* **Detection delay**: time from true change to declared detection (critical in seizure warning/BCI adaptation latency). citeturn19search0turn7search31  
* **AUC / ROC** (when you can vary a decision threshold): common in EEG detection tasks and survey benchmarks. citeturn12search7turn9search12turn6search35  
* **Calibration of posterior probabilities** (Bayesian-specific): whether “0.9 probability of changepoint” corresponds to ~90% empirical frequency under repeated trials/simulations. This is rarely done well in EEG CPD and is a genuine gap/opportunity. citeturn6search12turn12search27turn6search35

### Practical implementation guidance for your project

**Recommended modeling approach for a class project (high value, not overly ambitious)**

1. **Work on windowed EEG features**, not raw samples, unless you have a strong reason. Frequency-band log power and simple time-domain statistics map naturally to “changes in mean/variance/spectral power,” which is exactly your project goal. citeturn15view0turn10search16turn9search24  
2. **Start with scalar-feature BOCPD** (per channel × band) using a conjugate Gaussian model (Normal–Inverse-Gamma). This gives you fast predictive updates and a clean run-length posterior. citeturn6search12turn12search27  
3. **Aggregate across channels** in an interpretable way:
   * conservative: declare a “global EEG changepoint” if many channels show high posterior changepoint probability at the same time, or if a robust statistic (median across channels) spikes;  
   * localization: rank channels by posterior changepoint probability to identify likely artifact channels vs widespread state change.
4. **Evaluate on at least one artifact-labeled dataset and one seizure-labeled dataset**:
   * artifacts: TUH EEG Artifact Corpus (TUAR). citeturn9search24  
   * seizures: CHB-MIT (scalp) or TUH seizure corpus (clinical). citeturn9search8turn9search1turn9search13

**Handling multichannel EEG without exploding complexity**

* If you want multivariate modeling, avoid full covariance unless you have enough data per segment. Consider diagonal covariance first.  
* If you do model covariance/connectivity, use shrinkage/regularization (either frequentist shrinkage estimators for spectral matrices or Bayesian shrinkage priors). citeturn8search6turn8search0turn8search1  
* For network-level change points, treat Yokoyama & Kitajo’s approach as an advanced reference: it shows how change detection can be performed on inferred coupling parameters using sequential Bayesian inference and KL divergence, but it is more complex than feature-level BOCPD. citeturn22search0turn14view3

**Libraries and tooling**

* For Bayesian modeling and custom BOCPD variants, common probabilistic programming options include entity["organization","PyMC","probabilistic programming library"], entity["organization","Stan","probabilistic programming language"], and entity["organization","NumPyro","jax probabilistic programming"]. citeturn21search0turn21search1turn21search2turn21search6  
* For strong non-Bayesian baselines in offline segmentation, the Python library entity["organization","ruptures","python changepoint library"] is widely used and well documented. citeturn21search3turn21search11  
* For EEG data loading and preprocessing pipelines, entity["organization","MNE-Python","eeg meg analysis library"] provides extensive dataset tooling and tutorials and is widely used in EEG/MEG research workflows. citeturn9search36turn9search7turn9search3

### A synthesized framework for Bayesian CPD in adaptive BCI systems

A concrete way to align your original question (“how do we know adaptation is helping vs tracking noise?”) with your Bayesian CPD project is to treat CPD as a **decision layer**:

1. **Continuous monitoring**: Run BOCPD on a small set of stable EEG features (and/or decoder residuals).  
2. **Probabilistic change evidence**: Use \(p(r_t=0 \mid x_{1:t})\) (the posterior probability of a changepoint “now”) as an interpretable change signal rather than a heuristic drift score. citeturn6search12turn12search27  
3. **Action gating**: Adapt the decoder only if:
   * changepoint probability exceeds a threshold for a sustained period (reduces sensitivity to transient noise), **and**
   * the post-change model has *better predictive performance* (e.g., higher predictive likelihood / lower posterior predictive error) than the pre-change model—this is exactly what BOCPD computes internally via predictive probabilities. citeturn6search12turn12search27turn17view0  
4. **Safety and rollback**: If adaptation reduces performance, you can revert to the previous regime parameters (Bayesian “model memory”), which is much harder to do robustly with purely gradient-based continuous adaptation. (This idea matches why many BCIs avoid frequent online adaptation: it is easy to make things worse if you adapt blindly.) citeturn10search0turn10search2turn10search16

### A realistic positioning statement for your project

Your project can contribute a clearly scoped, non-overambitious result:

*“We implement Bayesian Online Change-Point Detection on interpretable EEG features (mean/variance and bandpower statistics) to flag regime shifts corresponding to artifacts and clinically relevant transitions (seizure onset). We evaluate detection delay and false alarms on public EEG corpora with event annotations, and we propose a ‘gated adaptation’ principle for BCIs: adapt the decoder only when the changepoint posterior and predictive-likelihood improvement jointly support a true distribution shift.”* citeturn6search12turn9search24turn9search8turn9search1turn15view0

### Suggested reading order

Foundations (Bayesian CPD core)  
1. Adams & MacKay — BOCPD (run-length posterior, hazard, conjugate updates). citeturn6search12turn12search27  
2. Barry & Hartigan — product partition models for offline Bayesian changepoints. citeturn11search0turn11search4  
3. Carlin, Gelfand, Smith — hierarchical Bayesian changepoint analysis. citeturn11search2  
4. Chib — Bayesian estimation/comparison of multiple changepoint models. citeturn11search1turn11search9  
5. Eckley, Fearnhead, Killick — overview chapter connecting models and inference. citeturn11search21turn11search32  

EEG and neural applications (closest to your project)  
6. Schröder & Ombao — FreSpeD (frequency-specific changepoints in seizure EEG; interpretability). citeturn15view0turn15view2  
7. Malladi, Kalamangalam, Aazhang — online Bayesian changepoints for epileptic activity segmentation (real-time concerns). citeturn17view0  
8. Yokoyama & Kitajo — Bayesian/probabilistic changepoints in dynamic brain networks with EEG application. citeturn22search0turn14view3  
9. Garnett et al. — Bayesian changepoints + fault models for EEG events/artifacts. citeturn14view4  
10. Gao et al. and Chen et al. — strong non-Bayesian EEG change-detection comparators for evaluation framing. citeturn13search5turn13search15  

Advanced regularization and multichannel modeling  
11. Gelman — variance priors for hierarchical models; horseshoe and shrinkage surveys for sparsity. citeturn8search1turn8search0turn8search36  
12. EEG multichannel hierarchical models and shrinkage connectivity estimators. citeturn8search3turn8search6turn8search11

## References

Adams, entity["people","Ryan Prescott Adams","bocpd author"], & entity["people","David J. C. MacKay","information theory researcher"]. (2007). *Bayesian Online Changepoint Detection*. arXiv:0710.3742. citeturn12search27turn6search12

Aminikhanghahi, entity["people","Samaneh Aminikhanghahi","computer scientist"], & entity["people","Diane J. Cook","computer scientist"]. (2016). *A Survey of Methods for Time Series Change Point Detection*. *Knowledge and Information Systems*. citeturn5search28turn6search35

Barry, entity["people","Daniel Barry","statistician"], & Hartigan, entity["people","James A. Hartigan","statistician"]. (1992). Product Partition Models for Change Point Problems. *The Annals of Statistics*. doi:10.1214/aos/1176348521. citeturn11search0turn11search8

Barry, entity["people","Daniel Barry","statistician"], & Hartigan, entity["people","James A. Hartigan","statistician"]. (1993). A Bayesian Analysis for Change Point Problems. *Journal of the American Statistical Association*. doi:10.1080/01621459.1993.10594323. citeturn11search4

Blankertz, entity["people","Benjamin Blankertz","bci researcher"], et al. (2007). Invariant Common Spatial Patterns: Alleviating Nonstationarities in Brain-Computer Interfacing. *NeurIPS*. citeturn10search13turn10search18

Carlin, entity["people","Bradley P. Carlin","biostatistician"], Gelfand, entity["people","Alan E. Gelfand","statistician"], & Smith, entity["people","Adrian F. M. Smith","statistician"]. (1992). Hierarchical Bayesian Analysis of Changepoint Problems. *Journal of the Royal Statistical Society: Series C (Applied Statistics)*. doi:10.2307/2347570. citeturn11search2

Cecotti, entity["people","Hubert Cecotti","bci researcher"]. (2025). *Non-Stationarity in Brain-Computer Interfaces*. arXiv:2512.15941. citeturn10search0turn10search1

Chen, entity["people","Guangyuan Chen","researcher"], Lu, entity["people","Guoliang Lu","researcher"], Shang, entity["people","Wei Shang","researcher"], & Xie, entity["people","Zhaohong Xie","researcher"]. (2019). Automated change-point detection of EEG signals based on structural time-series analysis. *IEEE Access*. doi:10.1109/ACCESS.2019.2956768. citeturn13search15turn13search3

Chib, entity["people","Siddhartha Chib","econometrician"]. (1998). Estimation and comparison of multiple change-point models. *Journal of Econometrics*, 86(2), 221–241. doi:10.1016/S0304-4076(97)00115-2. citeturn11search9turn11search5

Eckley, entity["people","Idris A. Eckley","statistician"], Fearnhead, entity["people","Paul Fearnhead","changepoint statistician"], & Killick, entity["people","Rebecca Killick","statistician"]. (2011). Analysis of changepoint models. In *Bayesian Time Series Models*. doi:10.1017/CBO9780511984679.011. citeturn11search32turn11search21

Gao, entity["people","Zhen Gao","researcher"], et al. (2018). Automatic Change Detection for Real-Time Monitoring of EEG Signals. *Frontiers in Physiology*, 9, 325. doi:10.3389/fphys.2018.00325. citeturn13search5turn14view5turn19search2

Garnett, entity["people","Roman Garnett","machine learning researcher"], Osborne, entity["people","Michael A. Osborne","machine learning researcher"], Reece, entity["people","Stephen Roberts","machine learning researcher"], & others. (2010). Sequential Bayesian Prediction in the Presence of Changepoints and Faults. *The Computer Journal*. citeturn14view4turn6search5

Gelman, entity["people","Andrew Gelman","statistician"]. (2006). Prior distributions for variance parameters in hierarchical models. *Bayesian Analysis*. citeturn8search1turn8search9

Kirch, entity["people","Claudia Kirch","statistician"], Muhsal, entity["people","Birte Muhsal","statistician"], & Ombao, entity["people","Hernando Ombao","statistician"]. (2015). Detection of Changes in Multivariate Time Series With Application to EEG Data. *Journal of the American Statistical Association*. doi:10.1080/01621459.2014.957545. citeturn20search0

Killick, entity["people","Rebecca Killick","statistician"], Fearnhead, entity["people","Paul Fearnhead","changepoint statistician"], & Eckley, entity["people","Idris A. Eckley","statistician"]. (2012). Optimal detection of changepoints with a linear computational cost. *Journal of the American Statistical Association*. doi:10.1080/01621459.2012.737745. citeturn7search22turn7search6

Malladi, entity["people","Rakesh Malladi","electrical engineer"], Kalamangalam, entity["people","Giridhar P. Kalamangalam","neurologist"], & Aazhang, entity["people","Behnaam Aazhang","electrical engineer"]. (2013). Online Bayesian change point detection algorithms for segmentation of epileptic activity. *Asilomar Conference on Signals, Systems and Computers*. doi:10.1109/ACSSC.2013.6810619. citeturn17view0turn16search1

Mohamed Saaid, entity["people","Mohamed F. Mohamed Saaid","researcher"], et al. (2011). Change Point Detection of EEG Signals Based on Particle Swarm Optimization. *Conference proceedings chapter*. doi:10.1007/978-3-642-21729-6_122. citeturn13search2turn13search6turn14view2

Ombao, entity["people","Hernando C. Ombao","statistician"], Raz, entity["people","Jonathan A. Raz","statistician"], von Sachs, entity["people","Rainer von Sachs","statistician"], & Malow, entity["people","Beth A. Malow","neurologist"]. (2001). Automatic statistical analysis of bivariate nonstationary time series. *Journal of the American Statistical Association*. doi:10.1198/016214501753168244. citeturn20search2turn20search5turn20search8

Saab, entity["people","Marie E. Saab","researcher"], & Gotman, entity["people","Jean Gotman","neuroscientist"]. (2005). A system to detect the onset of epileptic seizures in scalp EEG. *Clinical Neurophysiology*. citeturn19search0

Schröder, entity["people","Anna Louise Schröder","statistician"], & Ombao, entity["people","Hernando Ombao","statistician"]. (2019). FreSpeD: Frequency-Specific Change-Point Detection in Epileptic Seizure Multi-Channel EEG Data. *Journal of the American Statistical Association*, 114(525), 115–128. doi:10.1080/01621459.2018.1476238. citeturn15view2turn15view0

Sommer, entity["people","Wolfgang Sommer","researcher"], et al. (2022). Changepoint Detection in Noisy Data Using a Novel Regression-Based Method and Its Relevance for Single-Trial ERP Information. *Brain Sciences*, 12(5), 525. citeturn4search23turn12search4

Stan Development Team. (Stan documentation). citeturn21search1turn21search5

The entity["organization","PhysioNet","physiological data repository"] CHB-MIT Scalp EEG Database description. citeturn9search8turn9search4

The entity["organization","Neural Engineering Data Consortium","eeg data repository"] TUH EEG corpus and corpora descriptions (TUEG/TUSZ/TUAR). citeturn9search5turn9search24turn9search1

Truong, entity["people","Charles Truong","researcher"], Oudre, entity["people","Laurent Oudre","researcher"], & Vayatis, entity["people","Nicolas Vayatis","researcher"]. (2018). Selective review of offline change point detection methods. arXiv:1801.00718. citeturn6search17

Xu, entity["people","Rui Xu","researcher"]. (2025). Change-point detection with deep learning: A review. citeturn13search31

Yokoyama, entity["people","Hiroshi Yokoyama","neuroscientist"], & Kitajo, entity["people","Keiichi Kitajo","neuroscientist"]. (2022). Detecting changes in dynamical structures in synchronous neural oscillations using probabilistic inference. *NeuroImage*, 252, 119052. doi:10.1016/j.neuroimage.2022.119052. citeturn22search0turn22search2
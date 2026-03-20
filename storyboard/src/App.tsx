import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  Brain, 
  Activity, 
  Zap, 
  Database, 
  LineChart, 
  MessageSquare, 
  ChevronDown,
  Info,
  Layers,
  Target,
  FlaskConical,
  ShieldCheck,
  TrendingUp,
  Search,
  Waves,
  FileText,
  FileSignature,
  Github
} from 'lucide-react';
import { StorySection } from './components/StorySection';
import { Math } from './components/Math';
import { EEGPlaceholder } from './components/EEGPlaceholder';
import { BOCPDLogic } from './components/BOCPDLogic';
import { DataTable } from './components/DataTable';
import { InteractiveChart } from './components/InteractiveChart';
import { RawEEGViewer } from './components/RawEEGViewer';
import { RunLengthVis } from './components/RunLengthVis';
import { DataTensorVis } from './components/DataTensorVis';
import { FeatureTensorSchematic } from './components/FeatureTensorSchematic';
import { LogBandpowerChart } from './components/LogBandpowerChart';
import { PdfViewerModal } from './components/PdfViewerModal';
import { cn } from './lib/utils';
import * as data from './data/researchData';

export default function App() {
  const [pdfModal, setPdfModal] = useState<'paper' | 'contract' | null>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/paper') return 'paper';
      if (p === '/contract') return 'contract';
    }
    return null;
  });
  const { scrollYProgress } = useScroll();

  // Sync modal with URL for shareable links: /paper and /contract
  useEffect(() => {
    const syncFromUrl = () => {
      const path = window.location.pathname;
      if (path === '/paper') setPdfModal('paper');
      else if (path === '/contract') setPdfModal('contract');
      else setPdfModal(null);
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const openPdf = (which: 'paper' | 'contract') => {
    setPdfModal(which);
    window.history.pushState({}, '', `/${which}`);
  };

  const closePdf = () => {
    setPdfModal(null);
    window.history.pushState({}, '', '/');
  };
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* PDF viewer modals */}
      <PdfViewerModal
        isOpen={pdfModal === 'paper'}
        onClose={closePdf}
        src="/report.pdf"
        title="Bayesian Neural Shifts — Report"
      />
      <PdfViewerModal
        isOpen={pdfModal === 'contract'}
        onClose={closePdf}
        src="/contract.pdf"
        title="Bayesian Neural Shifts — Contract"
      />

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation Rail */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 z-40">
        {['hero', 'abstract', 'intro', 'dataset', 'features', 'methods', 'results', 'discussion', 'conclusion'].map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className="group relative flex items-center"
          >
            <div className="w-1 h-8 bg-zinc-800 group-hover:bg-zinc-600 transition-colors rounded-full overflow-hidden">
              <div className="w-full h-full bg-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
            </div>
            <span className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase tracking-widest font-mono text-zinc-500 whitespace-nowrap">
              {id}
            </span>
          </a>
        ))}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 via-transparent to-transparent opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl">
              <Brain className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-[0.9] mb-6">
            BAYESIAN <br />
            <span className="text-emerald-500">NEURAL</span> SHIFTS
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-light leading-relaxed mb-4">
            Bayesian Online Change-Point Detection for EEG Regime-Shift Analysis: 
            A Study on the THINGS-EEG Dataset
          </p>
          <p className="text-sm text-zinc-600 mb-4">
            Made by Sardor Sobirov and Diego Arevalo Fernandez
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="https://github.com/SatrunsDream/Bayesian-Detection-for-EEG" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors text-sm">
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <button
              type="button"
              onClick={() => openPdf('paper')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors text-sm"
              title="View report PDF"
            >
              <FileText className="w-4 h-4" />
              Paper
            </button>
            <button
              type="button"
              onClick={() => openPdf('contract')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors text-sm"
              title="View contract PDF"
            >
              <FileSignature className="w-4 h-4" />
              Contract
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-mono">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 text-zinc-600 animate-bounce" />
        </motion.div>
      </section>

      {/* Abstract */}
      <StorySection id="abstract" className="bg-zinc-950/30">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">01 / Abstract</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">When Does the Statistical Behavior of EEG Change?</h2>
        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-xl leading-relaxed text-zinc-400 first-letter:text-6xl first-letter:font-bold first-letter:text-emerald-500 first-letter:mr-3 first-letter:float-left">
            This project asks a specific question: <span className="text-white font-medium italic">when</span> does the statistical behavior of EEG change? The method is Bayesian Online Change-Point Detection (BOCPD). We apply it to two notions of time: across repeated stimulus presentations and within a single 1-second EEG epoch after stimulus onset.
          </p>
          <p className="text-lg leading-relaxed text-zinc-400 mt-6">
            The dataset is THINGS-EEG: 10 participants, 17 posterior channels, preprocessed stimulus-locked epochs. Scalar features (log bandpower, windowed mean, windowed log variance) feed into a conjugate-Gaussian BOCPD model to identify regime transitions.
          </p>
          <p className="text-base leading-relaxed text-zinc-500 mt-4">
            <strong className="text-zinc-400">Key findings:</strong> (a) BOCPD detects regime shifts in log bandpower across repetitions for ~17% of conditions (max CP prob 0.455); (b) within-epoch windowed variance, but not mean, raises changepoint probability above the prior for 8/10 participants (peak latency 295–645 ms); (c) synthetic validation: 91% detection at effect size 2.0, 1% false-positive rate.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
              <h4 className="text-emerald-500 font-mono text-xs uppercase mb-4 tracking-widest">Across Repetitions</h4>
              <p className="text-sm text-zinc-400">80 test presentations per condition. Time = repetition index. Detecting adaptation, attentional drift, and habituation across repeated views of the same image.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
              <h4 className="text-emerald-500 font-mono text-xs uppercase mb-4 tracking-widest">Within Epoch</h4>
              <p className="text-sm text-zinc-400">Stimulus onset to 800 ms post-stimulus. Time = ms within the epoch. Detecting regime transitions between early sensory (P1/N1) and later cognitive stages.</p>
            </div>
          </div>
        </div>
      </StorySection>

      {/* Introduction */}
      <StorySection id="intro">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">02 / Introduction</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">From Prediction to Regime Structure</h2>
        <p className="text-zinc-400 leading-relaxed mb-6">
          Neural signals are inherently nonstationary. Within a single stimulus-locked epoch, the brain's response evolves over time. Across repeated trials, neural activity may shift due to adaptation, attention, or fatigue. Prior work on THINGS-EEG has focused on predictive encoding; we instead ask when the data-generating process changes.
        </p>
        <p className="text-zinc-400 leading-relaxed mb-8">
          Change-point detection identifies boundaries between segments drawn from distinct distributions. BOCPD maintains a posterior over the run length (time since the last changepoint) and updates it sequentially, well-suited for temporally evolving signals like EEG.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
          <div className="space-y-4">
            {[
              { icon: Activity, title: "Sensory Processing", desc: "P1/N1 components at ~100–170 ms" },
              { icon: Zap, title: "Cognitive Stages", desc: "P300, N400, and beyond" },
              { icon: Target, title: "Adaptation", desc: "Habituation and attentional fluctuations" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-800">
                <item.icon className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-white font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <RawEEGViewer />
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <Waves className="w-4 h-4 text-emerald-500" />
            Variance Dynamics
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            A key question: does the variance change over the epoch? If it increases systematically, that suggests a structured transition BOCPD can detect. Mean-based features average out condition-specific activity; variance-based features capture how responses spread over time. Baseline &lt; early &lt; late (late ≈ 2× baseline). Variance motivates within-epoch changepoint detection.
          </p>
        </div>
        <div className="mt-12 w-screen relative left-1/2 -translate-x-1/2">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <InteractiveChart 
              type="line"
              title="Temporal Variance Structure"
              data={data.TEMPORAL_VARIANCE_BY_WINDOW.map(d => ({
                name: d.participant,
                baseline: d.baseline_var,
                early: d.early_var,
                late: d.late_var
              }))}
              xKey="name"
              yKey="late"
              color="#10b981"
            />
          </div>
        </div>
      </StorySection>

      {/* Dataset & QC */}
      <StorySection id="dataset" className="bg-zinc-950/30">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">03 / Dataset & Quality Control</span>
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tight mb-8">THINGS-EEG</h2>
        <div className="space-y-8 mb-12">
          <div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              THINGS-EEG records EEG while participants view natural object images in rapid serial visual presentation (RSVP): 100 ms per image, 200 ms stimulus onset asynchrony. An orthogonal target detection task maintained attention; target trials were excluded. Preprocessed data includes: stimulus-locked epochs, baseline correction (-200 to 0 ms), downsampling to 100 Hz, and multivariate noise normalization (MVNN) per session.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Per participant: <strong className="text-zinc-300">Train</strong> 16,540 conditions × 4 reps; <strong className="text-zinc-300">test</strong> 200 conditions × 80 reps. Both: 17 posterior channels, 100 timepoints (100 Hz), epoch [-200, +795] ms.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Shape <span className="font-mono text-emerald-400">(conditions × repetitions × channels × timepoints)</span>: train <span className="font-mono text-white">(16540, 4, 17, 100)</span>, test <span className="font-mono text-white">(200, 80, 17, 100)</span>. Entry X[c,r,j,t] = EEG amplitude for condition c, repetition r, channel j, at timepoint t.
            </p>
            <p className="text-zinc-500 text-xs leading-relaxed mb-4">
              Each axis: <strong className="text-zinc-400">conditions</strong> = image identity; <strong className="text-zinc-400">repetitions</strong> = repeated trials of same image; <strong className="text-zinc-400">channels</strong> = 17 posterior electrodes; <strong className="text-zinc-400">timepoints</strong> = time within the epoch. Each (c,r) pair is a 17×100 matrix: the spatial-temporal neural response to one presentation. Channels: Pz, P3, P7, O1, Oz, O2, P4, P8, P1, P5, PO7, PO3, POz, PO4, PO8, P6, P2.
            </p>
          </div>
          <DataTensorVis />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="text-2xl font-bold text-white">10</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Participants</div>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="text-2xl font-bold text-white">17</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Channels</div>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                QC Summary
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                sub-04 was consistently flagged as an outlier due to high condition-to-condition variance and extreme value ranges. sub-01 also shows substantially wider amplitude ranges (min = -329).
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Train and test log bandpower statistics are closely matched (mean difference ~0.08), confirming both partitions draw from the same distributional family. sub-04 is the most negative (mean -3.89 train / -3.94 test), consistent with QC flags.
              </p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <InteractiveChart 
              type="bar"
              title="Spectral Power Distribution"
              data={data.SPECTRAL_BANDPOWER}
              xKey="band"
              yKey="power_mean"
              color="#34d399"
            />
          </div>
        </div>
        <div className="mt-12 w-full">
          <DataTable 
            title="Quality Control Summary" 
            data={data.QC_SUMMARY} 
            headers={['participant', 'pct_outliers', 'acf_lag1_mean', 'snr_mean', 'flag_high_outliers']} 
            description="Participant-wise quality metrics and outlier flags."
          />
        </div>
        <div className="mt-12 p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 w-full">
          <h4 className="text-white font-bold mb-6 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-500" />
            Exploratory Data Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-zinc-500 leading-relaxed">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">Value ranges</p>
              <p>Most participants have amplitude ranges of approximately ±15–45 (arbitrary units post-MVNN). Two participants (sub-01, sub-04) show substantially wider ranges (sub-01 min = -329; sub-04 range = [-180, +191]), flagged for quality control.</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">Within-condition variance</p>
              <p>Mean variance across conditions: 0.39–0.60 (training). sub-04 exhibits anomalously high condition-to-condition variance (std = 2.68 vs. 0.08–0.58 for others).</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">Drift across repetitions</p>
              <p>Mean amplitude across 8 bins of 10 test repetitions shows flat or mildly fluctuating trajectories; no strong systematic drift.</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">Spectral bandpower</p>
              <p>Log bandpower in the five canonical bands (δ, θ, α, β, γ) is approximately Gaussian-distributed, supporting the use of a conjugate Normal model in BOCPD.</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">Quality control</p>
              <p>All channel SNRs (post-stimulus / baseline variance) exceed 1.0 (range 1.5–3.5). Lag-1 autocorrelation within epochs is high (0.72–0.82), motivating windowed features rather than raw sample-level BOCPD.</p>
            </div>
          </div>
        </div>
      </StorySection>

      {/* Feature Extraction */}
      <StorySection id="features" className="bg-zinc-950/30">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">04 / Feature Extraction</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tight mb-8">EDA to Features</h2>

        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          EDA guided three design choices: data quality (mostly acceptable; sub-01 and sub-04 flagged), structure (variance changes over time; mean drift across reps is mild), and feature suitability (log bandpower ~Gaussian; windowed summaries for high autocorrelation).
        </p>

        <div className="space-y-8 mb-12">
          <h4 className="text-lg font-bold text-white">EDA insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">Value ranges</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Flatten training data → min, max, mean, std. sub-01 and sub-04 had much wider ranges → flagged as potential quality concerns.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">Within-condition variance</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Variance across timepoints per condition/rep/channel. sub-04 had unusually large spread across conditions → outlier participant.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">Drift across repetitions</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Mean amplitude across repetition bins was mostly flat; no gross monotonic drift. If BOCPD finds changepoints, it’s not trivial drift.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">Spectral bandpower</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Welch PSD → integrate within bands → log transform. Log bandpower is approximately Gaussian → justifies conjugate Normal model in BOCPD.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">Temporal variance</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Variance over time within epoch: baseline &lt; early &lt; late (late ≈ 2× baseline). Motivated within-epoch variance analysis.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-2">QC: outliers, SNR, autocorrelation</p>
              <p className="text-xs text-zinc-400 leading-relaxed">sub-04 highest outlier fraction. SNR &gt; 1 for all. Lag-1 autocorrelation high (0.72–0.82) → windowed features, not raw samples.</p>
            </div>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            EDA confirmed: data quality acceptable (some flagged participants); variance ramps over time; mean drift mild; log bandpower ~Gaussian; raw samples too autocorrelated, so windowed summaries are required.
          </p>

          <h4 className="text-lg font-bold text-white mt-12">Features in detail</h4>
          <div className="space-y-6">
            <div>
              <p className="font-mono text-sm text-emerald-500 mb-2">Log bandpower</p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                Used for across-repetition analysis. Welch’s method for PSD, then integrate within each canonical band. If S(f) is the PSD, bandpower integrates S(f) over each band; log: ℓ_b = log P_b. The log compresses the right tail and makes the distribution more symmetric; that’s why we checked Gaussianity of log bandpower, not raw power.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 mb-2 overflow-x-auto">
                <Math latex="P_b = \int_{f_{b,\mathrm{low}}}^{f_{b,\mathrm{high}}} S(f)\, df,\qquad \ell_b = \log P_b" display />
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                The log compresses the right tail and produces a more symmetric, approximately Gaussian distribution.
              </p>
              <p className="text-xs text-zinc-500 font-mono">After extraction: train (16540, 4, 17, 5), test (200, 80, 17, 5). Last axis = 5 bands.</p>
            </div>
            <div>
              <p className="font-mono text-sm text-emerald-500 mb-2">Windowed mean amplitude</p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                For within-epoch analysis. Grand-average time series with 10-sample window, stride 5. At 100 Hz: 100 ms windows, 50 ms stride. For each window <em>k</em>:
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 mb-2 overflow-x-auto">
                <Math latex="\bar{x}_k = \frac{1}{W} \sum_{i=kS}^{kS+W-1} x_i" display />
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">Produces ~19 windows from the 100-point epoch.</p>
            </div>
            <div>
              <p className="font-mono text-sm text-emerald-500 mb-2">Windowed log variance</p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                Same windowing, but compute variance inside each window and log it:
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 mb-2 overflow-x-auto">
                <Math latex="v_k = \log\big(\mathrm{Var}(\{x_i : i \in [kS,\, kS+W-1]\}) + \epsilon\big)" display />
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                EDA showed baseline &lt; early &lt; late variance, which strongly motivates this feature for BOCPD.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h4 className="text-white font-bold mb-4">Resulting data structure</h4>
            <FeatureTensorSchematic />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <LogBandpowerChart data={data.SPECTRAL_BANDPOWER} />
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                <h4 className="text-white font-bold mb-2">Temporal variance: baseline &lt; early &lt; late</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Variance over time within the epoch is consistent: baseline lowest, early post-stimulus higher, late highest (late roughly 2× baseline). This temporal change in second-order structure motivates variance as a changepoint feature.
                </p>
                <InteractiveChart
                  type="bar"
                  title="Variance by epoch phase (mean across participants)"
                  data={[
                    { phase: 'baseline', value: data.TEMPORAL_VARIANCE_BY_WINDOW.reduce((a, d) => a + d.baseline_var, 0) / data.TEMPORAL_VARIANCE_BY_WINDOW.length },
                    { phase: 'early', value: data.TEMPORAL_VARIANCE_BY_WINDOW.reduce((a, d) => a + d.early_var, 0) / data.TEMPORAL_VARIANCE_BY_WINDOW.length },
                    { phase: 'late', value: data.TEMPORAL_VARIANCE_BY_WINDOW.reduce((a, d) => a + d.late_var, 0) / data.TEMPORAL_VARIANCE_BY_WINDOW.length }
                  ]}
                  xKey="phase"
                  yKey="value"
                  color="#34d399"
                  height={180}
                />
              </div>
            </div>
          </div>
        </div>
      </StorySection>

      {/* Methods */}
      <StorySection id="methods">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">05 / Methods</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">The Bayesian Engine.</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-4">
            <FlaskConical className="w-8 h-8 text-emerald-500" />
            <h3 className="text-lg font-bold text-white">Feature Extraction</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              We extract three types of scalar features: <strong>Log Bandpower</strong> (for across-repetition analysis), 
              <strong>Windowed Mean Amplitude</strong>, and <strong>Windowed Log Variance</strong> (for within-epoch analysis).
              The logarithmic transform compresses the heavy right tail of power values, yielding a more symmetric distribution suitable for the Gaussian model.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-4">
            <Activity className="w-8 h-8 text-emerald-500" />
            <h3 className="text-lg font-bold text-white">Run-Length Posterior</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              The latent variable is the run length <em>r_t</em>, defined as the number of time steps since the most recent changepoint.
              BOCPD maintains a posterior distribution over this run length, updating it sequentially with each new observation.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-4">
            <Layers className="w-8 h-8 text-emerald-500" />
            <h3 className="text-lg font-bold text-white">Conjugate Model</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              We use a <strong>Gaussian observation model</strong> with unknown mean and known variance, together with a Gaussian prior on the mean.
              Conjugacy ensures the posterior over the mean remains Gaussian as data are observed within each segment, enabling efficient exact inference without storing full history.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/30 rounded-3xl p-8 border border-zinc-800">
          <h3 className="text-2xl font-bold text-white mb-8">BOCPD Recursion</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 overflow-x-auto">
                <Math latex="p(r_t \mid x_{1:t}) = \frac{p(r_t, x_{1:t})}{\sum_{r_t} p(r_t, x_{1:t})}" display />
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                The central quantity is the filtering posterior over run length. At each time step, 
                the model evaluates two possibilities: Growth (no changepoint) or Reset (changepoint).
              </p>
              <BOCPDLogic />
            </div>
            <div className="space-y-8">
              <RunLengthVis />
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Hyperparameters
                </h4>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono uppercase tracking-widest">
                  <div className="text-zinc-500">Hazard Rate (h)</div>
                  <div className="text-emerald-500 text-right">0.02 / 0.05</div>
                  <div className="text-zinc-500">Prior Variance</div>
                  <div className="text-emerald-500 text-right">1.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StorySection>

      {/* Results */}
      <StorySection id="results" className="bg-zinc-950/30">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">06 / Results</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">Evidence of Shift.</h2>

        <div className="space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Across-Repetition Analysis</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                <span className="text-emerald-400 font-medium">Single channel (P1):</span> We use the alpha band (8–13 Hz) for high variability and link to visual processing; channel P1 as a representative posterior electrode. BOCPD on 60 sequences (3 participants × 20 conditions, alpha band, 80 reps each). Max CP prob ranged 0.044–0.455. 10/60 conditions (17%) show max CP &gt; 0.15.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                We then aggregated log bandpower over all 17 channels (mean per rep) and re-ran BOCPD; channel aggregation substantially improves detection.
              </p>
              <DataTable 
                title="Across-Repetition Summary (Single Channel)" 
                data={data.ACROSS_REPS_SUMMARY} 
                headers={['participant', 'condition', 'max_cp_prob']} 
                description="Top conditions, P1 only."
              />
            </div>
            <div className="space-y-8">
              <InteractiveChart 
                type="bar"
                title="Single Channel (P1) Top Conditions"
                data={data.ACROSS_REPS_SUMMARY.slice(0, 8).map(d => ({ ...d, name: `${d.participant} ${d.condition}` }))}
                xKey="name"
                yKey="max_cp_prob"
                referenceLine={0.05}
                color="#f59e0b"
              />
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <h4 className="text-white font-bold mb-2">Interpretation</h4>
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                  Alpha bandpower is not uniformly stationary across repetitions. Aggregating over channels exposes regime shifts that a single electrode may miss.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-16 border-t border-zinc-800">
            <h3 className="text-2xl font-bold text-white mb-6">Single Channel vs Channel-Aggregated</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Averaging log bandpower over 17 channels reduces channel-specific noise and exposes regime shifts that a single electrode may miss. Same design (sub-01, sub-05, sub-10 × 20 conditions, alpha band).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Mean max CP prob</div>
                <div className="text-2xl font-bold text-white">0.113 <span className="text-zinc-500 font-normal">→</span> <span className="text-emerald-500">0.187</span></div>
                <div className="text-xs text-emerald-500 mt-1">+65%</div>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Conditions &gt; 0.15</div>
                <div className="text-2xl font-bold text-white">10 <span className="text-zinc-500 font-normal">→</span> <span className="text-emerald-500">31</span></div>
                <div className="text-xs text-emerald-500 mt-1">3× more</div>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Max max CP prob</div>
                <div className="text-2xl font-bold text-white">0.455 <span className="text-zinc-500 font-normal">→</span> <span className="text-emerald-500">0.610</span></div>
                <div className="text-xs text-emerald-500 mt-1">sub-05 cond 158</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InteractiveChart 
                type="bar"
                title="Single Channel (P1)"
                data={[...data.ACROSS_REPS_SUMMARY].sort((a, b) => b.max_cp_prob - a.max_cp_prob).slice(0, 8).map(d => ({ ...d, name: `${d.participant} ${d.condition}` }))}
                xKey="name"
                yKey="max_cp_prob"
                referenceLine={0.15}
                color="#f59e0b"
                height={280}
              />
              <InteractiveChart 
                type="bar"
                title="Channel-Aggregated (mean over 17 ch)"
                data={[...(data.ACROSS_REPS_AGGREGATE_SUMMARY || [])].sort((a, b) => b.max_cp_prob - a.max_cp_prob).slice(0, 8).map(d => ({ ...d, name: `${d.participant} ${d.condition}` }))}
                xKey="name"
                yKey="max_cp_prob"
                referenceLine={0.15}
                color="#10b981"
                height={280}
              />
            </div>
            <div className="mt-6 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <h4 className="text-white font-bold mb-2">Key finding</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                sub-05 cond 158: 0.093 (single channel) → 0.610 (aggregate)- sixfold increase. Recommendation: use channel-aggregated features when the optimal single channel is unknown.
              </p>
            </div>
            <div className="mt-6">
              <DataTable 
                title="Channel-Aggregated Summary" 
                data={data.ACROSS_REPS_AGGREGATE_SUMMARY || []} 
                headers={['participant', 'condition', 'max_cp_prob']} 
                description="BOCPD on mean log bandpower over 17 channels."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pt-16 border-t border-zinc-800">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Within-Epoch Variance</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                <strong className="text-emerald-400">Windowed mean (negative result):</strong> BOCPD on grand-average windowed mean produced no detection; max CP prob equals hazard for all 10 participants. Averaging smooths away condition-specific ERP structure.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                <strong className="text-emerald-400">Windowed variance:</strong> BOCPD on windowed log variance (19 windows, h = 0.02) produced elevated CP probabilities for 8/10 participants. Peak latencies post-stimulus (295–645 ms). sub-05 max CP prob 0.108 (5.4× hazard); sub-06/sub-10 weakest (1.8–1.9×).
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Mode of peak latency = 395 ms (3 participants); mean = 355 ms across all 10. Per-condition variance analysis (60 conditions) yielded max CP prob up to 0.195 (sub-02, cond 7251 at 295 ms). Peak latencies show bimodal structure (early 45–295 ms and late 495–745 ms), suggesting image category may modulate when the variance regime shift occurs.
              </p>
            </div>
            <div>
              <DataTable 
                title="Within-Epoch Variance Latency" 
                data={data.WITHIN_EPOCH_VARIANCE} 
                headers={['participant', 'peak_cp_ms', 'max_cp_prob']} 
                description="Peak changepoint latency for windowed log variance."
              />
            </div>
          </div>

          <div className="pt-16 border-t border-zinc-800">
            <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 w-full">
              <h3 className="text-xl font-bold text-white mb-6">Synthetic Validation</h3>

              <div className="mb-8 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                <h4 className="text-sm font-bold text-white">Procedure</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  100 sequences of length 100 each, changepoint at t = 50. <strong className="text-zinc-300">Mean shift:</strong> pre N(0,1), post N(δ,1); δ ∈ {0.5, 1.0, 1.5, 2.0}. <strong className="text-zinc-300">Variance shift:</strong> pre N(0,1), post N(0,δ²); δ ∈ {1.5, 2.0, 2.5, 3.0}. <strong className="text-zinc-300">No-CP:</strong> N(0,1) throughout for FPR. BOCPD: same model as main analyses. Detection: max CP prob &gt; 0.5 within ±5 of true CP.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                  <InteractiveChart 
                    type="line"
                    title="Detection Rate vs Effect Size (Mean Shift)"
                    data={data.SYNTHETIC_EVAL.filter(d => d.cp_type === 'mean')}
                    xKey="effect_size"
                    yKey="detection_rate"
                    color="#3b82f6"
                    height={380}
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    <strong className="text-zinc-400">Three results matter.</strong> First: the detector performs well on mean shifts, reaching 91% at δ = 2.0, with mean latency near zero. Second: variance shifts are harder to detect (24 to 33% rate; mean max CP prob 0.37 to 0.77; delayed detection +22 to +27 steps) because the observation model is tuned for mean shifts. Third: FPR on stationary sequences is only 1%, mean max CP prob 0.14; changepoint probabilities well above 0.14 are unlikely to arise from noise alone.
                  </p>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Real EEG (0.04 to 0.11) lies below synthetic variance-shift range (0.37 to 0.77), indicating a gradual within-epoch transition rather than an abrupt step.
                  </p>
                  <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed space-y-2">
                    <p>Mean: 91% at δ=2.0; FPR 1%</p>
                    <p>Variance: 24 to 33%; max CP 0.77</p>
                  </div>
                </div>
              </div>
              <DataTable 
                title="Synthetic Evaluation" 
                data={data.SYNTHETIC_EVAL} 
                headers={['effect_size', 'cp_type', 'detection_rate', 'mean_max_cp_prob']} 
              />
            </div>
          </div>
        </div>
      </StorySection>

      {/* Discussion */}
      <StorySection id="discussion" className="bg-zinc-950/30">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">07 / Discussion</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-8">When Does EEG Change?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-zinc-400 leading-relaxed">
              This study examined a simple question: when does the statistical behavior of EEG change? Using BOCPD on the THINGS-EEG dataset, we found that the answer depends strongly on the domain of analysis and on the feature used. Across repetitions, a meaningful subset of image conditions showed evidence of nonstationarity in log alpha bandpower, and this effect became substantially stronger after aggregating across posterior channels. This suggests that repeated presentations of the same image do not always produce responses drawn from a single stationary distribution. For some conditions, the neural response appears to shift over the course of 80 repetitions, which is consistent with adaptation or attentional drift. This matters for downstream modeling, since averaging across all repetitions may combine distinct response regimes for some stimuli.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Within epochs, the contrast between features is the clearest result of the paper. Windowed mean amplitude produced little evidence of changepoints, while windowed log variance detected regime transitions in 8 of 10 participants, with peak latencies concentrated between 295 ms and 645 ms. This pattern is consistent with the EDA, which showed that variance increases systematically across the epoch whereas the mean remains comparatively smooth after averaging. In other words, the detector is not simply responding to any EEG feature. It is specifically sensitive to the evolving spread of condition-specific responses across time. This makes variance a more informative feature than mean amplitude for detecting within-epoch regime shifts in this dataset.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              The synthetic validation provides an important qualification. Under the Gaussian conjugate model, BOCPD performs well for mean shifts but is less sensitive to variance shifts. This likely means that the within-epoch variance results are conservative rather than exaggerated. A richer observation model that jointly infers both mean and variance would likely improve sensitivity to second-order changes while preserving the probabilistic structure of BOCPD.
            </p>
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <h4 className="text-white font-bold mb-2">Key Insight</h4>
              <p className="text-sm text-zinc-400 italic">
                Feature choice is as important as the detection method. Variance-based features provide the clearest access to regime structure in neural dynamics.
              </p>
            </div>
          </div>
          <div className="space-y-8">
            <h4 className="text-sm font-mono uppercase tracking-widest text-zinc-500">Limitations</h4>
            <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
              <p>Several limitations remain. The across-repetition analysis was restricted to 3 participants and a limited set of sampled conditions, and the main single-channel analysis likely underestimates the extent of nonstationarity relative to spatially aggregated features. The within-epoch analysis was performed on grand-average sequences, which necessarily suppresses some condition-specific dynamics. These choices were appropriate for an initial study, but future work should extend the framework to single-trial and single-condition sequences, broader channel and band coverage, and more flexible observation models.</p>
            </div>
            <h4 className="text-sm font-mono uppercase tracking-widest text-zinc-500">Future Directions</h4>
            <div className="space-y-4">
              {[
                "Normal-Inverse-Gamma model for joint mean-variance inference",
                "Multi-channel aggregation and fusion of changepoint posteriors",
                "Condition-level within-epoch analysis for image-specific dynamics",
                "Hierarchical BOCPD to share strength across participants"
              ].map((dir, i) => (
                <div key={i} className="flex gap-3 items-center text-sm text-zinc-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {dir}
                </div>
              ))}
            </div>
          </div>
        </div>
      </StorySection>

      {/* Conclusion */}
      <StorySection id="conclusion">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">08 / Conclusion</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-8">Summary</h2>
        <div className="space-y-6">
          <p className="text-zinc-400 leading-relaxed text-lg">
            We applied Bayesian Online Change-Point Detection to the THINGS-EEG dataset and found evidence of regime shifts in two complementary settings. Across repetitions, log alpha bandpower was nonstationary for a substantial subset of image conditions, especially after aggregation across posterior channels. Within epochs, windowed log variance, but not windowed mean amplitude, revealed consistent changepoint structure in the 295 ms to 645 ms post-stimulus window across most participants. Synthetic validation showed that the detector is well calibrated, with a low false positive rate and strong sensitivity to mean shifts.
          </p>
          <p className="text-zinc-400 leading-relaxed text-lg">
            Taken together, these results show that BOCPD is a useful and interpretable tool for studying nonstationarity in large EEG datasets, and that feature choice is as important as the detection method itself. In this setting, variance-based features provided the clearest access to regime structure in neural dynamics. The full codebase and analysis pipeline are available in our repo.
          </p>
          <div className="flex justify-center pt-8">
            <a href="https://github.com/SatrunsDream/Bayesian-Detection-for-EEG" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors">
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </div>
      </StorySection>

      {/* Footer */}
      <footer className="py-24 border-t border-zinc-900 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Brain className="w-8 h-8 text-zinc-800 mx-auto mb-8" />
          <h2 className="text-2xl font-bold text-white mb-4">Bayesian Neural Shifts</h2>
          <p className="text-zinc-600 text-sm mb-6">
            Bayesian Online Change-Point Detection for EEG. When does the statistical behavior of EEG change?
          </p>
          <div className="flex justify-center gap-6 mb-8 text-sm">
            <a href="https://bayesian-detection-for-eeg.vercel.app" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors">
              Website
            </a>
            <a href="https://github.com/SatrunsDream/Bayesian-Detection-for-EEG" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition-colors">
              <Github className="w-4 h-4" />
              Code
            </a>
          </div>
          <div className="flex justify-center gap-8 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
            <span>THINGS-EEG Dataset</span>
            <span>BOCPD Framework</span>
            <span>2026 Research</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
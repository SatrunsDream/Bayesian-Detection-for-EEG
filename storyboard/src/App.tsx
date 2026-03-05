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
  Waves
} from 'lucide-react';
import { StorySection } from './components/StorySection';
import { EEGPlaceholder } from './components/EEGPlaceholder';
import { BOCPDLogic } from './components/BOCPDLogic';
import { DataTable } from './components/DataTable';
import { InteractiveChart } from './components/InteractiveChart';
import { RawEEGViewer } from './components/RawEEGViewer';
import { RunLengthVis } from './components/RunLengthVis';
import { cn } from './lib/utils';
import * as data from './data/researchData';

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation Rail */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 z-40">
        {['hero', 'abstract', 'intro', 'dataset', 'methods', 'results', 'discussion'].map((id) => (
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
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-light leading-relaxed">
            Bayesian Online Change-Point Detection for EEG Regime-Shift Analysis: 
            A Study on the THINGS-EEG Dataset
          </p>
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
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">The Nonstationary Mind.</h2>
        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-xl leading-relaxed text-zinc-400 first-letter:text-6xl first-letter:font-bold first-letter:text-emerald-500 first-letter:mr-3 first-letter:float-left">
            Electroencephalography (EEG) signals are inherently nonstationary: their statistical properties shift across time within an epoch, 
            across repeated presentations of the same stimulus, and across individuals. Detecting <span className="text-white font-medium italic">when</span> 
            these regime shifts occur is fundamental to understanding neural processing dynamics, designing adaptive brain-computer interfaces (BCIs), and flagging artifacts.
          </p>
          <p className="text-lg leading-relaxed text-zinc-400 mt-6">
            In this work we apply <strong>Bayesian Online Change-Point Detection (BOCPD)</strong> to the THINGS-EEG dataset — a large-scale visual object recognition EEG corpus (10 participants, 16,740 unique image conditions, 17 posterior channels, 100 Hz).
            We extract interpretable scalar features (log bandpower, windowed mean amplitude, windowed log variance), feed them into a conjugate-Gaussian BOCPD model, and evaluate the resulting changepoint posteriors against the known temporal structure of visual evoked potentials.
          </p>
          <p className="text-base leading-relaxed text-zinc-500 mt-4">
            <strong className="text-zinc-400">Key findings:</strong> (a) BOCPD detects regime shifts in log bandpower across repetitions for ~17% of conditions (max CP prob = 0.455); (b) within-epoch windowed variance—but not mean—elicits changepoint probabilities above the prior for 8/10 participants (peak latency 295–645 ms); (c) synthetic validation confirms 91% detection at effect size 2.0 with 1% false-positive rate.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
              <h4 className="text-emerald-500 font-mono text-xs uppercase mb-4 tracking-widest">Domain 1</h4>
              <p className="text-sm text-zinc-400">Across repetitions of the same visual stimulus (80 test-set presentations).</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
              <h4 className="text-emerald-500 font-mono text-xs uppercase mb-4 tracking-widest">Domain 2</h4>
              <p className="text-sm text-zinc-400">Within single 1-second epochs (stimulus onset to 800 ms post-stimulus).</p>
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
        <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">The Nonstationarity Problem</h2>
        <p className="text-zinc-400 leading-relaxed mb-6">
          EEG recordings are nonstationary at multiple timescales. Within a single trial, the neural response 
          evolves from a pre-stimulus baseline through early sensory processing (P1/N1 components at ~100–170 ms) into later cognitive stages (P300, N400, etc.).
          Across repeated presentations of the same stimulus, habituation, adaptation, attentional fluctuations, and electrode drift can all produce slow changes in the response distribution.
        </p>
        <p className="text-zinc-400 leading-relaxed mb-8">
          These nonstationarities are not merely nuisances. They carry information about the underlying neural computation: a shift in the variance regime within an epoch may mark the boundary between feedforward sensory processing and recurrent top-down modulation.
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
            Variance increases monotonically from baseline through the post-stimulus period: baseline ≈ 0.05, early 0–200 ms ≈ 0.08, late 200–800 ms ≈ 0.12. This structure is consistent with stimulus-evoked activity superimposed on ongoing fluctuations and motivates the use of windowed log variance for within-epoch BOCPD.
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <h2 className="text-4xl font-bold text-white tracking-tight">THINGS-EEG</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              A large-scale visual object recognition EEG corpus (Gifford et al., 2022) from a rapid serial visual presentation (RSVP) paradigm. 10 participants, 16,740 unique image conditions, 17 posterior channels, 100 Hz. Each image 100 ms presentation, SOA 200 ms. Epochs: -200 to +800 ms relative to image onset. Preprocessing: baseline correction, MVNN whitening. Train: 16,540 conditions × 4 reps; test: 200 conditions × 80 reps.
            </p>
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
            <DataTable 
              title="Quality Control Summary" 
              data={data.QC_SUMMARY} 
              headers={['participant', 'pct_outliers', 'acf_lag1_mean', 'snr_mean', 'flag_high_outliers']} 
              description="Participant-wise quality metrics and outlier flags."
            />
          </div>
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
              <p>Mean amplitude across 8 bins of 10 test repetitions shows flat or mildly fluctuating trajectories — no strong systematic drift.</p>
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

      {/* Methods */}
      <StorySection id="methods">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">04 / Methods</span>
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
              We use a <strong>Gaussian observation model</strong> with known variance and unknown mean, coupled with a Gaussian prior on the mean.
              Conjugacy ensures that after observing data within a segment, the posterior on the mean remains Gaussian, allowing for efficient exact inference.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/30 rounded-3xl p-8 border border-zinc-800">
          <h3 className="text-2xl font-bold text-white mb-8">BOCPD Recursion</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-black/40 font-mono text-xs text-emerald-400 border border-emerald-500/20">
                p(r_t | x_1:t) = p(r_t, x_1:t) / Σ p(r_t, x_1:t)
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
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">05 / Results</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">Evidence of Shift.</h2>

        <div className="space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Across-Repetition Analysis</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                <span className="text-emerald-400 font-medium">Single channel (P1):</span> BOCPD on 60 sequences (3 participants × 20 conditions, alpha band, 80 reps each). Max CP prob ranged 0.044–0.455. 10/60 conditions (17%) show max CP &gt; 0.15.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                We then aggregated log bandpower over all 17 channels (mean per rep) and re-ran BOCPD — channel aggregation substantially improves detection.
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
                title="Single Channel (P1) — Top Conditions"
                data={data.ACROSS_REPS_SUMMARY.slice(0, 8).map(d => ({ ...d, name: `${d.participant} ${d.condition}` }))}
                xKey="name"
                yKey="max_cp_prob"
                referenceLine={0.05}
                color="#f59e0b"
              />
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <h4 className="text-white font-bold mb-2">Interpretation</h4>
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                  Alpha bandpower is not uniformly stationary across repetitions. sub-10 cond 182 = 0.455 (strongest single-channel). Aggregating over channels exposes more regime shifts.
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
                sub-05 cond 158: 0.093 (single) → 0.610 (aggregate) — a sixfold increase. sub-10 cond 182 was already strong with P1 alone (0.455); aggregate 0.389. Use channel-aggregated features when a single optimal channel is unknown.
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
                <strong className="text-emerald-400">Windowed mean (negative result):</strong> BOCPD on grand-average windowed mean produced no detection—max CP prob equals hazard for all 10 participants. Averaging smooths away condition-specific ERP structure.
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
                    Mean shift: detection rate scales with effect size, reaching 91% at δ = 2.0; mean latency near zero. Variance shifts: 24–33% rate; mean max CP prob 0.37→0.77; delayed detection (+22 to +27 steps).
                  </p>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Stationary: mean max CP prob = 0.142, FPR 1%. Real EEG (0.04–0.11) &lt; synthetic (0.37–0.77) indicates gradual within-epoch transition.
                  </p>
                  <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed space-y-2">
                    <p>Mean: 91% at δ=2.0; FPR 1%</p>
                    <p>Variance: 24–33%; max CP 0.77</p>
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
      <StorySection id="discussion">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500">06 / Discussion</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-8">Why Variance Succeeds.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-zinc-400 leading-relaxed">
              <strong className="text-white">Windowed mean</strong> after grand-averaging is nearly flat because averaging across 16,540 conditions with diverse ERP waveforms cancels out condition-specific temporal structure. The result is a smooth, near-zero trace that BOCPD (correctly) identifies as stationary.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              <strong className="text-white">Windowed variance</strong> is a second-order statistic reflecting the dispersion of single-trial activity at each timepoint. Even after averaging, the monotonic baseline-to-late increase in variance is preserved—post-stimulus activity is more variable than baseline. This gradual regime shift is detectable by BOCPD (max CP prob up to 0.108) because the shift is genuine, albeit smooth.
            </p>
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <h4 className="text-white font-bold mb-2">Key Insight</h4>
              <p className="text-sm text-zinc-400 italic">
                The choice of feature matters as much as the choice of detection algorithm. Windowed variance captures systematic second-order changes that windowed mean, after grand-averaging, cannot.
              </p>
            </div>
          </div>
          <div className="space-y-8">
            <h4 className="text-sm font-mono uppercase tracking-widest text-zinc-500">Limitations</h4>
            <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
              <p>Our Gaussian model assumes known variance—optimal for mean shifts but suboptimal for variance shifts. A Normal-Inverse-Gamma model would jointly infer mean and variance. Grand-averaging collapses condition-specific structure; single-trial analysis would yield richer dynamics. Single channel/band; multi-channel aggregation could improve sensitivity.</p>
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

      {/* Footer */}
      <footer className="py-24 border-t border-zinc-900 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Brain className="w-8 h-8 text-zinc-800 mx-auto mb-8" />
          <h2 className="text-2xl font-bold text-white mb-4">Neural Shifts</h2>
          <p className="text-zinc-600 text-sm mb-12">
            A research project on Bayesian Online Change-Point Detection for EEG.
          </p>
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
import React from 'react';

export const FeatureTensorSchematic: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Log Bandpower */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 mb-3">Log Bandpower</div>
        <div className="font-mono text-xs text-zinc-400 space-y-1">
          <div>Train: <span className="text-white">(16540, 4, 17, 5)</span></div>
          <div>Test: <span className="text-white">(200, 80, 17, 5)</span></div>
        </div>
        <p className="text-[10px] text-zinc-500 mt-2">Last axis = 5 bands (δ, θ, α, β, γ)</p>
      </div>
      {/* Windowed Mean */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 mb-3">Windowed Mean</div>
        <div className="font-mono text-xs text-zinc-400">
          <div>~19 windows × participants</div>
          <div className="mt-1">W=10, stride=5 (100 ms, 50 ms)</div>
        </div>
        <p className="text-[10px] text-zinc-500 mt-2">Sequence over time within epoch</p>
      </div>
      {/* Windowed Log Variance */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 mb-3">Windowed Log Variance</div>
        <div className="font-mono text-xs text-zinc-400">
          <div>~19 windows × participants</div>
          <div className="mt-1">ℓ = log(variance + ε)</div>
        </div>
        <p className="text-[10px] text-zinc-500 mt-2">Temporal variability within epoch</p>
      </div>
    </div>
  );
};

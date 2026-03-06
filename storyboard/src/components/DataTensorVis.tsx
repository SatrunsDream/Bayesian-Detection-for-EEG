import React from 'react';

export const DataTensorVis: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
      <h4 className="text-white font-bold mb-4 text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Data structure: 4D tensor
      </h4>
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {/* 4D tensor schematic: outer = conditions, grid = reps, each cell = ch×time */}
            <div className="border-2 border-emerald-500/50 rounded-lg p-3 bg-black/30">
              <div className="text-[10px] font-mono text-emerald-500/80 mb-2 text-center">conditions → reps (each cell: 17×100)</div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((r) => (
                  <div key={r} className="border border-zinc-600 rounded p-2 bg-zinc-900/80">
                    <div className="text-[8px] text-zinc-500 text-center">rep {r}</div>
                    <div className="w-12 h-8 border border-zinc-700 rounded flex items-center justify-center mt-1">
                      <span className="text-[9px] font-mono text-emerald-400">17×100</span>
                    </div>
                    <div className="text-[8px] text-zinc-500 text-center mt-0.5">ch × time</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono text-center max-w-[200px]">
            Each cell = 17 channels × 100 timepoints
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-700 font-mono text-xs">
            <div className="text-zinc-500 mb-1">X[c, r, j, t] =</div>
            <div className="text-emerald-400">condition c, repetition r,</div>
            <div className="text-emerald-400">channel j, timepoint t</div>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div><span className="text-zinc-500">Train:</span> <span className="text-white">(16540, 4, 17, 100)</span></div>
            <div><span className="text-zinc-500">Test:</span> <span className="text-white">(200, 80, 17, 100)</span></div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-2 text-[9px] text-zinc-500">
        <div>Axis 1: <span className="text-emerald-400">image</span></div>
        <div>Axis 2: <span className="text-emerald-400">repetitions</span></div>
        <div>Axis 3: <span className="text-emerald-400">channels</span></div>
        <div>Axis 4: <span className="text-emerald-400">time (ms)</span></div>
      </div>
    </div>
  );
};

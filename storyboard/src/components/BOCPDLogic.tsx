import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export const BOCPDLogic: React.FC = () => {
  const [step, setStep] = useState(0);
  const totalSteps = 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % totalSteps);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const isChangepoint = step === 40 || step === 80;

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-bold">Real-time Inference</h3>
        <div className="flex gap-2">
          <div className={cn("w-2 h-2 rounded-full", isChangepoint ? "bg-red-500 animate-ping" : "bg-emerald-500")} />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {isChangepoint ? 'Changepoint Detected' : 'Stable Regime'}
          </span>
        </div>
      </div>

      <div className="relative h-32 flex items-end gap-1">
        {Array.from({ length: 50 }).map((_, i) => {
          const index = (step - 50 + i + totalSteps) % totalSteps;
          const cp = index === 40 || index === 80;
          return (
            <motion.div
              key={i}
              className={cn(
                "flex-1 rounded-t-sm transition-colors duration-300",
                cp ? "bg-red-500 h-full" : "bg-emerald-500/40 h-1/2"
              )}
              animate={{
                height: cp ? '100%' : `${30 + Math.random() * 40}%`,
                opacity: cp ? 1 : 0.3 + (i / 50) * 0.7
              }}
            />
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
          <div className="text-[10px] text-zinc-500 uppercase mb-1">Run Length</div>
          <div className="text-xl font-mono text-white">{(step % 40).toString().padStart(2, '0')}</div>
        </div>
        <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
          <div className="text-[10px] text-zinc-500 uppercase mb-1">Hazard Rate</div>
          <div className="text-xl font-mono text-white">0.05</div>
        </div>
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';

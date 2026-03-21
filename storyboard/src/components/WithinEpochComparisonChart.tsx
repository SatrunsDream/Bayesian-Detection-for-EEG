import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';

const HAZARD = 0.02;

interface ParticipantData {
  participant: string;
  peak_cp_ms?: number;
  max_cp_prob: number;
}

interface WithinEpochComparisonChartProps {
  meanData: ParticipantData[];
  varianceData: ParticipantData[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl backdrop-blur-sm">
        <p className="text-zinc-400 text-xs mb-2 font-mono uppercase">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value.toFixed(3)}</span>
            {p.dataKey === 'variance_max' && p.value > HAZARD && (
              <span className="text-emerald-500 ml-1">(above hazard)</span>
            )}
          </p>
        ))}
        <p className="text-zinc-500 text-[10px] mt-1">Hazard h = {HAZARD}</p>
      </div>
    );
  }
  return null;
};

export function WithinEpochComparisonChart({
  meanData,
  varianceData,
  height = 340
}: WithinEpochComparisonChartProps) {
  const merged = meanData.map((m) => {
    const v = varianceData.find((x) => x.participant === m.participant);
    return {
      participant: m.participant.replace('sub-', ''),
      mean_max: m.max_cp_prob,
      variance_max: v?.max_cp_prob ?? 0
    };
  });

  const aboveHazard = merged.filter((d) => d.variance_max > HAZARD).length;

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm my-8">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-zinc-100 font-bold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Max Changepoint Probability: Mean vs Variance (h = 0.02)
        </h4>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          {aboveHazard}/10 above hazard
        </span>
      </div>
      <div className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={merged}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="participant"
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, Math.max(0.15, Math.ceil(Math.max(...merged.map((d) => d.variance_max)) * 20) / 20)]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
            <ReferenceLine
              y={HAZARD}
              stroke="#78716c"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Bar
              dataKey="mean_max"
              name="Windowed mean"
              fill="#52525b"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="variance_max"
              name="Windowed variance"
              fill="#10b981"
              radius={[2, 2, 0, 0]}
            />
            <Legend
              wrapperStyle={{ fontSize: 10 }}
              iconType="square"
              iconSize={8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-zinc-500 mt-2">
        Dashed line: prior hazard (h = 0.02). Variance exceeds hazard for {aboveHazard} of 10 participants; mean stays at prior.
      </p>
    </div>
  );
}

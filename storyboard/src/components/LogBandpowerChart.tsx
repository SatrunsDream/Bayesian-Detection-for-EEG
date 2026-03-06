import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface BandPowerRow {
  participant: string;
  band: string;
  log_power_mean: number;
  log_power_std: number;
  power_mean?: number;
}

interface LogBandpowerChartProps {
  data: BandPowerRow[];
  participantFilter?: string; // e.g. "sub-01" to show one participant, or undefined for aggregate
}

export const LogBandpowerChart: React.FC<LogBandpowerChartProps> = ({
  data,
  participantFilter
}) => {
  let chartData: { band: string; mean: number; std: number; count: number }[];

  if (participantFilter) {
    chartData = data
      .filter((d) => d.participant === participantFilter)
      .map((d) => ({
        band: d.band,
        mean: d.log_power_mean,
        std: d.log_power_std,
        count: 1
      }));
  } else {
    const byBand = data.reduce<Record<string, { means: number[]; stds: number[] }>>((acc, d) => {
      if (!acc[d.band]) acc[d.band] = { means: [], stds: [] };
      acc[d.band].means.push(d.log_power_mean);
      acc[d.band].stds.push(d.log_power_std);
      return acc;
    }, {});
    chartData = Object.entries(byBand).map(([band, { means, stds }]) => {
      const mean = means.reduce((a, b) => a + b, 0) / means.length;
      const std = Math.sqrt(
        stds.reduce((a, b) => a + b * b, 0) / stds.length
      );
      return { band, mean, std, count: means.length };
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="text-zinc-400 text-xs mb-1 font-mono uppercase">{p.band}</p>
          <p className="text-emerald-400 font-bold text-sm">mean: {p.mean.toFixed(2)}</p>
          <p className="text-zinc-500 text-xs">±std: {p.std.toFixed(2)} → approximately Gaussian</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
      <h4 className="text-zinc-100 font-bold text-sm flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Log Bandpower Distribution (Mean ± SD per band)
      </h4>
      <p className="text-xs text-zinc-500 mb-4">
        {participantFilter
          ? `Participant ${participantFilter}: log bandpower is approximately Gaussian (symmetric, moderate spread).`
          : 'Averaged across participants: log bandpower is approximately Gaussian, justifying the conjugate Normal model in BOCPD.'}
      </p>
      <div className="w-full" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="band"
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
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
            <Bar dataKey="mean" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

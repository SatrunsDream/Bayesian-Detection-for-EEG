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

const THRESHOLD = 0.15;

interface ConditionData {
  participant: string;
  condition: number;
  max_cp_prob: number;
}

interface AcrossRepsComparisonChartProps {
  singleData: ConditionData[];
  aggregateData: ConditionData[];
  height?: number;
}

function mergeByParticipantCondition(
  single: ConditionData[],
  aggregate: ConditionData[]
) {
  const map = new Map<string, ConditionData>();
  single.forEach((d) => map.set(`${d.participant}-${d.condition}`, d));
  return aggregate.map((a) => {
    const s = map.get(`${a.participant}-${a.condition}`);
    return {
      label: `${a.participant.replace('sub-', '')} c${a.condition}`,
      single: s?.max_cp_prob ?? 0,
      aggregate: a.max_cp_prob,
      improvement: (a.max_cp_prob - (s?.max_cp_prob ?? 0)).toFixed(3),
      improved: (a.max_cp_prob - (s?.max_cp_prob ?? 0)) > 0
    };
  });
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl backdrop-blur-sm">
        <p className="text-zinc-400 text-xs mb-2 font-mono uppercase">{d.label}</p>
        <p className="text-amber-400/90 text-xs">Single: {d.single.toFixed(3)}</p>
        <p className="text-emerald-400 text-xs font-medium">Aggregate: {d.aggregate.toFixed(3)}</p>
        <p className="text-emerald-500 text-[10px] mt-1">
          {d.improved ? `+${d.improvement}` : d.improvement} vs single channel
        </p>
      </div>
    );
  }
  return null;
};

export function AcrossRepsComparisonChart({
  singleData,
  aggregateData,
  height = 320
}: AcrossRepsComparisonChartProps) {
  const merged = mergeByParticipantCondition(singleData, aggregateData);
  const topByAggregate = [...merged].sort((a, b) => b.aggregate - a.aggregate).slice(0, 8);

  const singleAbove = singleData.filter((d) => d.max_cp_prob > THRESHOLD).length;
  const aggAbove = aggregateData.filter((d) => d.max_cp_prob > THRESHOLD).length;

  return (
    <div className="space-y-8">
      {/* Takeaway: counts above threshold */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
            Single channel (P1)
          </p>
          <p className="text-2xl font-bold text-amber-400/90">{singleAbove}</p>
          <p className="text-xs text-zinc-500">conditions with max CP &gt; 0.15</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/80 mb-1">
            Channel-aggregated
          </p>
          <p className="text-2xl font-bold text-emerald-500">{aggAbove}</p>
          <p className="text-xs text-zinc-500">conditions with max CP &gt; 0.15</p>
        </div>
      </div>

      {/* Grouped bar: top 8 conditions, single vs aggregate */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-zinc-100 font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Same conditions: Single channel vs channel-aggregated (top 8 by aggregate)
          </h4>
        </div>
        <div className="w-full" style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topByAggregate}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="label"
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
                domain={[0, 0.7]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
              <ReferenceLine
                y={THRESHOLD}
                stroke="#78716c"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <Bar
                dataKey="single"
                name="Single (P1)"
                fill="#f59e0b"
                fillOpacity={0.85}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="aggregate"
                name="Aggregated (17 ch)"
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
          Dashed line: strong evidence threshold (0.15). Aggregating over 17 channels consistently increases changepoint probability for the same image conditions.
        </p>
      </div>
    </div>
  );
}

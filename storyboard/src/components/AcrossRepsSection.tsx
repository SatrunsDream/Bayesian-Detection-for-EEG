import React, { useMemo, useState } from 'react';
import { AcrossRepsComparisonChart } from './AcrossRepsComparisonChart';
import { DataTable } from './DataTable';
import { cn } from '../lib/utils';

const PARTICIPANTS = ['all', 'sub-01', 'sub-05', 'sub-10'] as const;

interface ConditionData {
  participant: string;
  condition: number;
  max_cp_prob: number;
}

interface AcrossRepsSectionProps {
  data: {
    ACROSS_REPS_SUMMARY: ConditionData[];
    ACROSS_REPS_AGGREGATE_SUMMARY: ConditionData[];
  };
}

export function AcrossRepsSection({ data }: AcrossRepsSectionProps) {
  const [participant, setParticipant] = useState<(typeof PARTICIPANTS)[number]>('all');

  const singleData = useMemo(() => {
    if (participant === 'all') return data.ACROSS_REPS_SUMMARY;
    return data.ACROSS_REPS_SUMMARY.filter((d) => d.participant === participant);
  }, [data.ACROSS_REPS_SUMMARY, participant]);

  const aggregateData = useMemo(() => {
    if (participant === 'all') return data.ACROSS_REPS_AGGREGATE_SUMMARY || [];
    return (data.ACROSS_REPS_AGGREGATE_SUMMARY || []).filter((d) => d.participant === participant);
  }, [data.ACROSS_REPS_AGGREGATE_SUMMARY, participant]);

  const stats = useMemo(() => {
    const THRESHOLD = 0.15;
    const singleAbove = singleData.filter((d) => d.max_cp_prob > THRESHOLD).length;
    const aggAbove = aggregateData.filter((d) => d.max_cp_prob > THRESHOLD).length;
    const meanSingle = singleData.length ? singleData.reduce((s, d) => s + d.max_cp_prob, 0) / singleData.length : 0;
    const meanAgg = aggregateData.length ? aggregateData.reduce((s, d) => s + d.max_cp_prob, 0) / aggregateData.length : 0;
    const pctChange = meanSingle > 0 ? ((meanAgg - meanSingle) / meanSingle) * 100 : 0;
    const maxRow = aggregateData.length ? aggregateData.reduce((best, d) => (d.max_cp_prob > best.max_cp_prob ? d : best), aggregateData[0]) : null;
    const maxSingleRow = maxRow ? singleData.find((d) => d.participant === maxRow.participant && d.condition === maxRow.condition) : null;
    return {
      singleAbove,
      aggAbove,
      meanSingle,
      meanAgg,
      pctChange,
      maxSingle: maxSingleRow?.max_cp_prob ?? 0,
      maxAgg: maxRow?.max_cp_prob ?? 0,
      maxLabel: maxRow ? `${maxRow.participant} cond ${maxRow.condition}` : '—'
    };
  }, [singleData, aggregateData]);

  const tableData = useMemo(() => {
    return [...aggregateData].sort((a, b) => b.max_cp_prob - a.max_cp_prob);
  }, [aggregateData]);

  return (
    <div className="pt-0">
      <h3 className="text-2xl font-bold text-white mb-4">Across-Repetition Analysis</h3>
      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
        We ran BOCPD on 60 sequences (3 participants × 20 conditions, alpha band 8–13 Hz, channel P1, 80 reps each). Alpha bandpower is not uniformly stationary across repetitions. <strong className="text-emerald-400">Aggregating log bandpower over all 17 channels substantially improves detection.</strong>
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Participant:</span>
        {PARTICIPANTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setParticipant(p)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              participant === p
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700 hover:text-emerald-400 hover:border-emerald-500/30'
            )}
          >
            {p === 'all' ? 'All' : p.replace('sub-', '')}
          </button>
        ))}
      </div>

      <AcrossRepsComparisonChart
        singleData={singleData}
        aggregateData={aggregateData}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Mean max CP prob</div>
          <div className="text-2xl font-bold text-white">
            {stats.meanSingle.toFixed(3)} <span className="text-zinc-500 font-normal">→</span>{' '}
            <span className="text-emerald-500">{stats.meanAgg.toFixed(3)}</span>
          </div>
          <div className="text-xs text-emerald-500 mt-1">
            {stats.pctChange > 0 ? '+' : ''}{stats.pctChange.toFixed(0)}%
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Conditions &gt; 0.15</div>
          <div className="text-2xl font-bold text-white">
            {stats.singleAbove} <span className="text-zinc-500 font-normal">→</span>{' '}
            <span className="text-emerald-500">{stats.aggAbove}</span>
          </div>
          <div className="text-xs text-emerald-500 mt-1">
            {stats.aggAbove > stats.singleAbove && stats.singleAbove > 0
              ? `${(stats.aggAbove / stats.singleAbove).toFixed(1)}× more`
              : stats.singleAbove === 0 && stats.aggAbove > 0
                ? 'aggregation detects'
                : stats.aggAbove === stats.singleAbove && stats.singleAbove > 0
                  ? 'same'
                  : '—'}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Max max CP prob</div>
          <div className="text-2xl font-bold text-white">
            {stats.maxSingle.toFixed(3)} <span className="text-zinc-500 font-normal">→</span>{' '}
            <span className="text-emerald-500">{stats.maxAgg.toFixed(3)}</span>
          </div>
          <div className="text-xs text-emerald-500 mt-1">{stats.maxLabel}</div>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
        <h4 className="text-white font-bold mb-2">Takeaway</h4>
        <p className="text-sm text-zinc-400 leading-relaxed">
          For the same image conditions, channel aggregation consistently raises changepoint probability.
          {participant === 'all' && ' Example: sub-05 cond 158 goes from 0.093 (single P1) to 0.610 (17-channel mean), a sixfold increase.'}
          {' '}Use channel-aggregated features when the optimal single channel is unknown.
        </p>
      </div>
      <div className="mt-8">
        <DataTable
          title={participant === 'all' ? 'Channel-Aggregated Summary' : `Channel-Aggregated Summary (${participant})`}
          data={tableData}
          headers={['participant', 'condition', 'max_cp_prob']}
          description="BOCPD on mean log bandpower over 17 channels."
        />
      </div>
    </div>
  );
}

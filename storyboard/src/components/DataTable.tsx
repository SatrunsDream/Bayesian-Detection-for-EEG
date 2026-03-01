import React from 'react';
import { motion } from 'motion/react';
import { Table as TableIcon, Download } from 'lucide-react';

interface DataTableProps {
  title: string;
  data: any[];
  headers: string[];
  description?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ title, data, headers, description }) => {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm my-8">
      <div className="px-6 py-4 border-bottom border-zinc-800 flex items-center justify-between bg-zinc-900/60">
        <div>
          <h4 className="text-white font-bold flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-emerald-500" />
            {title}
          </h4>
          {description && <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{description}</p>}
        </div>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-xs relative">
          <thead className="bg-zinc-950 text-zinc-500 font-mono uppercase tracking-tighter sticky top-0 z-10 shadow-sm">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-3 font-medium border-b border-zinc-800 whitespace-nowrap">
                  {h.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {data.map((row, i) => (
              <motion.tr 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-emerald-500/5 transition-colors"
              >
                {headers.map((h, j) => (
                  <td key={j} className="px-6 py-3 text-zinc-400 font-mono">
                    {typeof row[h] === 'boolean' ? (row[h] ? '✓' : '—') : row[h]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

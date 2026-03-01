import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';

interface ChartProps {
  type: 'bar' | 'line' | 'area';
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
  yDomain?: [number, number];
  referenceLine?: number;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl backdrop-blur-sm">
        <p className="text-zinc-400 text-xs mb-1 font-mono uppercase">{label}</p>
        <p className="text-emerald-400 font-bold text-sm">
          {payload[0].value.toFixed(3)}
        </p>
      </div>
    );
  }
  return null;
};

export const InteractiveChart: React.FC<ChartProps> = ({ 
  type, 
  data, 
  xKey, 
  yKey, 
  color = "#10b981", 
  title,
  yDomain,
  referenceLine,
  height = 300
}) => {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm my-8">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-zinc-100 font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {title}
          </h4>
        </div>
      )}
      
      <div className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey={xKey} 
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
                domain={yDomain || ['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
              <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
              {referenceLine !== undefined && (
                <ReferenceLine y={referenceLine} stroke="#ef4444" strokeDasharray="3 3" />
              )}
            </BarChart>
          ) : type === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${yKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey={xKey} 
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
                domain={yDomain || ['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={yKey} 
                stroke={color} 
                fillOpacity={1} 
                fill={`url(#gradient-${yKey})`} 
              />
              {referenceLine !== undefined && (
                <ReferenceLine y={referenceLine} stroke="#ef4444" strokeDasharray="3 3" />
              )}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey={xKey} 
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
                domain={yDomain || ['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke={color} 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, fill: '#fff' }}
              />
              {referenceLine !== undefined && (
                <ReferenceLine y={referenceLine} stroke="#ef4444" strokeDasharray="3 3" />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

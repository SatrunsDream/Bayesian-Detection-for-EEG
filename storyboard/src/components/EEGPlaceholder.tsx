import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface EEGChartProps {
  type: 'raw' | 'prob' | 'runlength';
  title: string;
  description: string;
}

export const EEGPlaceholder: React.FC<EEGChartProps> = ({ type, title, description }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 200;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([-1, 1]).range([height - margin.bottom, margin.top]);

    // Generate some "brain-like" noise
    const data = d3.range(101).map(i => ({
      x: i,
      y: type === 'raw' 
        ? Math.sin(i / 5) * 0.5 + (Math.random() - 0.5) * 0.3 
        : type === 'prob'
          ? (i > 45 && i < 55 ? Math.random() * 0.8 : Math.random() * 0.1)
          : (i % 30) / 30 // Run length sawtooth
    }));

    const line = d3.line<{ x: number; y: number }>()
      .x(d => x(d.x))
      .y(d => type === 'prob' ? y(d.y * 2 - 1) : y(d.y))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', type === 'prob' ? '#ef4444' : '#10b981')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add a "Placeholder" watermark
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.1)
      .attr('font-size', '40px')
      .attr('font-weight', 'bold')
      .text('DATA RESERVED');

  }, [type]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 my-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-zinc-100 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {title}
        </h4>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Figure Placeholder</span>
      </div>
      <div className="aspect-[3/1] w-full overflow-hidden">
        <svg ref={svgRef} viewBox="0 0 600 200" className="w-full h-full text-zinc-700" />
      </div>
      <p className="mt-4 text-sm text-zinc-400 italic leading-relaxed">
        {description}
      </p>
    </div>
  );
};

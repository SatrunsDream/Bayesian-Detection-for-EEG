import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export const RawEEGViewer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [offset, setOffset] = useState(0);
  const channels = ['Pz', 'P3', 'P7', 'O1', 'Oz', 'O2', 'P4', 'P8'];
  
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      setOffset(prev => prev + 1);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 20, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const channelHeight = chartHeight / channels.length;
    
    // Generate data window based on offset
    const points = 100;
    const data = channels.map((ch, chIdx) => {
      return d3.range(points).map(i => {
        const t = i + offset * 0.1;
        // Simulate EEG: alpha (10Hz) + noise + occasional blink
        const alpha = Math.sin(t * 0.5) * 0.3;
        const noise = (Math.random() - 0.5) * 0.1;
        const blink = Math.random() > 0.99 ? 2 : 0; // Rare blink artifact
        return {
          x: i,
          y: alpha + noise + blink
        };
      });
    });

    const x = d3.scaleLinear().domain([0, points - 1]).range([0, chartWidth]);
    const y = d3.scaleLinear().domain([-2, 2]).range([channelHeight, 0]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    channels.forEach((ch, i) => {
      const channelG = g.append('g').attr('transform', `translate(0, ${i * channelHeight})`);
      
      // Channel label
      channelG.append('text')
        .attr('x', -10)
        .attr('y', channelHeight / 2)
        .attr('text-anchor', 'end')
        .attr('alignment-baseline', 'middle')
        .attr('fill', '#71717a') // zinc-500
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .text(ch);

      // Line
      const line = d3.line<{x: number, y: number}>()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .curve(d3.curveBasis);

      channelG.append('path')
        .datum(data[i])
        .attr('fill', 'none')
        .attr('stroke', '#10b981') // emerald-500
        .attr('stroke-width', 1)
        .attr('opacity', 0.8)
        .attr('d', line);
    });

    // Add a "time" indicator (vertical line)
    g.append('line')
      .attr('x1', chartWidth / 2)
      .attr('y1', 0)
      .attr('x2', chartWidth / 2)
      .attr('y2', chartHeight)
      .attr('stroke', '#ef4444') // red-500
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 4')
      .attr('opacity', 0.5);

  }, [offset]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 my-8 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-zinc-100 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live EEG Stream (Simulated)
        </h4>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">100 Hz</span>
      </div>
      <div className="aspect-[2/1] w-full">
        <svg ref={svgRef} viewBox="0 0 600 300" className="w-full h-full" />
      </div>
    </div>
  );
};

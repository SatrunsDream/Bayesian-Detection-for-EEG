import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export const RunLengthVis: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [step, setStep] = useState(0);
  
  // Simulation parameters
  const T = 100;
  const cp1 = 33;
  const cp2 = 66;
  
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStep(s => (s + 1) % (T + 20)); // Loop with pause
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const panelHeight = (height - margin.top - margin.bottom - 20) / 2;

    // Generate Data
    const data = d3.range(T).map(t => {
      let mean = 0;
      if (t >= cp1 && t < cp2) mean = 2;
      else if (t >= cp2) mean = -1;
      return { t, x: mean + (Math.random() - 0.5) * 0.5 }; // Low noise for clarity
    });

    // Calculate Run Length (Simplified ideal case)
    const runLengths = d3.range(T).map(t => {
      if (t < cp1) return t;
      if (t < cp2) return t - cp1;
      return t - cp2;
    });

    const currentT = Math.min(step, T - 1);
    const visibleData = data.slice(0, currentT + 1);
    const visibleRunLengths = runLengths.slice(0, currentT + 1);

    // Scales
    const xScale = d3.scaleLinear().domain([0, T]).range([margin.left, width - margin.right]);
    const yScaleData = d3.scaleLinear().domain([-2, 3]).range([margin.top + panelHeight, margin.top]);
    const yScaleRL = d3.scaleLinear().domain([0, 40]).range([height - margin.bottom, height - margin.bottom - panelHeight]);

    // Draw Data Panel
    const gData = svg.append('g');
    
    // Axis
    gData.append('g')
      .attr('transform', `translate(0,${margin.top + panelHeight})`)
      .call(d3.axisBottom(xScale).ticks(0).tickSize(0))
      .attr('stroke', '#52525b');

    gData.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScaleData).ticks(3))
      .attr('color', '#52525b');

    // Line
    const lineData = d3.line<{t: number, x: number}>()
      .x(d => xScale(d.t))
      .y(d => yScaleData(d.x));

    gData.append('path')
      .datum(visibleData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('d', lineData);

    // Draw Run Length Panel
    const gRL = svg.append('g');

    // Axis
    gRL.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', '#52525b');

    gRL.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScaleRL).ticks(3))
      .attr('color', '#52525b');

    // RL Area
    const areaRL = d3.area<{t: number, rl: number}>()
      .x(d => xScale(d.t))
      .y0(height - margin.bottom)
      .y1(d => yScaleRL(d.rl));

    const rlData = visibleRunLengths.map((rl, i) => ({ t: i, rl }));

    gRL.append('path')
      .datum(rlData)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.3)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', areaRL);

    // Labels
    svg.append('text')
      .attr('x', margin.left + 10)
      .attr('y', margin.top + 15)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Observed Data (x_t)');

    svg.append('text')
      .attr('x', margin.left + 10)
      .attr('y', height - margin.bottom - panelHeight + 15)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Run Length (r_t)');

    // Changepoint indicators
    [cp1, cp2].forEach(cp => {
      if (currentT >= cp) {
        svg.append('line')
          .attr('x1', xScale(cp))
          .attr('x2', xScale(cp))
          .attr('y1', margin.top)
          .attr('y2', height - margin.bottom)
          .attr('stroke', '#ef4444')
          .attr('stroke-dasharray', '4 2')
          .attr('stroke-width', 1);
      }
    });

  }, [step]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 my-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-zinc-100 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Run-Length Dynamics
        </h4>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      <div className="aspect-[2/1] w-full">
        <svg ref={svgRef} viewBox="0 0 600 300" className="w-full h-full" />
      </div>
      <p className="mt-4 text-sm text-zinc-400 italic leading-relaxed">
        As data arrives, the run length (blue) grows linearly. When a regime shift occurs (red dashed line), 
        the run length resets to zero, indicating a new segment has begun.
      </p>
    </div>
  );
};

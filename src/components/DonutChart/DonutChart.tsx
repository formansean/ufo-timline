'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { UFOEvent, EventCategory } from '@/types/event';
import { CATEGORY_COLORS, CATEGORIES } from '@/constants/categories';

interface DonutChartProps {
  events: UFOEvent[];
  activeCategories: Set<EventCategory>;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  events,
  activeCategories,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || events.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 140;
    const height = 140;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6; // Donut hole size
    
    // Set SVG dimensions
    svg.attr('width', width).attr('height', height);
    
    // Create main group centered
    const g = svg.append('g')
                 .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Process data - count events by category
    const categoryData = CATEGORIES
      .filter(category => activeCategories.has(category))
      .map(category => {
        const count = events.filter(event => 
          event.category === category && activeCategories.has(event.category as EventCategory)
        ).length;
        return {
          category,
          count,
          color: CATEGORY_COLORS[category]?.base || 'var(--ufo-accent-cyan)'
        };
      })
      .filter(d => d.count > 0); // Only show categories with events
    
    if (categoryData.length === 0) return;
    
    // Create pie generator
    const pie = d3.pie<any>()
                  .value(d => d.count)
                  .sort(null);
    
    // Create arc generator
    const arc = d3.arc<any>()
                  .innerRadius(innerRadius)
                  .outerRadius(radius);
    
    // Create arc data
    const arcs = pie(categoryData);
    
    // Create paths
    const paths = g.selectAll('.arc')
                   .data(arcs)
                   .enter()
                   .append('path')
                   .attr('class', 'arc')
                   .attr('d', arc)
                   .style('fill', d => d.data.color)
                   .style('stroke', 'rgba(255, 255, 255, 0.2)')
                   .style('stroke-width', 1)
                   .style('opacity', 0.8);
    
    // Add glow effect to paths
    paths.style('filter', d => `drop-shadow(0 0 4px ${d.data.color})`);
    
    // Add hover effects
    paths
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1)
          .style('filter', `drop-shadow(0 0 8px ${d.data.color})`);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.8)
          .style('filter', `drop-shadow(0 0 4px ${d.data.color})`);
      });
    
  }, [events, activeCategories]);
  
  // Calculate total visible events
  const totalEvents = events.filter(event => 
    activeCategories.has(event.category as EventCategory)
  ).length;
  
  return (
    <div className={`donut-chart-container ${className}`}>
      {/* Total count display */}
      <div className="text-center mb-4">
        <div 
          className="text-6xl font-bold mb-1" 
          style={{ color: 'var(--ufo-accent-cyan)', textShadow: '0 0 10px var(--ufo-accent-cyan)' }}
        >
          {totalEvents}
        </div>
        <div className="text-white text-sm tracking-wider">Total Events</div>
      </div>
      
      {/* Donut chart */}
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          className="donut-chart-svg"
          style={{ 
            filter: 'drop-shadow(0 0 10px rgba(27, 227, 255, 0.3))'
          }}
        />
      </div>
      
      {/* Reset Globe button - positioned like original */}
      <div className="mt-4 flex justify-center">
        <button
          className="px-3 py-1 text-xs border rounded"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderColor: 'var(--ufo-accent-cyan)',
            color: 'var(--ufo-accent-cyan)',
          }}
          onClick={() => {
            // This would trigger globe reset - placeholder for now
            console.log('Reset Globe');
          }}
        >
          Reset Globe
        </button>
      </div>
    </div>
  );
};
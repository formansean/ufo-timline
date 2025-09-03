'use client';

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { UFOEvent, TimelineEvent, EventCategory } from '@/types/event';
import { CATEGORY_COLORS } from '@/constants/categories';
import { processEventData, parseDateString } from '@/utils/eventProcessing';

interface TimelineProps {
  events: UFOEvent[];
  selectedEvent?: UFOEvent | null;
  onEventSelect: (event: UFOEvent) => void;
  activeCategories: Set<EventCategory>;
  activeCraftTypes: Set<string>;
  activeEntityTypes: Set<string>;
  favoriteEvents?: {
    yellow: Set<string>;
    orange: Set<string>;  
    red: Set<string>;
  };
  showingOnlyFavorites?: {
    yellow: boolean;
    orange: boolean;
    red: boolean;
  };
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  selectedEvent,
  onEventSelect,
  activeCategories,
  activeCraftTypes,
  activeEntityTypes,
  favoriteEvents,
  showingOnlyFavorites
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => {
      // Category filter
      if (!activeCategories.has(event.category as EventCategory)) {
        return false;
      }
      
      // Craft type filter  
      if (activeCraftTypes.size > 0 && event.craft_type) {
        const craftTypes = event.craft_type.split(', ');
        if (!craftTypes.some(type => activeCraftTypes.has(type))) {
          return false;
        }
      }
      
      // Entity type filter
      if (activeEntityTypes.size > 0 && event.entity_type) {
        const entityTypes = event.entity_type.split(', ');
        if (!entityTypes.some(type => activeEntityTypes.has(type))) {
          return false;
        }
      }
      
      return true;
    });

    // Apply favorites filter if any color is active
    if (favoriteEvents && showingOnlyFavorites && 
        Object.values(showingOnlyFavorites).some(isActive => isActive)) {
      filtered = filtered.filter(event => {
        const eventId = `${event.category}-${event.date}-${event.time}`;
        return Object.entries(showingOnlyFavorites).some(([color, isActive]) => {
          if (!isActive) return false;
          const colorKey = color as keyof typeof favoriteEvents;
          return favoriteEvents[colorKey]?.has(eventId);
        });
      });
    }

    return filtered;
  }, [events, activeCategories, activeCraftTypes, activeEntityTypes, favoriteEvents, showingOnlyFavorites]);

  // Get category color
  const getCategoryColor = useCallback((category: EventCategory) => {
    const colors = CATEGORY_COLORS[category];
    return colors ? colors.base : 'var(--ufo-accent-cyan)';
  }, []);

  // Initialize horizontal timeline with category rows - matching original layout
  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const container = document.getElementById('timeline-container');
    if (!container) {
      return;
    }
    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll('*').remove();

    // Timeline dimensions - matching original script.js lines 89-93
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const margin = { top: 30, right: 50, bottom: 30, left: 200 }; // Left margin for category labels
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    const eventBoxWidth = 60;
    const eventBoxHeight = 30;

    // Set SVG dimensions
    svg.attr('width', containerWidth)
       .attr('height', containerHeight);

    // Create main group
    const g = svg.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create time scale - horizontal axis from 1940 to 2024
    const timeExtent = [new Date(1940, 0, 1), new Date(2024, 11, 31)];
    const xScale = d3.scaleTime()
                    .domain(timeExtent)
                    .range([0, width]);

    // Create category scale for vertical positioning - matches original category row system
    const categories = Array.from(activeCategories);
    const yScale = d3.scaleBand()
                    .domain(categories)
                    .range([0, height])
                    .paddingInner(0.1);

    // Create X axis with decade markers
    const xAxis = d3.axisBottom(xScale)
                    .ticks(d3.timeYear.every(4)) // Every 4 years
                    .tickFormat(d3.timeFormat('%Y'))
                    .tickSize(-height); // Grid lines

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', 'var(--ufo-accent-cyan)')
      .style('font-size', '12px');

    // Style grid lines
    g.selectAll('.x-axis .tick line')
      .style('stroke', 'var(--ufo-accent-cyan)')
      .style('stroke-opacity', 0.3)
      .style('stroke-width', 1);

    // Remove domain line
    g.select('.x-axis .domain').remove();

    // Add category labels on the left - matching original category row labels
    g.selectAll('.category-label')
      .data(categories)
      .enter()
      .append('text')
      .attr('class', 'category-label')
      .attr('x', -10)
      .attr('y', d => (yScale(d) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('text-anchor', 'end')
      .style('fill', d => getCategoryColor(d as EventCategory))
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => d);

    // Add category row background lines
    g.selectAll('.category-row')
      .data(categories)
      .enter()
      .append('line')
      .attr('class', 'category-row')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => (yScale(d) || 0) + yScale.bandwidth() / 2)
      .attr('y2', d => (yScale(d) || 0) + yScale.bandwidth() / 2)
      .style('stroke', d => getCategoryColor(d as EventCategory))
      .style('stroke-opacity', 0.2)
      .style('stroke-width', 1);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
                  .scaleExtent([0.5, 75])  // Matches original scale extent
                  .extent([[0, 0], [width, height]])
                  .on('zoom', (event) => {
                    const { transform } = event;
                    updateTimeline(transform.rescaleX(xScale));
                  });

    svg.call(zoom);

    // Update timeline function
    const updateTimeline = (currentXScale: d3.ScaleTime<number, number>) => {
      // Remove existing event elements
      g.selectAll('.event-line, .event-rect, .event-label, .event-connection').remove();

      if (filteredEvents.length === 0) return;

      // Group events by category for better positioning
      const eventsByCategory = d3.group(filteredEvents, d => d.category);

      // Draw events for each category - matching original event rendering (script.js lines 996+)
      eventsByCategory.forEach((categoryEvents, category) => {
        const categoryY = yScale(category) || 0;
        const categoryHeight = yScale.bandwidth();
        
        // Sort events within category by date
        const sortedEvents = categoryEvents.sort((a, b) => {
          const dateA = parseDateString(a.date);
          const dateB = parseDateString(b.date);
          return dateA.getTime() - dateB.getTime();
        });

        sortedEvents.forEach((event, index) => {
          const eventDate = parseDateString(event.date);
          const x = currentXScale(eventDate);
          
          // Skip if outside visible area
          if (x < -50 || x > width + 50) return;

          const color = getCategoryColor(event.category as EventCategory);
          
          // Position within category row with slight vertical offset for overlapping events
          const baseY = categoryY + categoryHeight / 2;
          const yOffset = (index % 3 - 1) * 8; // Stagger overlapping events slightly
          const eventY = baseY + yOffset;

          // Draw vertical connection line from event to timeline axis - matches original (script.js lines 1017-1032)
          g.append('line')
            .attr('class', 'event-connection')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', eventY)
            .attr('y2', height - 30)
            .style('stroke', color)
            .style('stroke-width', 1)
            .style('opacity', 0.6)
            .style('pointer-events', 'none');

          // Draw event rectangle - matching original eventBoxWidth/Height (script.js lines 89-93)
          const rect = g.append('rect')
            .attr('class', 'event-rect')
            .attr('x', x - eventBoxWidth / 2)
            .attr('y', eventY - eventBoxHeight / 2)
            .attr('width', eventBoxWidth)
            .attr('height', eventBoxHeight)
            .style('fill', color)
            .style('stroke', 'white')
            .style('stroke-width', 1)
            .style('cursor', 'pointer')
            .style('opacity', 0.8)
            .style('rx', 3); // Rounded corners

          // Add glow effect for selected event
          if (selectedEvent && selectedEvent.id === event.id) {
            rect
              .style('filter', 'drop-shadow(0 0 8px ' + color + ')')
              .style('opacity', 1);
          }

          // Add click handler
          rect.on('click', function(clickEvent, d) {
            clickEvent.stopPropagation();
            onEventSelect(event);
          });

          // Add hover effects
          rect
            .on('mouseover', function() {
              d3.select(this)
                .transition()
                .duration(200)
                .style('opacity', 1)
                .style('transform', 'scale(1.1)');
            })
            .on('mouseout', function() {
              if (!selectedEvent || selectedEvent.id !== event.id) {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .style('opacity', 0.8)
                  .style('transform', 'scale(1)');
              }
            });

          // Add event label inside rectangle when zoomed in
          const timeRange = currentXScale.domain()[1].getTime() - currentXScale.domain()[0].getTime();
          const isZoomedIn = timeRange < 20 * 365 * 24 * 60 * 60 * 1000; // Show when zoomed to < 20 years
          
          if (isZoomedIn) {
            g.append('text')
              .attr('class', 'event-label')
              .attr('x', x)
              .attr('y', eventY + 2)
              .style('text-anchor', 'middle')
              .style('fill', 'white')
              .style('font-size', '9px')
              .style('font-weight', 'bold')
              .style('pointer-events', 'none')
              .text(event.title.length > 8 ? event.title.substring(0, 8) + '...' : event.title);
          }
        });
      });

      // Update axis
      g.select('.x-axis').call(d3.axisBottom(currentXScale)
        .ticks(d3.timeYear.every(Math.max(1, Math.round(20 / d3.zoomTransform(svg.node()).k))))
        .tickFormat(d3.timeFormat('%Y'))
        .tickSize(-height));

      // Re-style axis after update
      g.selectAll('.x-axis text')
        .style('fill', 'var(--ufo-accent-cyan)')
        .style('font-size', '12px');

      g.selectAll('.x-axis .tick line')
        .style('stroke', 'var(--ufo-accent-cyan)')
        .style('stroke-opacity', 0.3)
        .style('stroke-width', 1);

      g.select('.x-axis .domain').remove();
    };

    // Initial render
    updateTimeline(xScale);

    // Set initial zoom to show 1940-1980 period
    const initialStart = new Date(1940, 0, 1);
    const initialEnd = new Date(1980, 11, 31);
    const [x0, x1] = xScale.domain();
    const [X0, X1] = xScale.range();
    const k = (X1 - X0) / (xScale(initialEnd) - xScale(initialStart));
    const tx = -xScale(initialStart);

    svg.transition()
       .duration(1000)
       .call(zoom.transform, d3.zoomIdentity.scale(k).translate(tx, 0));

  }, [filteredEvents, selectedEvent, getCategoryColor, onEventSelect]);

  return (
    <svg
      ref={svgRef}
      className="timeline-svg w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
};
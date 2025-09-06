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

    // Add draggable background rect for timeline panning - matches original background behavior
    g.append('rect')
      .attr('class', 'timeline-background')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'transparent')
      .style('cursor', 'grab')
      .on('mousedown', function() {
        d3.select(this).style('cursor', 'grabbing');
      })
      .on('mouseup', function() {
        d3.select(this).style('cursor', 'grab');
      });

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

    // Dynamic X axis function - matches screenshot zoom behavior exactly
    const createXAxis = (currentXScale: d3.ScaleTime<number, number>, interval: number) => {
      let tickInterval;
      let tickFormat;
      
      if (interval === 0.25) {
        // Most zoomed in - show every 3 months with month names like screenshots
        tickInterval = d3.timeMonth.every(3);
        // Custom formatter to show just month names like "October", "April", "July"
        tickFormat = (date: Date) => {
          const month = date.getMonth();
          const year = date.getFullYear();
          // Show year for January (month 0), just month name for others
          if (month === 0) {
            return year.toString();
          } else {
            return d3.timeFormat('%B')(date); // Full month name like "October"
          }
        };
      } else if (interval === 1) {
        // Medium zoom - show every year (like View 2: 1958, 1959, 1960, 1961, 1962)
        tickInterval = d3.timeYear.every(1);
        tickFormat = d3.timeFormat('%Y');
      } else if (interval === 2) {
        // Medium zoom out - show every 2 years (like View 1: 1942, 1944, 1946, 1948...)
        tickInterval = d3.timeYear.every(2);
        tickFormat = d3.timeFormat('%Y');
      } else if (interval === 10) {
        // Max zoom out - show every decade (1930, 1940, 1950, 1960, 1970...)
        tickInterval = d3.timeYear.every(10);
        tickFormat = d3.timeFormat('%Y');
      } else {
        // Fallback for other intervals
        tickInterval = d3.timeYear.every(5);
        tickFormat = d3.timeFormat('%Y');
      }
      
      return d3.axisBottom(currentXScale)
                .ticks(tickInterval)
                .tickFormat(tickFormat as any)
                .tickSize(-height);
    };

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(createXAxis(xScale, 10)) // Start with decades
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

    // zoomToDecade function - matches original script.js lines 167-181
    const zoomToDecade = (decade: number) => {
      const startDate = new Date(decade, 0, 1);
      const endDate = new Date(decade + 10, 0, 1);
      
      const [x0, x1] = xScale.domain();
      const [X0, X1] = xScale.range();
      
      const k = (X1 - X0) / (xScale(endDate) - xScale(startDate));
      const tx = -xScale(startDate);
      
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.scale(k).translate(tx, 0)
      );
    };

    // makeTimeLabelsClickable function - enhanced to work with all zoom levels
    const makeTimeLabelsClickable = (interval: number) => {
      g.selectAll('.x-axis .tick')
        .select('text')
        .style('cursor', 'pointer')
        .on('click', function(event, d: any) {
          event.stopPropagation();
          event.preventDefault();
          if (d && d.getFullYear) {
            // For decade-level years (divisible by 10), zoom to that decade
            if ((interval === 2 || interval === 10) && d.getFullYear() % 10 === 0) {
              zoomToDecade(d.getFullYear());
            }
            // Could add other zoom behaviors for years/months here
          }
        });
        
      // Make decade markers bold when showing decades or 2-year intervals
      if (interval === 2 || interval === 10) {
        g.selectAll('.x-axis .tick')
          .filter(function(d: any) {
            return d && d.getFullYear && d.getFullYear() % 10 === 0;
          })
          .select('text')
          .style('font-weight', 'bold');
      }
    };

    // Create zoom behavior with filter to prevent dragging on events - matches original script.js
    const zoom = d3.zoom<SVGSVGElement, unknown>()
                  .scaleExtent([0.5, 75])  // Matches original scale extent
                  .extent([[0, 0], [width, height]])
                  .filter((event) => {
                    // Prevent zoom on event elements - allow only background dragging
                    return !event.target.closest('.event-circle') && 
                           !event.target.closest('.event-connection') &&
                           !event.target.closest('.event-name-label') &&
                           !event.target.closest('.event-name-bg');
                  })
                  .on('zoom', (event) => {
                    const { transform } = event;
                    const newXScale = transform.rescaleX(xScale);
                    updateTimeline(newXScale, transform);
                  });

    svg.call(zoom)
       .on('dblclick.zoom', null); // Disable double-click zooming - matches original

    // Add wheel zoom support - matches original script.js wheel event handling
    svg.on('wheel', function(event) {
      event.preventDefault();
      const delta = event.deltaY;
      const scaleFactor = delta > 0 ? 0.9 : 1.1;
      
      zoom.scaleBy(d3.select(this).transition().duration(200), scaleFactor);
    });

    // Update timeline function with dynamic axis logic - matches screenshot zoom behavior
    const updateTimeline = (currentXScale: d3.ScaleTime<number, number>, transform?: d3.ZoomTransform) => {
      // Calculate dynamic time interval based on screenshot analysis
      const extent = currentXScale.domain();
      const years = extent[1].getFullYear() - extent[0].getFullYear();
      const pixelsPerYear = width / years;
      
      let interval;
      // Based on screenshot analysis - 4 zoom levels:
      // Max zoom out: Shows decades (1930, 1940, 1950...)
      // Medium zoom out: Shows 2-year intervals (1942, 1944, 1946...)  
      // Medium zoom in: Shows years (1958, 1959, 1960...)
      // Max zoom in: Shows months (October, 1959, April...)
      if (pixelsPerYear > 150) interval = 0.25; // Every 3 months (months view)
      else if (pixelsPerYear > 50) interval = 1; // Every year (medium zoom)
      else if (pixelsPerYear > 25) interval = 2; // Every 2 years (medium zoom out)
      else interval = 10; // Every 10 years (decades - max zoom out)
      // Remove existing event elements (updated for circles) but preserve background
      g.selectAll('.event-line, .event-circle, .event-label, .event-connection, .event-name-label, .event-name-bg').remove();

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

          // Draw event as small circle - matching original design shown in screenshot
          const eventRadius = 4; // Small circle radius
          const circle = g.append('circle')
            .attr('class', 'event-circle')
            .attr('cx', x)
            .attr('cy', eventY)
            .attr('r', eventRadius)
            .style('fill', color)
            .style('stroke', 'white')
            .style('stroke-width', 1)
            .style('cursor', 'pointer')
            .style('opacity', 0.8);

          // Add glow effect for selected event
          if (selectedEvent && selectedEvent.id === event.id) {
            circle
              .style('filter', 'drop-shadow(0 0 8px ' + color + ')')
              .style('opacity', 1)
              .attr('r', eventRadius + 2); // Slightly larger when selected
          }

          // Add click handler with proper event stopping
          circle.on('click', function(clickEvent, d) {
            clickEvent.stopPropagation();
            clickEvent.preventDefault();
            onEventSelect(event);
            
            // Show event name on click - matching original behavior from screenshot
            showEventName(event, x, eventY, color);
          });

          // Add hover effects with improved interaction
          circle
            .on('mouseover', function(mouseEvent) {
              mouseEvent.stopPropagation();
              d3.select(this)
                .transition()
                .duration(200)
                .style('opacity', 1)
                .attr('r', eventRadius + 1) // Slightly larger on hover
                .style('filter', 'drop-shadow(0 0 4px ' + color + ')');
            })
            .on('mouseout', function(mouseEvent) {
              mouseEvent.stopPropagation();
              if (!selectedEvent || selectedEvent.id !== event.id) {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .style('opacity', 0.8)
                  .attr('r', eventRadius)
                  .style('filter', 'none');
              }
            });

          // Note: Event labels are now shown on click instead of automatically when zoomed
        });
      });

      // Update axis with dynamic intervals
      (g.select('.x-axis') as any).call(createXAxis(currentXScale, interval));
      
      // Re-style axis after update
      g.selectAll('.x-axis text')
        .style('fill', 'var(--ufo-accent-cyan)')
        .style('font-size', '12px');

      g.selectAll('.x-axis .tick line')
        .style('stroke', 'var(--ufo-accent-cyan)')
        .style('stroke-opacity', 0.3)
        .style('stroke-width', 1);

      g.select('.x-axis .domain').remove();
      
      // Make time labels clickable after axis update
      makeTimeLabelsClickable(interval);
    };

    // Function to show event name on click - matching original screenshot behavior
    const showEventName = (event: UFOEvent, x: number, y: number, color: string) => {
      // Remove any existing event name labels
      g.selectAll('.event-name-label').remove();
      
      // Add event name label
      const label = g.append('text')
        .attr('class', 'event-name-label')
        .attr('x', x)
        .attr('y', y - 15) // Position above the circle
        .style('text-anchor', 'middle')
        .style('fill', color)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .text(event.title.toUpperCase());
      
      // Add background rectangle for better readability
      const bbox = (label.node() as SVGTextElement).getBBox();
      g.insert('rect', '.event-name-label')
        .attr('class', 'event-name-bg')
        .attr('x', bbox.x - 4)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 8)
        .attr('height', bbox.height + 4)
        .style('fill', 'rgba(0, 0, 0, 0.8)')
        .style('rx', 3)
        .style('pointer-events', 'none')
        .style('opacity', 0);
      
      // Fade in the label
      g.selectAll('.event-name-label, .event-name-bg')
        .transition()
        .duration(200)
        .style('opacity', 1);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        g.selectAll('.event-name-label, .event-name-bg')
          .transition()
          .duration(500)
          .style('opacity', 0)
          .remove();
      }, 3000);
    };

    // Initial render
    updateTimeline(xScale);

    // Make initial time labels clickable
    makeTimeLabelsClickable(10);

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
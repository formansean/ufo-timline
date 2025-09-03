'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { UFOEvent, GlobeEvent, EventCategory } from '@/types/event';
import { GLOBE_CONFIG, CATEGORY_COLORS } from '@/constants/categories';

interface GlobeProps {
  events: UFOEvent[];
  selectedEvent?: UFOEvent | null;
  onEventSelect: (event: UFOEvent) => void;
  activeCategories: Set<EventCategory>;
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
  className?: string;
}

export const Globe: React.FC<GlobeProps> = ({
  events,
  selectedEvent,
  onEventSelect,
  activeCategories,
  favoriteEvents,
  showingOnlyFavorites,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracted, setIsInteracted] = useState(false);
  
  // Globe state
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const pathRef = useRef<d3.GeoPath | null>(null);
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter events to only those with valid coordinates
  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      // Must have valid coordinates
      if (!event.latitude || !event.longitude) return false;
      if (isNaN(+event.latitude) || isNaN(+event.longitude)) return false;
      
      // Category filter
      if (!activeCategories.has(event.category as EventCategory)) return false;
      
      // Favorites filter
      if (favoriteEvents && showingOnlyFavorites && 
          Object.values(showingOnlyFavorites).some(isActive => isActive)) {
        const eventId = `${event.category}-${event.date}-${event.time}`;
        const matchesFavorites = Object.entries(showingOnlyFavorites).some(([color, isActive]) => {
          if (!isActive) return false;
          const colorKey = color as keyof typeof favoriteEvents;
          return favoriteEvents[colorKey]?.has(eventId);
        });
        if (!matchesFavorites) return false;
      }
      
      return true;
    });
  }, [events, activeCategories, favoriteEvents, showingOnlyFavorites]);

  // Get category color
  const getCategoryColor = useCallback((category: EventCategory) => {
    const colors = CATEGORY_COLORS[category];
    return colors ? colors.base : '#999999';
  }, []);

  // Start auto-rotation - matches original startGlobeRotation (script.js lines 424-439)
  const startGlobeRotation = useCallback(() => {
    if (rotationIntervalRef.current) return;
    
    rotationIntervalRef.current = setInterval(() => {
      if (!isInteracted && projectionRef.current && svgRef.current) {
        rotationRef.current[0] += GLOBE_CONFIG.rotationSpeed;
        projectionRef.current.rotate(rotationRef.current);
        
        const svg = d3.select(svgRef.current);
        const g = svg.select('g.globe-group');
        
        // Update paths (if world map is loaded)
        g.selectAll('path.globe-feature').attr('d', pathRef.current!);
        
        // Update event points
        updateEventPoints();
      }
    }, GLOBE_CONFIG.rotationInterval);
  }, [isInteracted]);

  // Stop auto-rotation - matches original stopGlobeRotation (script.js lines 435-440)
  const stopGlobeRotation = useCallback(() => {
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
  }, []);

  // Update event points - matches original updateAllEventPoints logic
  const updateEventPoints = useCallback(() => {
    if (!svgRef.current || !projectionRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const g = svg.select('g.globe-group');
    
    // Remove existing points
    g.selectAll('.event-point').remove();
    
    // Add event points
    const points = g.selectAll('.event-point')
      .data(filteredEvents)
      .enter()
      .append('circle')
      .attr('class', 'event-point')
      .attr('r', 3)
      .style('fill', (d: UFOEvent) => getCategoryColor(d.category as EventCategory))
      .style('stroke', 'white')
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5)
          .style('opacity', 1);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 3)
          .style('opacity', 0.8);
      })
      .on('click', function(event, d) {
        onEventSelect(d);
        // Center globe on selected event
        updateGlobeRotation(+d.latitude!, +d.longitude!);
      });

    // Position points based on projection
    points.each(function(d: UFOEvent) {
      const coordinates: [number, number] = [+d.longitude!, +d.latitude!];
      const projected = projectionRef.current!(coordinates);
      
      if (projected) {
        d3.select(this)
          .attr('cx', projected[0])
          .attr('cy', projected[1])
          .style('display', 'block');
      } else {
        // Point is on the back of the globe
        d3.select(this).style('display', 'none');
      }
    });
  }, [filteredEvents, getCategoryColor, onEventSelect]);

  // Update globe rotation - matches original updateGlobe (script.js lines 1851-1920)
  const updateGlobeRotation = useCallback((lat: number, lon: number) => {
    if (!projectionRef.current || !svgRef.current) return;
    
    const targetRotation: [number, number, number] = [-lon, -lat, 0];
    
    d3.transition()
      .duration(GLOBE_CONFIG.transitionDuration)
      .tween('rotate', () => {
        const interpolate = d3.interpolate(projectionRef.current!.rotate(), targetRotation);
        return (t: number) => {
          const newRotation = interpolate(t);
          rotationRef.current = newRotation;
          projectionRef.current!.rotate(newRotation);
          
          const svg = d3.select(svgRef.current!);
          const g = svg.select('g.globe-group');
          g.selectAll('path.globe-feature').attr('d', pathRef.current!);
          
          updateEventPoints();
        };
      });
  }, [updateEventPoints]);

  // Initialize globe - matches original initGlobe (script.js lines 275-315)
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll('*').remove();
    
    // Calculate size
    const size = Math.min(container.offsetWidth, container.offsetHeight);
    
    // Set SVG dimensions and viewBox
    svg.attr('width', '100%')
       .attr('height', '100%')
       .attr('viewBox', `0 0 ${size} ${size}`)
       .style('background-color', 'transparent');

    // Create projection - matches original orthographic setup
    const projection = d3.geoOrthographic()
                        .scale(size / 2 - 2)
                        .translate([size / 2, size / 2]);
    
    projectionRef.current = projection;
    
    // Create path generator
    const path = d3.geoPath().projection(projection);
    pathRef.current = path;

    // Create main group
    const g = svg.append('g').attr('class', 'globe-group');

    // Add globe background circle
    g.append('circle')
      .attr('cx', size / 2)
      .attr('cy', size / 2)
      .attr('r', size / 2 - 2)
      .style('fill', 'rgba(0, 50, 100, 0.1)')
      .style('stroke', '#333')
      .style('stroke-width', 1);

    // Set up drag behavior - matches original drag system (script.js lines 308-323)
    let lastMousePosition: [number, number] = [0, 0];
    
    const dragBehavior = d3.drag<SVGSVGElement, unknown>()
      .on('start', function(event) {
        lastMousePosition = [event.x, event.y];
        stopGlobeRotation();
        setIsInteracted(true);
      })
      .on('drag', function(event) {
        const [x, y] = [event.x, event.y];
        const [lastX, lastY] = lastMousePosition;
        
        const deltaX = x - lastX;
        const deltaY = y - lastY;
        
        const currentRotation = projection.rotate();
        const newRotation: [number, number, number] = [
          currentRotation[0] + deltaX * 0.5,
          currentRotation[1] - deltaY * 0.5,
          currentRotation[2]
        ];
        
        rotationRef.current = newRotation;
        projection.rotate(newRotation);
        
        // Update paths and points
        g.selectAll('path.globe-feature').attr('d', path);
        updateEventPoints();
        
        lastMousePosition = [x, y];
      })
      .on('end', function() {
        // Resume auto-rotation after a delay
        setTimeout(() => {
          setIsInteracted(false);
        }, 3000); // 3 second pause before resuming rotation
      });

    svg.call(dragBehavior);

    // Set up zoom behavior - matches original zoom system (script.js lines 302-306)
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent(GLOBE_CONFIG.zoomExtent)
      .on('zoom', function(event) {
        const { transform } = event;
        const newScale = (size / 2 - 2) * transform.k;
        projection.scale(newScale);
        
        g.selectAll('path.globe-feature').attr('d', path);
        updateEventPoints();
      });

    svg.call(zoomBehavior);

    // Add mouse wheel zoom handling
    svg.on('wheel', function(event) {
      event.preventDefault();
      const delta = event.deltaY;
      const scaleFactor = delta > 0 ? 0.9 : 1.1;
      
      svg.transition()
         .duration(200)
         .call(zoomBehavior.scaleBy, scaleFactor);
    });

    // Initial render of event points
    updateEventPoints();
    
    // Start auto-rotation
    startGlobeRotation();

    return () => {
      stopGlobeRotation();
    };
  }, [updateEventPoints, startGlobeRotation, stopGlobeRotation]);

  // Update when selected event changes
  useEffect(() => {
    if (selectedEvent && selectedEvent.latitude && selectedEvent.longitude) {
      updateGlobeRotation(+selectedEvent.latitude, +selectedEvent.longitude);
    }
  }, [selectedEvent, updateGlobeRotation]);

  // Update event points when filtered events change
  useEffect(() => {
    updateEventPoints();
  }, [updateEventPoints]);

  return (
    <div 
      ref={containerRef}
      className={`globe-container relative ${className}`}
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '400px',
        background: 'radial-gradient(circle at 30% 20%, rgba(0, 50, 100, 0.3) 0%, rgba(0, 0, 0, 0.9) 50%, #000000 100%)',
        border: '2px solid var(--ufo-accent-purple)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(135, 115, 255, 0.3)'
      }}
    >
      {/* Starfield background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(1px 1px at 20% 30%, white, transparent),
            radial-gradient(1px 1px at 40% 70%, white, transparent),
            radial-gradient(1px 1px at 90% 40%, white, transparent),
            radial-gradient(1px 1px at 60% 10%, white, transparent),
            radial-gradient(2px 2px at 10% 80%, rgba(135, 115, 255, 0.8), transparent),
            radial-gradient(1px 1px at 80% 20%, rgba(27, 227, 255, 0.6), transparent)
          `,
          backgroundSize: '100px 100px, 80px 80px, 120px 120px, 90px 90px, 150px 150px, 110px 110px'
        }}
      />
      
      <svg
        ref={svgRef}
        className="globe-svg w-full h-full relative z-10"
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => {
          e.currentTarget.style.cursor = 'grabbing';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
      />
    </div>
  );
};
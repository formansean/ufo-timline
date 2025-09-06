# Data Visualization Components (D3.js)

## Overview

The UFO Timeline application features two sophisticated D3.js visualization components: an interactive horizontal Timeline and a 3D orthographic Globe. These components provide intuitive ways to explore UFO event data across temporal and geographical dimensions.

## Timeline Component (`src/components/Timeline/Timeline.tsx`)

### Architecture Overview

The Timeline component creates a horizontal timeline visualization with category-based event positioning, zoom/pan functionality, and interactive event selection.

### Key Features

**Interactive Timeline**:
- Horizontal time scale from 1940 to 2024
- Category-based Y-axis positioning
- Zoom range: 0.5x to 75x scale
- Mouse wheel and touch zoom support
- Clickable decade markers for navigation

**Visual Design**:
- Category color coding with glow effects
- Small circles for event representation
- Dynamic axis with adaptive tick intervals
- Event name display on selection
- Category row backgrounds and labels

**Performance Features**:
- Efficient event filtering and rendering
- Viewport culling for off-screen events
- Optimized D3 data binding
- Smooth zoom transitions

### Implementation Details

#### Component Props

```typescript
interface TimelineProps {
  events: UFOEvent[];                    // Event data array
  selectedEvent?: UFOEvent | null;       // Currently selected event
  onEventSelect: (event: UFOEvent) => void; // Event selection callback
  activeCategories: Set<EventCategory>;  // Visible categories
  activeCraftTypes: Set<string>;         // Craft type filters
  activeEntityTypes: Set<string>;        // Entity type filters
  favoriteEvents?: {                     // Favorite bookmarks
    yellow: Set<string>;
    orange: Set<string>;  
    red: Set<string>;
  };
  showingOnlyFavorites?: {              // Favorite visibility flags
    yellow: boolean;
    orange: boolean;
    red: boolean;
  };
}
```

#### D3.js Timeline Initialization

```typescript
// Timeline dimensions - matching original implementation
const margin = { top: 30, right: 50, bottom: 30, left: 200 };
const width = containerWidth - margin.left - margin.right;
const height = containerHeight - margin.top - margin.bottom;

// Time scale - horizontal axis from 1940 to 2024
const timeExtent = [new Date(1940, 0, 1), new Date(2024, 11, 31)];
const xScale = d3.scaleTime()
                .domain(timeExtent)
                .range([0, width]);

// Category scale for vertical positioning
const categories = Array.from(activeCategories);
const yScale = d3.scaleBand()
                .domain(categories)
                .range([0, height])
                .paddingInner(0.1);
```

#### Zoom and Pan Implementation

```typescript
// Create zoom behavior
const zoom = d3.zoom<SVGSVGElement, unknown>()
              .scaleExtent([0.5, 75])  // Matches original scale extent
              .extent([[0, 0], [width, height]])
              .on('zoom', (event) => {
                const { transform } = event;
                const newXScale = transform.rescaleX(xScale);
                updateTimeline(newXScale, transform);
              });

svg.call(zoom);
```

#### Dynamic Axis Generation

```typescript
const createXAxis = (interval: number) => {
  let tickInterval;
  let tickFormat = d3.timeFormat('%Y');
  
  if (interval < 1) {
    // Very zoomed in - show every year
    tickInterval = d3.timeYear.every(1);
  } else if (interval < 10) {
    // Medium zoom - show every 5 years
    tickInterval = d3.timeYear.every(5);
  } else {
    // Zoomed out - show decades
    tickInterval = d3.timeYear.every(10);
  }
  
  return d3.axisBottom(xScale)
            .ticks(tickInterval)
            .tickFormat(tickFormat)
            .tickSize(-height);
};
```

#### Event Rendering System

```typescript
// Group events by category for better positioning
const eventsByCategory = d3.group(filteredEvents, d => d.category);

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
    
    // Position within category row with slight vertical offset for overlapping events
    const baseY = categoryY + categoryHeight / 2;
    const yOffset = (index % 3 - 1) * 8; // Stagger overlapping events
    const eventY = baseY + yOffset;

    // Draw event as small circle
    const circle = g.append('circle')
      .attr('class', 'event-circle')
      .attr('cx', x)
      .attr('cy', eventY)
      .attr('r', 4)
      .style('fill', getCategoryColor(event.category))
      .style('stroke', 'white')
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (clickEvent, d) => {
        clickEvent.stopPropagation();
        onEventSelect(event);
      });
  });
});
```

#### Performance Optimizations

**Viewport Culling**:
```typescript
// Skip events outside visible area
if (x < -50 || x > width + 50) return;
```

**Event Staggering**:
```typescript
// Prevent overlapping events with vertical offset
const yOffset = (index % 3 - 1) * 8;
```

**Efficient Data Binding**:
```typescript
// Use D3's data binding for smooth updates
const circles = g.selectAll('.event-circle')
                 .data(filteredEvents)
                 .enter()
                 .append('circle');
```

## Globe Component (`src/components/Globe/Globe.tsx`)

### Architecture Overview

The Globe component renders a 3D orthographic projection showing UFO events as points on a rotating Earth, with interactive controls and automatic rotation.

### Key Features

**3D Visualization**:
- D3.js orthographic projection
- Auto-rotation with user interaction pause
- Event points with coordinate mapping
- Hemisphere visibility detection

**Interactive Controls**:
- Mouse drag rotation
- Zoom functionality (1x to 8x)
- Touch support for mobile devices
- Click-to-center on events

**Visual Design**:
- Space-themed background with starfield
- Category color-coded event points
- Glow effects and visual enhancements
- Responsive sizing and aspect ratio

### Implementation Details

#### Component Props

```typescript
interface GlobeProps {
  events: UFOEvent[];                    // Event data array
  selectedEvent?: UFOEvent | null;       // Currently selected event
  onEventSelect: (event: UFOEvent) => void; // Event selection callback
  activeCategories: Set<EventCategory>;  // Visible categories
  favoriteEvents?: {                     // Favorite bookmarks
    yellow: Set<string>;
    orange: Set<string>;
    red: Set<string>;
  };
  showingOnlyFavorites?: {              // Favorite visibility flags
    yellow: boolean;
    orange: boolean;
    red: boolean;
  };
  className?: string;                    // Additional CSS classes
}
```

#### D3.js Globe Initialization

```typescript
// Calculate responsive size
const size = Math.min(container.offsetWidth, container.offsetHeight);

// Create orthographic projection
const projection = d3.geoOrthographic()
                    .scale(size / 2 - 2)
                    .translate([size / 2, size / 2]);

// Create path generator
const path = d3.geoPath().projection(projection);

// Add globe background circle
g.append('circle')
  .attr('cx', size / 2)
  .attr('cy', size / 2)
  .attr('r', size / 2 - 2)
  .style('fill', 'rgba(0, 50, 100, 0.1)')
  .style('stroke', '#333')
  .style('stroke-width', 1);
```

#### Auto-Rotation System

```typescript
const startGlobeRotation = useCallback(() => {
  if (rotationIntervalRef.current) return;
  
  rotationIntervalRef.current = setInterval(() => {
    if (!isInteracted && projectionRef.current && svgRef.current) {
      rotationRef.current[0] += GLOBE_CONFIG.rotationSpeed;
      projectionRef.current.rotate(rotationRef.current);
      
      const svg = d3.select(svgRef.current);
      const g = svg.select('g.globe-group');
      
      // Update event points
      updateEventPoints();
    }
  }, GLOBE_CONFIG.rotationInterval);
}, [isInteracted]);
```

#### Interactive Controls

**Drag Rotation**:
```typescript
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
    const newRotation = [
      currentRotation[0] + deltaX * 0.5,
      currentRotation[1] - deltaY * 0.5,
      currentRotation[2]
    ];
    
    rotationRef.current = newRotation;
    projection.rotate(newRotation);
    
    updateEventPoints();
    lastMousePosition = [x, y];
  })
  .on('end', function() {
    // Resume auto-rotation after a delay
    setTimeout(() => setIsInteracted(false), 3000);
  });
```

**Zoom Control**:
```typescript
const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
  .scaleExtent(GLOBE_CONFIG.zoomExtent)
  .on('zoom', function(event) {
    const { transform } = event;
    const newScale = (size / 2 - 2) * transform.k;
    projection.scale(newScale);
    
    updateEventPoints();
  });
```

#### Event Point Management

```typescript
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
    .style('fill', (d: UFOEvent) => getCategoryColor(d.category))
    .style('stroke', 'white')
    .style('stroke-width', 1)
    .style('cursor', 'pointer')
    .on('click', function(event, d) {
      onEventSelect(d);
      // Center globe on selected event
      updateGlobeRotation(+d.latitude!, +d.longitude!);
    });

  // Position points based on projection
  points.each(function(d: UFOEvent) {
    const coordinates = [+d.longitude!, +d.latitude!];
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
```

### Configuration Constants (`src/constants/categories.ts`)

#### Timeline Configuration

```typescript
export const TIMELINE_DIMENSIONS = {
  margin: { top: 30, right: 50, bottom: 30, left: 200 },
  eventBoxWidth: 60,
  eventBoxHeight: 30,
  height: 420
};

export const ZOOM_CONFIG = {
  scaleExtent: [0.5, 75] as [number, number],
  wheelDelta: 0.1, // 10% zoom increments
  transitionDuration: 200
};
```

#### Globe Configuration

```typescript
export const GLOBE_CONFIG = {
  rotationSpeed: 0.2, // degrees per frame
  rotationInterval: 50, // milliseconds
  zoomExtent: [1, 8] as [number, number],
  transitionDuration: 1000
};
```

#### Category Color System

```typescript
export const CATEGORY_COLORS: Record<EventCategory, { base: string; hover: string }> = {
  "High Strangeness": { base: "#1BE3FF", hover: "#5FEBFF" },
  "Mass Sighting": { base: "#37C6FF", hover: "#6AD4FF" },
  "Sighting": { base: "#52AAFF", hover: "#7DBDFF" },
  "Community": { base: "#6D8FFF", hover: "#94ABFF" },
  "Interaction": { base: "#8773FF", hover: "#A799FF" },
  "Beings": { base: "#A257FF", hover: "#B983FF" },
  "Abduction": { base: "#BD3BFF", hover: "#D06FFF" },
  "Military Contact": { base: "#D81FFF", hover: "#E455FF" },
  "Tech": { base: "#F303FF", hover: "#F83FFF" },
  "Major Events": { base: "#FF00E6", hover: "#FF4DEA" }
};
```

## Data Processing Utilities (`src/utils/eventProcessing.ts`)

### Date Processing

```typescript
export function parseDateString(dateStr: string): Date {
  // Handle various date formats from UFO data
  // "March 13, 1997", "1947", "July 8, 1947", etc.
  const cleaned = dateStr.trim();
  
  // Try different parsing strategies
  const parsedDate = new Date(cleaned);
  
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }
  
  // Fallback for year-only dates
  const yearMatch = cleaned.match(/\d{4}/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[0]), 0, 1);
  }
  
  // Default fallback
  return new Date(1940, 0, 1);
}
```

### Event Data Processing

```typescript
export function processEventData(events: UFOEvent[]): TimelineEvent[] {
  return events
    .filter(event => event.date && event.category)
    .map(event => ({
      ...event,
      parsedDate: parseDateString(event.date),
      year: parseDateString(event.date).getFullYear(),
      key: `${event.category}-${event.date}-${event.time || ''}`
    }))
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
}
```

## Performance Optimization Strategies

### Timeline Optimizations

**Event Filtering**:
```typescript
const filteredEvents = useMemo(() => {
  return events.filter(event => {
    // Category filter
    if (!activeCategories.has(event.category)) return false;
    
    // Craft type filter  
    if (activeCraftTypes.size > 0 && event.craft_type) {
      const craftTypes = event.craft_type.split(', ');
      if (!craftTypes.some(type => activeCraftTypes.has(type))) return false;
    }
    
    // Entity type filter
    if (activeEntityTypes.size > 0 && event.entity_type) {
      const entityTypes = event.entity_type.split(', ');
      if (!entityTypes.some(type => activeEntityTypes.has(type))) return false;
    }
    
    return true;
  });
}, [events, activeCategories, activeCraftTypes, activeEntityTypes]);
```

**Viewport Culling**:
```typescript
// Skip rendering events outside visible area
if (x < -50 || x > width + 50) return;
```

### Globe Optimizations

**Coordinate Validation**:
```typescript
const filteredEvents = React.useMemo(() => {
  return events.filter(event => {
    // Must have valid coordinates
    if (!event.latitude || !event.longitude) return false;
    if (isNaN(+event.latitude) || isNaN(+event.longitude)) return false;
    
    // Category filter
    if (!activeCategories.has(event.category)) return false;
    
    return true;
  });
}, [events, activeCategories]);
```

**Hemisphere Visibility**:
```typescript
// Hide points on back of globe
if (projected) {
  d3.select(this)
    .attr('cx', projected[0])
    .attr('cy', projected[1])
    .style('display', 'block');
} else {
  d3.select(this).style('display', 'none');
}
```

## Visual Design System

### Color Coding Strategy

**Category Colors**: Each UFO event category has distinct colors progressing through the spectrum:
- High Strangeness: Bright cyan (#1BE3FF)
- Mass Sighting: Blue-cyan (#37C6FF)
- Community: Purple-blue (#6D8FFF)
- Major Events: Magenta (#FF00E6)

**Visual Effects**:
- Glow effects using CSS `drop-shadow`
- Smooth transitions for state changes
- Hover states with scale and opacity changes
- Selection highlighting with enhanced glow

### Responsive Design

**Timeline Responsiveness**:
```typescript
// Calculate dimensions based on container
const containerWidth = container.offsetWidth;
const containerHeight = container.offsetHeight;
const width = containerWidth - margin.left - margin.right;
const height = containerHeight - margin.top - margin.bottom;
```

**Globe Responsiveness**:
```typescript
// Maintain aspect ratio
const size = Math.min(container.offsetWidth, container.offsetHeight);
svg.attr('viewBox', `0 0 ${size} ${size}`);
```

## Integration with React

### Component Lifecycle

**useEffect for D3 Initialization**:
```typescript
useEffect(() => {
  // Initialize D3 visualization
  if (!svgRef.current) return;
  
  // Clear previous content
  svg.selectAll('*').remove();
  
  // Create visualization
  // ... D3 code
  
  // Cleanup function
  return () => {
    // Clean up intervals, event listeners
  };
}, [dependencies]);
```

**useCallback for Performance**:
```typescript
const updateVisualization = useCallback(() => {
  // Expensive D3 operations
}, [dependencies]);
```

**useMemo for Data Processing**:
```typescript
const processedData = useMemo(() => {
  return expensiveDataProcessing(rawData);
}, [rawData, filters]);
```

## Accessibility Considerations

### Keyboard Navigation
- Focus management for interactive elements
- Tab order for timeline navigation
- Keyboard shortcuts for zoom and pan

### Screen Reader Support
- ARIA labels for data points
- Descriptive text alternatives
- Structured heading hierarchy

### Visual Accessibility
- High contrast color combinations
- Scalable text and interface elements
- Motion reduction support for auto-rotation

This comprehensive visualization system provides an intuitive and engaging way to explore UFO event data across both temporal and geographical dimensions, with sophisticated D3.js implementations that maintain high performance and accessibility standards.
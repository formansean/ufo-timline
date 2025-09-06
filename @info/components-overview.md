# React Components Overview

## Component Architecture

The UFO Timeline application follows a component-based architecture with React 19 and TypeScript. All components are built as functional components using hooks for state management and side effects.

## Core Components

### 1. Timeline Component (`src/components/Timeline/Timeline.tsx`)

**Purpose**: Interactive horizontal timeline visualization using D3.js

**Props Interface**:
```typescript
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
```

**Key Features**:
- **D3.js Integration**: Horizontal timeline with category-based Y-axis positioning
- **Zoom/Pan Functionality**: 0.5x to 75x scale range with mouse wheel and drag support
- **Dynamic Time Scales**: Adaptive axis intervals (yearly, 5-year, decade) based on zoom level
- **Category Rows**: Each event category positioned on separate horizontal rows
- **Event Rendering**: Small circles with color-coding by category
- **Interactive Elements**: Clickable events with hover effects and name display
- **Decade Navigation**: Clickable decade markers for quick navigation
- **Auto-Focus**: Initial zoom to 1940-1980 period

**Implementation Details**:
- Uses `useMemo` for filtered event processing
- Real-time filtering by categories, craft types, entity types, and favorites
- Responsive SVG sizing based on container dimensions
- Event collision handling with vertical staggering
- Dynamic axis generation with proper tick formatting

### 2. Globe Component (`src/components/Globe/Globe.tsx`)

**Purpose**: 3D orthographic projection globe showing event locations

**Props Interface**:
```typescript
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
```

**Key Features**:
- **D3.js Orthographic Projection**: 3D globe visualization
- **Auto-Rotation**: Continuous rotation that pauses on user interaction
- **Interactive Controls**: Mouse drag rotation and zoom functionality
- **Event Point Mapping**: Color-coded points for events with coordinates
- **Smart Culling**: Hides points on globe's back side
- **Touch Support**: Mobile-friendly drag and zoom controls
- **Visual Effects**: Starfield background and glow effects

**Implementation Details**:
- Auto-rotation with configurable speed and pause on interaction
- Coordinate validation for event filtering
- Dynamic point updates on rotation/zoom
- Smooth transitions for rotation animations
- Responsive sizing with aspect ratio maintenance

### 3. EventDetails Component (`src/components/EventDetails/EventDetails.tsx`)

**Purpose**: Comprehensive event information display with tabbed interface

**Props Interface**:
```typescript
interface EventDetailsProps {
  event?: UFOEvent | null;
  onClose?: () => void;
  className?: string;
}
```

**Key Features**:
- **Tabbed Interface**: "Event Info" and "Deep Dive" tabs
- **Comprehensive Data Display**: All 40+ event fields organized into sections
- **Deep Dive Content**: Multimedia content (videos, images, reports, news)
- **Category Color Coding**: Visual category identification
- **Responsive Layout**: Grid-based layout adapting to screen size
- **Rich Media Support**: Image galleries, video links, PDF reports

**Implementation Details**:
- Conditional tab rendering based on content availability
- Dynamic content type handling (slider images, video links, reports)
- Organized field groups (Event Details, Craft Info, Evidence, Investigation)
- Community rating interface (likes/dislikes)
- Prose formatting for detailed summaries

### 4. SearchAndFilters Component (`src/components/Search/SearchAndFilters.tsx`)

**Purpose**: Multi-layer search and filtering interface

**Props Interface**:
```typescript
interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeCategories: Set<EventCategory>;
  onCategoryToggle: (category: EventCategory) => void;
  activeCraftTypes: Set<CraftType>;
  onCraftTypeToggle: (craftType: CraftType) => void;
  activeEntityTypes: Set<EntityType>;
  onEntityTypeToggle: (entityType: EntityType) => void;
  showingOnlyFavorites: {
    yellow: boolean;
    orange: boolean;
    red: boolean;
  };
  onFavoriteToggle: (color: 'yellow' | 'orange' | 'red') => void;
  className?: string;
}
```

**Key Features**:
- **Text Search**: Real-time search across event fields
- **Category Filtering**: Visual toggle buttons with category colors
- **Craft Type Filtering**: Multi-select craft type options
- **Entity Type Filtering**: Multi-select entity/being type options
- **Favorites Filtering**: Color-coded favorite bookmark filtering
- **Filter Statistics**: Live count of active filters

**Implementation Details**:
- Real-time filter state management through props
- Visual feedback for active/inactive states
- Color-coded buttons using category color constants
- Responsive flex layouts for filter groups
- Statistics display showing active filter counts

### 5. DonutChart Component (`src/components/DonutChart/DonutChart.tsx`)

**Purpose**: Category distribution visualization and event statistics

**Props Interface**:
```typescript
interface DonutChartProps {
  events: UFOEvent[];
  activeCategories: Set<EventCategory>;
  className?: string;
}
```

**Key Features**:
- **D3.js Donut Chart**: Visual breakdown of events by category
- **Dynamic Data**: Updates based on active filters
- **Category Color Coding**: Consistent with app-wide color scheme
- **Event Count Display**: Large numerical display of total events
- **Interactive Elements**: Hover effects with glow enhancement
- **Globe Reset Button**: Placeholder for globe interaction

**Implementation Details**:
- Automatic data processing and pie chart generation
- Filtered category data with zero-count exclusion
- Smooth transitions and hover animations
- Glow effects using CSS filters and drop-shadow
- Responsive sizing within container constraints

### 6. DeepDiveModal Component (`src/components/DeepDive/DeepDiveModal.tsx`)

**Purpose**: Full-screen modal for rich multimedia content exploration

**Props Interface**:
```typescript
interface DeepDiveModalProps {
  event: UFOEvent | null;
  isOpen: boolean;
  onClose: () => void;
}
```

**Key Features**:
- **Full-Screen Modal**: Overlay modal with backdrop
- **Dynamic Content Tabs**: Videos, Images, Reports, News Coverage
- **Media Type Handlers**: Specialized rendering for each content type
- **Responsive Gallery**: Grid layouts for images and content
- **External Link Handling**: Safe external navigation
- **Category Color Theming**: Border and accent colors match event category

**Implementation Details**:
- Content type detection and tab generation
- Specialized renderers for different media types
- Image gallery with click-to-expand functionality
- Video thumbnail display with external links
- Report cards with thumbnails and descriptions
- News article summaries with source attribution

## Component Communication Patterns

### State Management
- **Props Down**: Data flows down through component hierarchy
- **Callbacks Up**: Events bubble up through callback functions
- **State Co-location**: State managed at appropriate component levels
- **No Global State**: Pure React state management without external libraries

### Event Handling
- **Event Selection**: Coordinated across Timeline, Globe, and EventDetails
- **Filter Updates**: Real-time synchronization between SearchAndFilters and visualizations
- **Modal State**: Controlled modal visibility for DeepDiveModal
- **User Interactions**: Consistent handling across all interactive elements

### Performance Optimizations
- **useMemo**: Expensive calculations cached (event filtering, data processing)
- **useCallback**: Function references stabilized for child components
- **Conditional Rendering**: Components only render when data is available
- **Event Throttling**: D3.js animations and transitions optimized

## Styling and Theming

### CSS Architecture
- **Tailwind CSS**: Utility-first styling approach
- **CSS Variables**: Custom UFO-themed color palette
- **Responsive Design**: Mobile-first approach with breakpoint considerations
- **Component-Scoped Styles**: Isolated styling with proper class naming

### Color System
- **Category Colors**: Consistent color mapping for event categories
- **Accent Colors**: UFO-themed cyan, purple, and blue accents
- **Interactive States**: Hover, active, and selected state styling
- **Dark Theme**: Space/UFO themed dark color palette

### Visual Effects
- **Glow Effects**: CSS drop-shadow for UFO aesthetic
- **Transitions**: Smooth animations for state changes
- **Gradients**: Space-themed background gradients
- **Transparency**: Strategic use of opacity for layering

## Accessibility Considerations

### Keyboard Navigation
- **Focus Management**: Proper tab order and focus indicators
- **Button Accessibility**: Clear button labels and roles
- **Modal Handling**: Focus trapping and escape key handling

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for interactive elements
- **Semantic HTML**: Proper heading structure and landmarks
- **Alt Text**: Image descriptions for screen readers

### Visual Accessibility
- **Color Contrast**: Sufficient contrast ratios for text
- **Focus Indicators**: Clear visual focus states
- **Size Targets**: Touch-friendly button and interaction areas

This component architecture provides a solid foundation for the UFO Timeline application with clear separation of concerns, consistent styling, and optimal performance.
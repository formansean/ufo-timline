# Database Schema and Data Models

## Overview

The UFO Timeline application supports multiple data storage strategies:
- **Current Implementation**: File-based storage with TypeScript data files
- **Future Implementation**: PostgreSQL database with Prisma ORM (configured but not active)
- **Hybrid Approach**: Ability to switch between storage methods

## Current Data Storage (File-Based)

### Event Data Storage
**Location**: `src/data/comprehensiveEvents.ts`

Events are stored as a TypeScript array exported as `COMPREHENSIVE_EVENTS`. This provides:
- Type safety with UFOEvent interface validation
- Easy development and testing
- No database setup requirements
- Direct import in API routes and components

### User Data Storage  
**Location**: `src/data/users.json`

User authentication data stored as JSON file with bcrypt password hashing:
```json
[
  {
    "id": "1",
    "username": "admin", 
    "email": "admin@ufotimeline.com",
    "password": "$2b$10$...", // bcrypt hashed
    "role": "admin",
    "createdAt": "2024-09-06T00:00:00.000Z"
  }
]
```

## Data Models and Schemas

### UFOEvent Interface

The core data model with 40+ fields organized into logical categories:

```typescript
interface UFOEvent {
  // Primary Identification
  id: string;                    // Unique identifier
  title: string;                 // Event name/title
  category: EventCategory;       // Classification category
  
  // Temporal Information
  date: string;                  // "March 13, 1997" format
  time?: string;                 // Time of occurrence
  
  // Geographical Information
  location?: string;             // General location description
  city?: string;                 // City name
  state?: string;                // State/province
  country?: string;              // Country name
  latitude?: string;             // Latitude coordinate (string)
  longitude?: string;            // Longitude coordinate (string)
  
  // Craft Characteristics
  craft_type?: string;           // Type of craft observed
  craft_size?: string;           // Size description
  craft_behavior?: string;       // Movement/behavior patterns
  color?: string;                // Color descriptions
  sound_or_noise?: string;       // Audio characteristics
  light_characteristics?: string; // Lighting patterns
  
  // Witness Information
  witnesses?: string;            // Number/type of witnesses
  eyewitness?: string;           // Specific witness accounts
  duration?: string;             // Duration of sighting
  weather?: string;              // Weather conditions
  
  // Evidence
  photo?: string;                // Photo evidence availability
  video?: string;                // Video evidence availability
  radar?: string;                // Radar confirmation
  
  // Entity Information (Close Encounters)
  entity_type?: string;          // Type of beings encountered
  close_encounter_scale?: string; // Hynek Classification
  telepathic_communication?: string; // Communication reports
  
  // Physical Effects
  physical_effects?: string;     // Physical traces/effects
  temporal_distortions?: string; // Time-related anomalies
  
  // Investigation Data
  credibility?: string;          // Credibility rating (0-100)
  notoriety?: string;           // Public awareness rating
  government_involvement?: string; // Official investigation
  recurring_sightings?: string;  // Multiple occurrences
  artifacts_or_relics?: string;  // Physical artifacts
  
  // Additional Content
  media_link?: string;           // External media links
  detailed_summary?: string;     // Comprehensive description
  symbols?: string;              // Symbolic markings
  deep_dive_content?: DeepDiveContent; // Rich media content
  
  // User Interaction
  likes: number;                 // User likes count
  dislikes: number;             // User dislikes count
  
  // Computed Fields (Frontend)
  year?: number;                 // Extracted from date
  month?: string;                // Extracted from date
  day?: number;                 // Extracted from date
  key?: string;                 // Composite key for React
}
```

### Event Categories

**Type Definition**:
```typescript
type EventCategory = 
  | "Major Events"      // Significant historical cases
  | "Tech"             // Technology-related sightings
  | "Military Contact" // Military encounters
  | "Abduction"        // Abduction experiences
  | "Beings"           // Entity encounters
  | "Interaction"      // Direct interaction events
  | "Sighting"         // Standard sightings
  | "Mass Sighting"    // Multiple witness events
  | "High Strangeness" // Highly unusual phenomena
  | "Community";       // Community-reported events
```

**Color Coding System**:
Each category has assigned colors for consistent visualization:
```typescript
const CATEGORY_COLORS = {
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

### Craft Types

**Enumerated Values**:
```typescript
type CraftType = 
  | "Orb"             // Spherical light objects
  | "Lights"          // Light formations
  | "Saucer"          // Classic flying saucer
  | "Sphere"          // Solid spherical objects
  | "Triangle"        // Triangular craft
  | "Cylinder"        // Cylindrical objects
  | "V-Shaped"        // V-formation craft
  | "Tic Tac"         // Tic Tac shaped (USS Nimitz)
  | "Diamond"         // Diamond-shaped
  | "Cube"            // Cubic objects
  | "Cube in Sphere"  // Cube within sphere
  | "Egg"             // Egg-shaped
  | "Oval"            // Oval objects
  | "Bell"            // Bell-shaped
  | "Organic"         // Organic appearance
  | "Other";          // Unclassified
```

### Entity Types

**Classification System**:
```typescript
type EntityType = 
  | "None Reported"   // No entities observed
  | "Grey"            // Classic grey aliens
  | "Mantid"          // Mantis-like beings
  | "Reptilian"       // Reptilian humanoids
  | "Tall Grey"       // Tall grey variants
  | "Tall White"      // Tall white beings
  | "Nordic"          // Nordic/Pleiadian type
  | "Robotic"         // Mechanical beings
  | "Humanoid"        // Human-like
  | "Human"           // Appearing human
  | "Female Entity"   // Specifically female
  | "Other";          // Unclassified
```

### Deep Dive Content System

**Rich Media Structure**:
```typescript
interface DeepDiveContent {
  Videos?: DeepDiveVideo[];       // Video links and thumbnails
  Images?: DeepDiveImage[];       // Image galleries
  Reports?: DeepDiveReport[];     // PDF reports and documents
  "News Coverage"?: DeepDiveNews[]; // News articles and coverage
}

interface DeepDiveVideo {
  type: "video";
  content: {
    video: Array<{
      video_link: string;         // External video URL
      thumbnail?: string;         // Video thumbnail image
    }>;
  };
}

interface DeepDiveImage {
  type: "slider";
  content: string[];              // Array of image URLs
}

interface DeepDiveReport {
  type: "report";
  content: {
    url: string;                  // Document URL
    title: string;                // Report title
    thumbnail: string;            // Document thumbnail
  };
}

interface DeepDiveNews {
  type: "news";
  content: {
    url: string;                  // Article URL
    title: string;                // Article headline
    source?: string;              // News source
  };
}
```

### User and Authentication Models

**User Interface**:
```typescript
interface User {
  id: string;                     // Unique identifier
  username: string;               // Login username
  email: string;                  // Email address
  password: string;               // bcrypt hashed password
  role: 'admin' | 'user';        // Authorization level
  createdAt: string;             // ISO timestamp
}
```

**Authentication Types**:
```typescript
interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  error?: string;
}
```

### Favorites System

**Color-Coded Bookmarking**:
```typescript
type FavoriteColor = "yellow" | "orange" | "red";

interface FavoriteEvents {
  yellow: Set<string>;            // Yellow bookmarks
  orange: Set<string>;            // Orange bookmarks  
  red: Set<string>;              // Red bookmarks
}

const FAVORITE_COLORS = {
  yellow: "#FFD700",              // Gold
  orange: "#FFA500",              // Orange
  red: "#FF4500"                 // Red-Orange
};
```

### Filtering and Search Models

**Filter State Management**:
```typescript
interface FilterState {
  searchTerm: string;                      // Text search
  activeCategories: Set<EventCategory>;    // Category filters
  activeCraftTypes: Set<CraftType>;       // Craft type filters
  activeEntityTypes: Set<EntityType>;     // Entity filters
  favoriteEvents: FavoriteEvents;         // Favorite selections
  showingOnlyFavorites: ShowingOnlyFavorites; // Favorite visibility
}

interface SearchFilters {
  search?: string;                // Search query
  categories?: EventCategory[];   // Category filter array
  craftTypes?: CraftType[];      // Craft filter array
  entityTypes?: EntityType[];    // Entity filter array
  favoritesOnly?: boolean;       // Favorites only mode
  page?: number;                 // Pagination page
  limit?: number;                // Results per page
}
```

### Visualization-Specific Models

**Timeline Data Extensions**:
```typescript
interface TimelineEvent extends UFOEvent {
  x?: number;                    // D3 calculated X position
  y?: number;                    // D3 calculated Y position
}

interface TimelineDimensions {
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  width: number;
  height: number;
  eventBoxWidth: number;
  eventBoxHeight: number;
}
```

**Globe Data Extensions**:
```typescript
interface GlobeEvent extends UFOEvent {
  coordinates?: [number, number]; // [longitude, latitude] for D3
  isVisible?: boolean;            // Visible on current hemisphere
}

interface GlobeProjection {
  scale: number;                  // Zoom level
  rotation: [number, number, number]; // [yaw, pitch, roll]
  translate: [number, number];    // Center point
}
```

## Future PostgreSQL Schema (Planned)

### Database Structure
When PostgreSQL integration is activated, the schema would include:

**Events Table**:
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category event_category_enum NOT NULL,
  date VARCHAR(50),
  time VARCHAR(50),
  location TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  craft_type VARCHAR(100),
  craft_size TEXT,
  craft_behavior TEXT,
  color VARCHAR(100),
  sound_or_noise TEXT,
  light_characteristics TEXT,
  witnesses TEXT,
  eyewitness TEXT,
  duration VARCHAR(100),
  weather VARCHAR(100),
  photo VARCHAR(10),
  video VARCHAR(10),
  radar VARCHAR(10),
  entity_type VARCHAR(100),
  close_encounter_scale VARCHAR(20),
  telepathic_communication TEXT,
  physical_effects TEXT,
  temporal_distortions TEXT,
  credibility VARCHAR(10),
  notoriety VARCHAR(10),
  government_involvement TEXT,
  recurring_sightings TEXT,
  artifacts_or_relics TEXT,
  media_link TEXT,
  detailed_summary TEXT,
  symbols TEXT,
  deep_dive_content JSONB,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Users Table**:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role_enum DEFAULT 'USER',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Event Ratings Table**:
```sql
CREATE TABLE event_ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_id INTEGER REFERENCES events(id),
  rating rating_enum NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);
```

**Favorites Table**:
```sql
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_id INTEGER REFERENCES events(id),
  color favorite_color_enum NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);
```

### Enums and Constraints
```sql
CREATE TYPE event_category_enum AS ENUM (
  'Major Events', 'Tech', 'Military Contact', 'Abduction',
  'Beings', 'Interaction', 'Sighting', 'Mass Sighting',
  'High Strangeness', 'Community'
);

CREATE TYPE user_role_enum AS ENUM ('USER', 'ADMIN');
CREATE TYPE rating_enum AS ENUM ('LIKE', 'DISLIKE');
CREATE TYPE favorite_color_enum AS ENUM ('yellow', 'orange', 'red');
```

### Indexes for Performance
```sql
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_location ON events(city, state, country);
CREATE INDEX idx_events_coordinates ON events(latitude, longitude);
CREATE INDEX idx_events_craft_type ON events(craft_type);
CREATE INDEX idx_events_entity_type ON events(entity_type);
CREATE INDEX idx_events_credibility ON events(credibility);
```

## Data Integrity and Validation

### Field Validation Rules
- **ID**: Must be unique string identifier
- **Title**: Required, non-empty string
- **Category**: Must match EventCategory enum
- **Date**: Flexible string format for historical compatibility
- **Coordinates**: Optional, validated as numeric strings
- **Ratings**: Non-negative integers
- **Deep Dive Content**: Valid JSON structure

### Data Consistency
- Category color mappings maintained in constants
- Craft and entity types validated against enums
- User roles properly enforced in authentication
- Coordinate validation for globe visualization

This comprehensive schema supports the full feature set of the UFO Timeline application with flexibility for future enhancements and proper data integrity.
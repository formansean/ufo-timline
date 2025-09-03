// UFO Event data structure based on original PHP/WordPress implementation

export interface UFOEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // "November 17, 1986" format
  time?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  
  // Craft characteristics
  craft_type?: string;
  craft_size?: string;
  craft_behavior?: string;
  color?: string;
  sound_or_noise?: string;
  light_characteristics?: string;
  
  // Witness and evidence data
  witnesses?: string;
  eyewitness?: string;
  duration?: string;
  weather?: string;
  photo?: string;
  video?: string;
  radar?: string;
  
  // Entity information
  entity_type?: string;
  close_encounter_scale?: string;
  telepathic_communication?: string;
  
  // Effects and phenomena
  physical_effects?: string;
  temporal_distortions?: string;
  
  // Investigation and credibility
  credibility?: string;
  notoriety?: string;
  government_involvement?: string;
  recurring_sightings?: string;
  artifacts_or_relics?: string;
  
  // Additional details
  media_link?: string;
  detailed_summary?: string;
  symbols?: string;
  
  // Deep dive content
  deep_dive_content?: DeepDiveContent;
  
  // User interactions
  likes: number;
  dislikes: number;
  
  // Processed fields (added by frontend)
  year?: number;
  month?: string;
  day?: number;
  key?: string;
}

export type EventCategory = 
  | "Major Events"
  | "Tech" 
  | "Military Contact"
  | "Abduction"
  | "Beings"
  | "Interaction"
  | "Sighting"
  | "Mass Sighting"
  | "High Strangeness"
  | "Community";

export type CraftType = 
  | "Orb"
  | "Lights"
  | "Saucer"
  | "Sphere"
  | "Triangle"
  | "Cylinder"
  | "V-Shaped"
  | "Tic Tac"
  | "Diamond"
  | "Cube"
  | "Cube in Sphere"
  | "Egg"
  | "Oval"
  | "Bell"
  | "Organic"
  | "Other";

export type EntityType = 
  | "None Reported"
  | "Grey"
  | "Mantid"
  | "Reptilian"
  | "Tall Grey"
  | "Tall White"
  | "Nordic"
  | "Robotic"
  | "Humanoid"
  | "Human"
  | "Female Entity"
  | "Other";

export interface DeepDiveContent {
  Videos?: DeepDiveVideo[];
  Images?: DeepDiveImage[];
  Reports?: DeepDiveReport[];
  "News Coverage"?: DeepDiveNews[];
}

export interface DeepDiveVideo {
  type: "video";
  content: {
    video: Array<{
      video_link: string;
    }>;
  };
}

export interface DeepDiveImage {
  type: "slider";
  content: string[];
}

export interface DeepDiveReport {
  type: "report";
  content: {
    url: string;
    title: string;
    thumbnail: string;
  };
}

export interface DeepDiveNews {
  type: "news";
  content: {
    url: string;
    title: string;
    source?: string;
  };
}

// Favorites system
export type FavoriteColor = "yellow" | "orange" | "red";

export interface FavoriteEvents {
  yellow: Set<string>;
  orange: Set<string>;
  red: Set<string>;
}

export interface ShowingOnlyFavorites {
  yellow: boolean;
  orange: boolean;
  red: boolean;
}

// Filter states
export interface FilterState {
  searchTerm: string;
  activeCategories: Set<EventCategory>;
  activeCraftTypes: Set<CraftType>;
  activeEntityTypes: Set<EntityType>;
  favoriteEvents: FavoriteEvents;
  showingOnlyFavorites: ShowingOnlyFavorites;
}

// Timeline specific types
export interface TimelineEvent extends UFOEvent {
  x?: number; // D3 calculated position
  y?: number; // D3 calculated position
}

export interface TimelineDimensions {
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

// Globe specific types
export interface GlobeEvent extends UFOEvent {
  coordinates?: [number, number]; // [longitude, latitude] for D3
  isVisible?: boolean; // On visible hemisphere
}

export interface GlobeProjection {
  scale: number;
  rotation: [number, number, number];
  translate: [number, number];
}

// User and authentication types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
}

export interface EventRating {
  id: string;
  userId: string;
  eventId: string;
  rating: "LIKE" | "DISLIKE";
}

// API response types
export interface EventsResponse {
  events: UFOEvent[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchFilters {
  search?: string;
  categories?: EventCategory[];
  craftTypes?: CraftType[];
  entityTypes?: EntityType[];
  favoritesOnly?: boolean;
  page?: number;
  limit?: number;
}
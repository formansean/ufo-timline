// Category definitions and color schemes based on original implementation
import { EventCategory, CraftType, EntityType } from '@/types/event';

export const CATEGORIES: EventCategory[] = [
  "Major Events",
  "Tech", 
  "Military Contact",
  "Abduction",
  "Beings",
  "Interaction",
  "Sighting",
  "Mass Sighting",
  "High Strangeness",
  "Community"
];

export const CRAFT_TYPES: CraftType[] = [
  "Orb",
  "Lights",
  "Saucer",
  "Sphere", 
  "Triangle",
  "Cylinder",
  "V-Shaped",
  "Tic Tac",
  "Diamond",
  "Cube",
  "Cube in Sphere",
  "Egg",
  "Oval", 
  "Bell",
  "Organic",
  "Other"
];

export const ENTITY_TYPES: EntityType[] = [
  "None Reported",
  "Grey",
  "Mantid",
  "Reptilian",
  "Tall Grey",
  "Tall White",
  "Nordic",
  "Robotic",
  "Humanoid",
  "Human",
  "Female Entity",
  "Other"
];

// Color scheme based on original script.js lines 41-87
export const CATEGORY_COLORS: Record<EventCategory, { base: string; hover: string }> = {
  "High Strangeness": {
    base: "#1BE3FF",
    hover: "#5FEBFF"
  },
  "Mass Sighting": {
    base: "#37C6FF", 
    hover: "#6AD4FF"
  },
  "Sighting": {
    base: "#52AAFF",
    hover: "#7DBDFF"
  },
  "Community": {
    base: "#6D8FFF",
    hover: "#94ABFF"
  },
  "Interaction": {
    base: "#8773FF",
    hover: "#A799FF"
  },
  "Beings": {
    base: "#A257FF",
    hover: "#B983FF"
  },
  "Abduction": {
    base: "#BD3BFF",
    hover: "#D06FFF"
  },
  "Military Contact": {
    base: "#D81FFF",
    hover: "#E455FF"
  },
  "Tech": {
    base: "#F303FF",
    hover: "#F83FFF"
  },
  "Major Events": {
    base: "#FF00E6",
    hover: "#FF4DEA"
  }
};

// Timeline dimensions matching original implementation (script.js lines 89-93)
export const TIMELINE_DIMENSIONS = {
  margin: { top: 30, right: 50, bottom: 30, left: 200 },
  eventBoxWidth: 60, // Increased by 20%
  eventBoxHeight: 30,
  height: 420 // Increased by 20px
};

// Zoom configuration matching original (script.js lines 782-788)  
export const ZOOM_CONFIG = {
  scaleExtent: [0.5, 75] as [number, number],
  wheelDelta: 0.1, // 10% zoom increments
  transitionDuration: 200
};

// Globe configuration
export const GLOBE_CONFIG = {
  rotationSpeed: 0.2, // degrees per frame
  rotationInterval: 50, // milliseconds
  zoomExtent: [1, 8] as [number, number],
  transitionDuration: 1000
};

// Favorite colors
export const FAVORITE_COLORS = {
  yellow: "#FFD700",
  orange: "#FFA500", 
  red: "#FF4500"
} as const;
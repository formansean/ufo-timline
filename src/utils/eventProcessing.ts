// Event processing utilities matching original script.js implementation
import { UFOEvent, TimelineEvent } from '@/types/event';

/**
 * Process raw event data - matches original data transformation (script.js lines 23-32)
 */
export function processEventData(events: UFOEvent[]): TimelineEvent[] {
  return events.map(event => {
    // Parse date in "Month Day, Year" format
    const dateParts = event.date.split(' ');
    let month = '', day = 0, year = 1947;
    
    if (dateParts.length >= 3) {
      month = dateParts[0];
      day = parseInt(dateParts[1].replace(',', ''));
      year = parseInt(dateParts[2]);
    }
    
    return {
      ...event,
      year,
      month,
      day,
      key: event.category // Use category as the key
    };
  });
}

/**
 * Calculate event score - matches original calculateEventScore (script.js lines 163-165)
 */
export function calculateEventScore(event: UFOEvent): number {
  const credibility = parseFloat(event.credibility || '0') || 0;
  const notoriety = parseFloat(event.notoriety || '0') || 0;
  return credibility + notoriety;
}

/**
 * Parse date string into Date object
 */
export function parseDateString(dateString: string): Date {
  // Handle formats like "November 17, 1986"
  const cleaned = dateString.replace(',', '');
  const parsed = new Date(cleaned);
  
  if (isNaN(parsed.getTime())) {
    // Fallback for parsing issues
    const parts = dateString.split(' ');
    if (parts.length >= 3) {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthIndex = monthNames.indexOf(parts[0]);
      const day = parseInt(parts[1].replace(',', ''));
      const year = parseInt(parts[2]);
      
      if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
        return new Date(year, monthIndex, day);
      }
    }
    // Ultimate fallback
    return new Date(1947, 0, 1);
  }
  
  return parsed;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Generate event ID for favorites system - matches original logic
 */
export function generateEventId(event: UFOEvent): string {
  return `${event.category}-${event.date}-${event.time}`;
}

/**
 * Filter events by search term - matches original search logic (script.js lines 34-42)
 */
export function filterEventsBySearch(events: UFOEvent[], searchTerm: string): UFOEvent[] {
  if (!searchTerm.trim()) return events;
  
  const searchLower = searchTerm.toLowerCase().trim();
  
  return events.filter(event => {
    const searchableFields = [
      event.title,
      event.detailed_summary,
      event.category,
      event.craft_type,
      event.entity_type,
      event.city,
      event.state,
      event.country
    ];
    
    return searchableFields.some(field => 
      field?.toLowerCase().includes(searchLower)
    );
  });
}

/**
 * Check if event matches craft type filter
 */
export function eventMatchesCraftTypes(event: UFOEvent, activeCraftTypes: Set<string>): boolean {
  if (activeCraftTypes.size === 0) return true;
  if (!event.craft_type) return false;
  
  const craftTypes = event.craft_type.split(', ');
  return craftTypes.some(type => activeCraftTypes.has(type));
}

/**
 * Check if event matches entity type filter  
 */
export function eventMatchesEntityTypes(event: UFOEvent, activeEntityTypes: Set<string>): boolean {
  if (activeEntityTypes.size === 0) return true;
  if (!event.entity_type) return false;
  
  const entityTypes = event.entity_type.split(', ');
  return entityTypes.some(type => activeEntityTypes.has(type));
}

/**
 * Get events for a specific decade
 */
export function getEventsForDecade(events: TimelineEvent[], decade: number): TimelineEvent[] {
  return events.filter(event => {
    const eventYear = event.year || 1947;
    return eventYear >= decade && eventYear < decade + 10;
  });
}

/**
 * Get date extent for events
 */
export function getDateExtent(events: TimelineEvent[]): [Date, Date] {
  if (events.length === 0) {
    return [new Date(1940, 0, 1), new Date(2024, 11, 31)];
  }
  
  const dates = events.map(event => new Date(event.year || 1947, 0, 1));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  // Add padding
  minDate.setFullYear(minDate.getFullYear() - 1);
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  
  return [minDate, maxDate];
}

/**
 * Debounce function for search performance - matches original (script.js lines 183-193)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
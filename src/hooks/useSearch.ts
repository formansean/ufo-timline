import { useState, useMemo, useCallback } from 'react';
import { UFOEvent, EventCategory, CraftType, EntityType } from '@/types/event';
import { debounce } from '@/utils/eventProcessing';

export interface UseSearchProps {
  events: UFOEvent[];
  activeCategories: Set<EventCategory>;
  activeCraftTypes: Set<CraftType>;
  activeEntityTypes: Set<EntityType>;
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

export const useSearch = ({
  events,
  activeCategories,
  activeCraftTypes,
  activeEntityTypes,
  favoriteEvents,
  showingOnlyFavorites
}: UseSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounced search function - matches original script.js lines 183-193
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 300), // 300ms delay for performance
    []
  );

  // Handle search term changes with debouncing
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  }, [debouncedSearch]);

  // Multi-field search function - matches original performSearch (script.js lines 122-150)
  const searchEvents = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase().trim();
    
    if (!term) {
      return events;
    }

    return events.filter(event => {
      // Search across multiple fields as in original
      const searchableFields = [
        event.title,
        event.detailed_summary,
        event.category,
        event.craft_type,
        event.entity_type,
        event.city,
        event.state,
        event.country,
        event.witnesses,
        event.location
      ];

      return searchableFields.some(field => 
        field && field.toLowerCase().includes(term)
      );
    });
  }, [events, debouncedSearchTerm]);

  // Apply all filters - matches original updateEvents logic (script.js lines 996-1012)  
  const filteredEvents = useMemo(() => {
    let filtered = searchEvents.filter(event => {
      // Category filter
      if (!activeCategories.has(event.category as EventCategory)) {
        return false;
      }
      
      // Craft type filter - handles comma-separated values
      if (activeCraftTypes.size > 0 && event.craft_type) {
        const craftTypes = event.craft_type.split(', ');
        if (!craftTypes.some(type => activeCraftTypes.has(type as CraftType))) {
          return false;
        }
      }
      
      // Entity type filter - handles comma-separated values  
      if (activeEntityTypes.size > 0 && event.entity_type) {
        const entityTypes = event.entity_type.split(', ');
        if (!entityTypes.some(type => activeEntityTypes.has(type as EntityType))) {
          return false;
        }
      }
      
      return true;
    });

    // Apply favorites filter if any color is active - matches original logic
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

    // Sort by combined credibility and notoriety score - matches original calculateEventScore
    return filtered.sort((a, b) => {
      const scoreA = (parseFloat(a.credibility || '0') || 0) + (parseFloat(a.notoriety || '0') || 0);
      const scoreB = (parseFloat(b.credibility || '0') || 0) + (parseFloat(b.notoriety || '0') || 0);
      return scoreB - scoreA; // Higher scores first
    });
  }, [searchEvents, activeCategories, activeCraftTypes, activeEntityTypes, favoriteEvents, showingOnlyFavorites]);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  // Search stats for UI feedback
  const searchStats = useMemo(() => ({
    totalEvents: events.length,
    searchResults: searchEvents.length,
    filteredResults: filteredEvents.length,
    hasActiveSearch: debouncedSearchTerm.length > 0,
    hasActiveFilters: activeCraftTypes.size > 0 || activeEntityTypes.size > 0 || 
                     (showingOnlyFavorites && Object.values(showingOnlyFavorites).some(isActive => isActive))
  }), [events.length, searchEvents.length, filteredEvents.length, debouncedSearchTerm, activeCraftTypes.size, activeEntityTypes.size, showingOnlyFavorites]);

  return {
    searchTerm,
    debouncedSearchTerm,
    filteredEvents,
    handleSearchChange,
    clearSearch,
    searchStats
  };
};
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Timeline } from '@/components/Timeline/Timeline';
import { Globe } from '@/components/Globe/Globe';
import { DonutChart } from '@/components/DonutChart/DonutChart';
import { UFOEvent, EventCategory, CraftType, EntityType } from '@/types/event';
import { CATEGORIES, CRAFT_TYPES, ENTITY_TYPES, CATEGORY_COLORS } from '@/constants/categories';
import { debounce } from '@/utils/eventProcessing';
import { eventsApi } from '@/lib/api';
import { COMPREHENSIVE_EVENTS } from '@/data/comprehensiveEvents';
import { useSearch } from '@/hooks/useSearch';
import { useTodayInHistory } from '@/hooks/useTodayInHistory';
import { DeepDiveModal } from '@/components/DeepDive/DeepDiveModal';
import { useRating } from '@/hooks/useRating';

export default function Home() {
  // Event data
  const [events, setEvents] = useState<UFOEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<UFOEvent | null>(null);
  
  // Filter state
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(new Set(CATEGORIES));
  const [activeCraftTypes, setActiveCraftTypes] = useState<Set<CraftType>>(new Set());
  const [activeEntityTypes, setActiveEntityTypes] = useState<Set<EntityType>>(new Set());
  
  // Favorites state
  const [favoriteEvents] = useState({
    yellow: new Set<string>(),
    orange: new Set<string>(),
    red: new Set<string>()
  });
  
  const [showingOnlyFavorites, setShowingOnlyFavorites] = useState({
    yellow: false,
    orange: false,
    red: false
  });

  // Search functionality
  const {
    searchTerm,
    debouncedSearchTerm,
    filteredEvents,
    handleSearchChange,
    clearSearch,
    searchStats
  } = useSearch({
    events,
    activeCategories,
    activeCraftTypes,
    activeEntityTypes,
    favoriteEvents,
    showingOnlyFavorites
  });

  // Today in UFO History
  const {
    featuredEvent,
    todayFormatted,
    yearsAgo,
    hasEventsToday
  } = useTodayInHistory(events);

  // Deep Dive Modal state
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);

  // Event update handler for rating system
  const handleEventUpdate = useCallback((updatedEvent: UFOEvent) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    if (selectedEvent && selectedEvent.id === updatedEvent.id) {
      setSelectedEvent(updatedEvent);
    }
  }, [selectedEvent]);

  // Rating system
  const {
    handleLike,
    handleDislike,
    userVote,
    isSubmitting
  } = useRating({
    event: selectedEvent,
    onEventUpdate: handleEventUpdate
  });

  // Load events from API on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await eventsApi.getAll();
        setEvents(response.events);
        if (response.events.length > 0) {
          setSelectedEvent(response.events[0]); // Default to first event
        }
      } catch (error) {
        console.error('Error loading events:', error);
        // Fallback to comprehensive data if API fails
        setEvents(COMPREHENSIVE_EVENTS);
        setSelectedEvent(COMPREHENSIVE_EVENTS[0]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Event handlers
  const handleEventSelect = (event: UFOEvent) => {
    setSelectedEvent(event);
  };

  const handleCategoryToggle = (category: EventCategory) => {
    const newCategories = new Set(activeCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setActiveCategories(newCategories);
  };

  const handleCraftTypeToggle = (craftType: CraftType) => {
    const newCraftTypes = new Set(activeCraftTypes);
    if (newCraftTypes.has(craftType)) {
      newCraftTypes.delete(craftType);
    } else {
      newCraftTypes.add(craftType);
    }
    setActiveCraftTypes(newCraftTypes);
  };

  const handleEntityTypeToggle = (entityType: EntityType) => {
    const newEntityTypes = new Set(activeEntityTypes);
    if (newEntityTypes.has(entityType)) {
      newEntityTypes.delete(entityType);
    } else {
      newEntityTypes.add(entityType);
    }
    setActiveEntityTypes(newEntityTypes);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ufo-bg-gradient)' }}>
        <div className="text-cyan-400 text-2xl">Loading UFO Timeline...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header Container - Matching Original */}
      <div id="header-container">
        <h1 id="main-title">THE UFO TIMELINE</h1>
        <div 
          id="this-day-container"
          onClick={hasEventsToday && featuredEvent ? () => handleEventSelect(featuredEvent) : undefined}
        >
          <div id="this-day-header">
            <h2 id="this-day-heading">Today in UFO History</h2>
          </div>
          <h3 id="this-day-event-name">
            {hasEventsToday && featuredEvent ? featuredEvent.title.toUpperCase() : `No events on ${todayFormatted}`}
          </h3>
        </div>
      </div>

      {/* Timeline Container - Matching Original */}
      <div id="timeline-container">
        <Timeline
          events={filteredEvents}
          selectedEvent={selectedEvent}
          onEventSelect={handleEventSelect}
          activeCategories={activeCategories}
          activeCraftTypes={activeCraftTypes}
          activeEntityTypes={activeEntityTypes}
          favoriteEvents={favoriteEvents}
          showingOnlyFavorites={showingOnlyFavorites}
        />
      </div>

      {/* Search and List Container - Top Controls Bar */}
      <div id="search-and-list-container">
        <div id="top-toggles-container">
          <div className="toggle-section">
            <h3>Craft</h3>
            <div id="craft-type-toggles">
              {CRAFT_TYPES.slice(0, 8).map((craftType) => (
                <button
                  key={craftType}
                  onClick={() => handleCraftTypeToggle(craftType)}
                  className={`filter-button ${activeCraftTypes.has(craftType) ? 'active' : ''}`}
                >
                  {craftType}
                </button>
              ))}
            </div>
          </div>
          <div className="toggle-section">
            <h3>Entity</h3>
            <div id="entity-type-toggles">
              {ENTITY_TYPES.slice(0, 6).map((entityType) => (
                <button
                  key={entityType}
                  onClick={() => handleEntityTypeToggle(entityType)}
                  className={`filter-button ${activeEntityTypes.has(entityType) ? 'active' : ''}`}
                >
                  {entityType}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div id="search-container">
          <input
            type="text"
            id="search-input"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search events..."
          />
        </div>
        <button className="filter-button">Event List</button>
      </div>

      {/* Info Container - 3-Column Bottom Layout */}
      <div id="info-container">
        {/* Event Details - Left Column */}
        <div id="event-details" className="info-box">
          {/* Deep Dive Button */}
          {selectedEvent && selectedEvent.deep_dive_content && Object.keys(selectedEvent.deep_dive_content).length > 0 && (
            <button 
              onClick={() => setIsDeepDiveOpen(true)}
              className="filter-button"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(51, 51, 51, 0.7)',
                zIndex: 10
              }}
            >
              DEEP DIVE
            </button>
          )}
          
          {selectedEvent && (
            <div id="event-content">
              <div className="event-details-left">
                {/* Event Header */}
                <div style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 255, 251, 0.3)' }}>
                  <div style={{ color: '#00fffb', fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {selectedEvent.title}
                  </div>
                  <div style={{ color: '#00fffb', fontSize: '14px', marginBottom: '3px' }}>
                    {selectedEvent.date}
                  </div>
                  <div style={{ color: 'white', fontSize: '12px' }}>
                    {[selectedEvent.city, selectedEvent.state, selectedEvent.country]
                      .filter(Boolean).join(', ')}
                  </div>
                </div>

                {/* Event Details Grid */}
                <div className="event-details-grid">
                  <div className="detail-item">
                    <span className="detail-title">TIME:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.time || 'Unknown'}</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">CRAFT BEHAVIOR:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.craft_behavior || 'Unknown'}</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">CE SCALE:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.close_encounter_scale || 'Unknown'}</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">WITNESSES:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.witnesses || 'Unknown'}</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">CRAFT TYPE:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.craft_type || 'Unknown'}</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">DURATION:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.duration || 'Unknown'}</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">WEATHER:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.weather || 'Unknown'}</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">RADAR:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.radar || 'No'}</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">PHOTO:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.photo || 'No'}</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">VIDEO:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.video || 'No'}</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">CREDIBILITY:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.credibility || 'Unknown'}/100</div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-title">GOVERNMENT:</span>
                    <div style={{ color: 'white', fontSize: '12px' }}>{selectedEvent.government_involvement || 'Unknown'}</div>
                  </div>
                </div>

                {/* Event Summary */}
                {selectedEvent.detailed_summary && (
                  <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(0, 255, 251, 0.3)' }}>
                    <div className="detail-title" style={{ marginBottom: '8px' }}>SUMMARY:</div>
                    <div style={{ color: 'white', fontSize: '12px', lineHeight: '1.4', marginLeft: '17px', marginRight: '17px' }}>
                      {selectedEvent.detailed_summary.split('\n').map((paragraph, index) => (
                        <p key={index} style={{ marginBottom: index > 0 ? '8px' : '0' }}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Globe Container - Middle Column */}
        <div id="globe-container" className="info-box">
          {/* Globe Category Toggles */}
          <div id="globe-category-toggles">
            {CATEGORIES.map((category) => (
              <div 
                key={category}
                className={`globe-category-toggle ${!activeCategories.has(category) ? 'inactive' : ''}`}
                data-category={category}
                onClick={() => handleCategoryToggle(category)}
              >
                <div className="globe-category-toggle-dot"></div>
                <div className="globe-category-name">{category}</div>
              </div>
            ))}
          </div>
          <Globe
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onEventSelect={handleEventSelect}
            activeCategories={activeCategories}
            favoriteEvents={favoriteEvents}
            showingOnlyFavorites={showingOnlyFavorites}
          />
        </div>

        {/* Toggles Container - Right Column */}
        <div id="toggles" className="info-box">
          <div id="donut-chart-container">
            <DonutChart 
              events={filteredEvents}
              activeCategories={activeCategories}
            />
          </div>
          <button className="filter-button">Event List</button>
          <div id="search-container">
            <input
              type="text"
              id="search-input"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search events..."
            />
          </div>
        </div>
      </div>

      {/* Deep Dive Modal */}
      <DeepDiveModal
        event={selectedEvent}
        isOpen={isDeepDiveOpen}
        onClose={() => setIsDeepDiveOpen(false)}
      />
    </>
  );
}

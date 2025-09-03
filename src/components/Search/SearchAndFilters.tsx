'use client';

import React from 'react';
import { EventCategory, CraftType, EntityType } from '@/types/event';
import { CATEGORIES, CRAFT_TYPES, ENTITY_TYPES, CATEGORY_COLORS, FAVORITE_COLORS } from '@/constants/categories';

interface SearchAndFiltersProps {
  // Search
  searchTerm: string;
  onSearchChange: (term: string) => void;
  
  // Category filters
  activeCategories: Set<EventCategory>;
  onCategoryToggle: (category: EventCategory) => void;
  
  // Craft type filters  
  activeCraftTypes: Set<CraftType>;
  onCraftTypeToggle: (craftType: CraftType) => void;
  
  // Entity type filters
  activeEntityTypes: Set<EntityType>;
  onEntityTypeToggle: (entityType: EntityType) => void;
  
  // Favorites
  showingOnlyFavorites: {
    yellow: boolean;
    orange: boolean;
    red: boolean;
  };
  onFavoriteToggle: (color: 'yellow' | 'orange' | 'red') => void;
  
  // UI state
  className?: string;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  activeCategories,
  onCategoryToggle,
  activeCraftTypes,
  onCraftTypeToggle,
  activeEntityTypes,
  onEntityTypeToggle,
  showingOnlyFavorites,
  onFavoriteToggle,
  className = ''
}) => {
  
  return (
    <div className={`search-filters space-y-4 ${className}`}>
      
      {/* Search Input - matches original search container */}
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Toggles */}
      <div className="toggle-section">
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryToggle(category)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                activeCategories.has(category)
                  ? 'text-white'
                  : 'text-gray-600 opacity-50'
              }`}
              style={{
                backgroundColor: CATEGORY_COLORS[category]?.base || '#999999',
                opacity: activeCategories.has(category) ? 1 : 0.5
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Craft Type Toggles */}
      <div className="toggle-section">
        <h3 className="text-lg font-semibold mb-2">Craft Types</h3>
        <div className="flex flex-wrap gap-2">
          {CRAFT_TYPES.map((craftType) => (
            <button
              key={craftType}
              onClick={() => onCraftTypeToggle(craftType)}
              className={`craft-type-button px-3 py-1 rounded text-sm border transition-all duration-200 ${
                activeCraftTypes.has(craftType)
                  ? 'bg-blue-500 text-white border-blue-500 active'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              data-type={craftType}
            >
              {craftType}
            </button>
          ))}
        </div>
      </div>

      {/* Entity Type Toggles */}
      <div className="toggle-section">
        <h3 className="text-lg font-semibold mb-2">Entity Types</h3>
        <div className="flex flex-wrap gap-2">
          {ENTITY_TYPES.map((entityType) => (
            <button
              key={entityType}
              onClick={() => onEntityTypeToggle(entityType)}
              className={`entity-type-button px-3 py-1 rounded text-sm border transition-all duration-200 ${
                activeEntityTypes.has(entityType)
                  ? 'bg-purple-500 text-white border-purple-500 active'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              data-type={entityType}
            >
              {entityType}
            </button>
          ))}
        </div>
      </div>

      {/* Favorites Filter */}
      <div className="toggle-section">
        <h3 className="text-lg font-semibold mb-2">Favorites</h3>
        <div className="flex gap-2">
          {(Object.keys(FAVORITE_COLORS) as Array<keyof typeof FAVORITE_COLORS>).map((color) => (
            <button
              key={color}
              onClick={() => onFavoriteToggle(color)}
              className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
                showingOnlyFavorites[color]
                  ? 'text-white shadow-lg'
                  : 'text-gray-700 opacity-50'
              }`}
              style={{
                backgroundColor: FAVORITE_COLORS[color],
                opacity: showingOnlyFavorites[color] ? 1 : 0.5
              }}
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Stats */}
      <div className="text-sm text-gray-500">
        <div>Categories: {activeCategories.size} / {CATEGORIES.length}</div>
        <div>Craft Types: {activeCraftTypes.size} / {CRAFT_TYPES.length}</div>
        <div>Entity Types: {activeEntityTypes.size} / {ENTITY_TYPES.length}</div>
      </div>
    </div>
  );
};
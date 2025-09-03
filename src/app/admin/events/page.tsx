'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UFOEvent } from '@/types/event';
import { eventsApi, handleApiError } from '@/lib/api';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<UFOEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsApi.getAll();
      setEvents(response.events);
    } catch (error) {
      console.error('Error loading events:', error);
      alert(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'credibility':
          return parseInt(b.credibility) - parseInt(a.credibility);
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const handleDelete = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsApi.delete(eventId);
        setEvents(events.filter(event => event.id !== eventId));
      } catch (error) {
        console.error('Error deleting event:', error);
        alert(handleApiError(error));
      }
    }
  };

  const categories = ['all', ...Array.from(new Set(events.map(event => event.category)))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cyan-400 text-xl">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">UFO Events</h1>
          <p className="text-gray-300">Manage all UFO sighting events and encounters</p>
        </div>
        <Link
          href="/admin/events/new"
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add New Event</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="credibility">Credibility</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-gray-900 border border-cyan-400/30 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-cyan-400">
            Events ({filteredEvents.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-700">
          {filteredEvents.map((event) => (
            <div key={event.id} className="p-6 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {event.title}
                    </h3>
                    <span className="bg-cyan-600/20 text-cyan-400 px-2 py-1 rounded text-xs font-medium">
                      {event.category}
                    </span>
                    <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs">
                      Credibility: {event.credibility}%
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>📅 {event.date}</span>
                    {event.time && <span>🕐 {event.time}</span>}
                    <span>📍 {event.city}, {event.state || event.country}</span>
                    <span>👁️ {event.witnesses ? 'Witnessed' : 'Unwitnessed'}</span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                    {event.detailed_summary?.substring(0, 200)}...
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🛸</div>
              <p className="text-gray-400 text-lg">No events found matching your criteria</p>
              <Link
                href="/admin/events/new"
                className="inline-block mt-4 text-cyan-400 hover:text-cyan-300"
              >
                Add your first event →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
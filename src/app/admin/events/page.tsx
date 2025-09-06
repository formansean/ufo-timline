'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UFOEvent } from '@/types/event';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<UFOEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId));
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="text-center">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Manage UFO Events</h1>
            <div className="space-x-4">
              <Link href="/admin">
                <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
                  Back to Dashboard
                </button>
              </Link>
              <Link href="/admin/events/new">
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                  Add New Event
                </button>
              </Link>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="all">All Categories</option>
              <option value="Sighting">Sighting</option>
              <option value="Encounter">Encounter</option>
              <option value="Abduction">Abduction</option>
              <option value="Crash">Crash</option>
              <option value="Landing">Landing</option>
            </select>
          </div>

          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {event.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {event.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {event.city ? `${event.city}, ${event.state || event.country}` : event.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-600 rounded">
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link href={`/admin/events/${event.id}/edit`}>
                          <button className="text-blue-400 hover:text-blue-300">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No events found matching your criteria.
            </div>
          )}

          <div className="mt-6 text-sm text-gray-400 text-center">
            Total Events: {filteredEvents.length}
          </div>

        </div>
      </div>
    </div>
  );
}
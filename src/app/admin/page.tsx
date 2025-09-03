'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { statsApi, handleApiError } from '@/lib/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    recentEvents: 0,
    totalCategories: 0,
    totalLocations: 0,
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await statsApi.getOverview();
        setStats({
          totalEvents: statsData.totalEvents,
          recentEvents: statsData.recentEvents,
          totalCategories: statsData.totalCategories,
          totalLocations: statsData.totalLocations,
        });
        setRecentEvents(statsData.recentEventsList || []);
      } catch (error) {
        console.error('Error loading stats:', error);
        // Keep default values on error
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cyan-400 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Admin Dashboard</h1>
        <p className="text-gray-300">Manage your UFO Timeline data and content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Events</p>
              <p className="text-2xl font-bold text-cyan-400">{stats.totalEvents}</p>
            </div>
            <div className="text-3xl">🛸</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-purple-400/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Recent Events (30 days)</p>
              <p className="text-2xl font-bold text-purple-400">{stats.recentEvents}</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-pink-400/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-pink-400">{stats.totalCategories}</p>
            </div>
            <div className="text-3xl">📂</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Locations</p>
              <p className="text-2xl font-bold text-cyan-400">{stats.totalLocations}</p>
            </div>
            <div className="text-3xl">🌍</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/events/new"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span className="text-xl">➕</span>
            <span>Add New UFO Event</span>
          </Link>
          
          <Link
            href="/admin/events"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span className="text-xl">📋</span>
            <span>Manage Events</span>
          </Link>
          
          <Link
            href="/"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span className="text-xl">👁️</span>
            <span>View Timeline</span>
          </Link>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-400">Recent Events</h2>
          <Link 
            href="/admin/events"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            View All →
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-400/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{event.title}</h3>
                  <p className="text-gray-400 text-sm">{event.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-cyan-600/20 text-cyan-400 px-2 py-1 rounded text-xs">
                    {event.category}
                  </span>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
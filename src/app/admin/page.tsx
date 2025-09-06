'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">UFO Timeline Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Link href="/admin/events" className="block">
              <div className="bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition-colors">
                <h3 className="text-lg font-semibold mb-2">Manage Events</h3>
                <p className="text-gray-300">Add, edit, and delete UFO cases</p>
                <div className="mt-4 text-blue-400">View Events →</div>
              </div>
            </Link>

            <Link href="/admin/upload" className="block">
              <div className="bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition-colors">
                <h3 className="text-lg font-semibold mb-2">Bulk Upload</h3>
                <p className="text-gray-300">Upload multiple events from JSON</p>
                <div className="mt-4 text-blue-400">Upload Data →</div>
              </div>
            </Link>

            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Statistics</h3>
              <p className="text-gray-300">View system statistics</p>
              <div className="mt-4 text-gray-400">Coming soon...</div>
            </div>

          </div>

          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              <Link href="/admin/events/new">
                <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                  Add New Case
                </button>
              </Link>

              <Link href="/">
                <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                  View Public Site
                </button>
              </Link>

              <button className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
                Export Data
              </button>

              <button className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
                Backup System
              </button>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
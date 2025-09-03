'use client';

import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    siteTitle: 'UFO Timeline',
    adminEmail: 'admin@ufotimeline.com',
    enableRegistration: false,
    moderateComments: true,
    defaultCredibility: 50,
    backupFrequency: 'daily',
    timezoneSetting: 'UTC'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Settings updated:', settings);
      // TODO: Replace with actual API call
      // await updateSettings(settings);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Settings</h1>
        <p className="text-gray-300">Configure your UFO Timeline application</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* General Settings */}
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site Title
              </label>
              <input
                type="text"
                name="siteTitle"
                value={settings.siteTitle}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timezone
              </label>
              <select
                name="timezoneSetting"
                value={settings.timezoneSetting}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Standard Time</option>
                <option value="PST">Pacific Standard Time</option>
                <option value="CST">Central Standard Time</option>
                <option value="MST">Mountain Standard Time</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Credibility Score
              </label>
              <input
                type="range"
                name="defaultCredibility"
                min="1"
                max="100"
                value={settings.defaultCredibility}
                onChange={handleInputChange}
                className="w-full accent-cyan-400"
              />
              <div className="text-center text-sm text-gray-400 mt-1">
                {settings.defaultCredibility}%
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Enable User Registration</h3>
                <p className="text-gray-400 text-sm">Allow new users to create accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableRegistration"
                  checked={settings.enableRegistration}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Moderate Comments</h3>
                <p className="text-gray-400 text-sm">Require approval for user comments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="moderateComments"
                  checked={settings.moderateComments}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Backup & Maintenance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backup Frequency
              </label>
              <select
                name="backupFrequency"
                value={settings.backupFrequency}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="never">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => {
                  console.log('Manual backup triggered');
                  alert('Backup initiated successfully!');
                }}
              >
                Create Manual Backup
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-gray-400">Application Version</div>
              <div className="text-white font-medium">1.0.0</div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-gray-400">Database Status</div>
              <div className="text-green-400 font-medium">Connected</div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-gray-400">Total Events</div>
              <div className="text-cyan-400 font-medium">4</div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-gray-400">Last Backup</div>
              <div className="text-purple-400 font-medium">Never</div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => {
              if (confirm('Are you sure you want to reset settings to defaults?')) {
                setSettings({
                  siteTitle: 'UFO Timeline',
                  adminEmail: 'admin@ufotimeline.com',
                  enableRegistration: false,
                  moderateComments: true,
                  defaultCredibility: 50,
                  backupFrequency: 'daily',
                  timezoneSetting: 'UTC'
                });
              }
            }}
          >
            Reset to Defaults
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
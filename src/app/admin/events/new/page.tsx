'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UFOEvent } from '@/types/event';
import { eventsApi, handleApiError } from '@/lib/api';

const NewEventPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<UFOEvent>>({
    title: '',
    category: 'Sighting',
    date: '',
    time: '',
    location: '',
    city: '',
    state: '',
    country: '',
    latitude: '',
    longitude: '',
    craft_type: '',
    craft_size: '',
    entity_type: '',
    close_encounter_scale: '1 - Sighting',
    craft_behavior: '',
    physical_effects: '',
    witnesses: '',
    eyewitness: 'No',
    duration: '',
    weather: '',
    photo: 'No',
    video: 'No',
    color: '',
    sound_or_noise: 'No',
    radar: 'No',
    credibility: '50',
    notoriety: '50',
    telepathic_communication: 'No',
    recurring_sightings: 'No',
    artifacts_or_relics: 'No',
    government_involvement: 'No',
    light_characteristics: '',
    temporal_distortions: 'No',
    media_link: '',
    detailed_summary: '',
    symbols: 'No',
    likes: 0,
    dislikes: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await eventsApi.create(formData);
      router.push('/admin/events');
    } catch (error) {
      console.error('Error creating event:', error);
      alert(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Sighting', 'Military Contact', 'Beings', 'Abduction', 'Landing', 'Investigation'];
  const craftTypes = ['Saucer', 'Cylinder', 'Triangle', 'Sphere', 'Cigar', 'Egg', 'Diamond', 'Other'];
  const craftSizes = ['Small', 'Medium', 'Large', 'Massive'];
  const entityTypes = ['None Reported', 'Humanoid', 'Grey', 'Nordic', 'Reptilian', 'Insectoid', 'Other'];
  const closeEncounterScales = ['1 - Sighting', '2 - Interaction', '3 - Beings', '4 - Abduction', '5 - Communication'];
  const yesNoOptions = ['Yes', 'No'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Add New UFO Event</h1>
          <p className="text-gray-300">Enter details for a new UFO sighting or encounter</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Events
        </button>
      </div>

      {/* Event Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title / Event Name *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="Enter event title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="text"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., July 24, 1948"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time
              </label>
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., 2:45 am"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Location Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location / Area
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="Specific location details"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="City name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                State / Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="State or province"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country *
              </label>
              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="Country name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Latitude
              </label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., 32.3792"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Longitude
              </label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., -86.3077"
              />
            </div>
          </div>
        </div>

        {/* Craft and Entity Information */}
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Craft and Entity Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Craft Type
              </label>
              <select
                name="craft_type"
                value={formData.craft_type}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="">Select craft type</option>
                {craftTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Craft Size
              </label>
              <select
                name="craft_size"
                value={formData.craft_size}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="">Select craft size</option>
                {craftSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Entity Type
              </label>
              <select
                name="entity_type"
                value={formData.entity_type}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Close Encounter Scale
              </label>
              <select
                name="close_encounter_scale"
                value={formData.close_encounter_scale}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                {closeEncounterScales.map(scale => (
                  <option key={scale} value={scale}>{scale}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Craft Behavior
              </label>
              <input
                type="text"
                name="craft_behavior"
                value={formData.craft_behavior}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., Hover, Fly By, Instantaneous Acceleration"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color(s)
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., Orange, Blue"
              />
            </div>
          </div>
        </div>

        {/* Witness and Evidence Information */}
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Witness and Evidence Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Witnesses
              </label>
              <textarea
                name="witnesses"
                value={formData.witnesses}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="List witnesses and their roles"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Eyewitness Account
              </label>
              <select
                name="eyewitness"
                value={formData.eyewitness}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                {yesNoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., 10 seconds, 50 minutes"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Photo Evidence
              </label>
              <select
                name="photo"
                value={formData.photo}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                {yesNoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video Evidence
              </label>
              <select
                name="video"
                value={formData.video}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                {yesNoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Radar Detection
              </label>
              <select
                name="radar"
                value={formData.radar}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                {yesNoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Additional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Credibility (1-100)
              </label>
              <input
                type="range"
                name="credibility"
                min="1"
                max="100"
                value={formData.credibility}
                onChange={handleInputChange}
                className="w-full accent-cyan-400"
              />
              <div className="text-center text-sm text-gray-400 mt-1">{formData.credibility}%</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notoriety (1-100)
              </label>
              <input
                type="range"
                name="notoriety"
                min="1"
                max="100"
                value={formData.notoriety}
                onChange={handleInputChange}
                className="w-full accent-purple-400"
              />
              <div className="text-center text-sm text-gray-400 mt-1">{formData.notoriety}%</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Weather Conditions
              </label>
              <input
                type="text"
                name="weather"
                value={formData.weather}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., Clear Skies, Cloudy, Rain"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Government Involvement
              </label>
              <select
                name="government_involvement"
                value={formData.government_involvement}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                {yesNoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Physical Effects
              </label>
              <textarea
                name="physical_effects"
                value={formData.physical_effects}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="Describe any physical effects observed"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Detailed Summary *
              </label>
              <textarea
                name="detailed_summary"
                required
                value={formData.detailed_summary}
                onChange={handleInputChange}
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="Provide a detailed description of the event"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Media Link
              </label>
              <input
                type="url"
                name="media_link"
                value={formData.media_link}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="https://example.com/media"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewEventPage;
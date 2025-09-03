'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UFOEvent } from '@/types/event';

// Sample data for demo - will be replaced with API calls
const SAMPLE_EVENTS: UFOEvent[] = [
  {
    id: '1',
    title: 'CHILES-WHITTED',
    category: 'Sighting',
    date: 'July 24, 1948',
    time: '2:45 am',
    location: '',
    city: 'Montgomery',
    state: 'Alabama', 
    country: 'US',
    latitude: '32.3792',
    longitude: '-86.3077',
    craft_type: 'Cylinder',
    craft_size: 'Large',
    entity_type: '',
    close_encounter_scale: '1 - Sighting',
    craft_behavior: 'Fly By',
    physical_effects: 'None Reported',
    witnesses: 'Captain Clarence Chiles, Co-pilot John Whitted, passenger',
    eyewitness: 'Yes',
    duration: '10 seconds',
    weather: 'Clear Skies',
    photo: 'No',
    video: 'No',
    color: 'Orange, Blue',
    sound_or_noise: 'No',
    radar: 'No',
    credibility: '85',
    notoriety: '75',
    telepathic_communication: 'No',
    recurring_sightings: 'No',
    artifacts_or_relics: 'No',
    government_involvement: 'Yes',
    light_characteristics: 'Constant',
    temporal_distortions: 'No',
    media_link: '',
    detailed_summary: 'The Chiles-Whitted UFO encounter is a significant event in the history of UFO sightings, occurring on the night of July 24, 1948...',
    symbols: 'No',
    likes: 15,
    dislikes: 2
  }
];

const EditEventPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<UFOEvent>>({});

  useEffect(() => {
    // Load event data
    const loadEvent = async () => {
      try {
        // TODO: Replace with actual API call
        const event = SAMPLE_EVENTS.find(e => e.id === eventId);
        if (event) {
          setFormData(event);
        } else {
          alert('Event not found');
          router.push('/admin/events');
        }
      } catch (error) {
        console.error('Error loading event:', error);
        alert('Error loading event');
        router.push('/admin/events');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId, router]);

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
      console.log('Updated Event:', formData);
      // TODO: Replace with actual API call
      // await updateEvent(eventId, formData);
      
      router.push('/admin/events');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cyan-400 text-xl">Loading event data...</div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Edit UFO Event</h1>
          <p className="text-gray-300">Update details for: {formData.title}</p>
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
                value={formData.title || ''}
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
                value={formData.category || ''}
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
                value={formData.date || ''}
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
                value={formData.time || ''}
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
                value={formData.location || ''}
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
                value={formData.city || ''}
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
                value={formData.state || ''}
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
                value={formData.country || ''}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none"
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
                value={formData.latitude || ''}
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
                value={formData.longitude || ''}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., -86.3077"
              />
            </div>
          </div>
        </div>

        {/* Additional sections would be similar to the new event form */}
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
                value={formData.credibility || '50'}
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
                value={formData.notoriety || '50'}
                onChange={handleInputChange}
                className="w-full accent-purple-400"
              />
              <div className="text-center text-sm text-gray-400 mt-1">{formData.notoriety}%</div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Detailed Summary *
              </label>
              <textarea
                name="detailed_summary"
                required
                value={formData.detailed_summary || ''}
                onChange={handleInputChange}
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="Provide a detailed description of the event"
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
            {isSubmitting ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventPage;
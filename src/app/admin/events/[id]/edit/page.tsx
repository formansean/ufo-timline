'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { UFOEvent, EventCategory, CraftType, EntityType } from '@/types/event';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [event, setEvent] = useState<UFOEvent | null>(null);

  const categories: EventCategory[] = [
    'Major Events', 'Tech', 'Military Contact', 'Abduction', 'Beings',
    'Interaction', 'Sighting', 'Mass Sighting', 'High Strangeness', 'Community'
  ];

  const craftTypes: CraftType[] = [
    'Orb', 'Lights', 'Saucer', 'Sphere', 'Triangle', 'Cylinder',
    'V-Shaped', 'Tic Tac', 'Diamond', 'Cube', 'Cube in Sphere',
    'Egg', 'Oval', 'Bell', 'Organic', 'Other'
  ];

  const entityTypes: EntityType[] = [
    'None Reported', 'Grey', 'Mantid', 'Reptilian', 'Tall Grey',
    'Tall White', 'Nordic', 'Robotic', 'Humanoid', 'Human',
    'Female Entity', 'Other'
  ];

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
      } else {
        alert('Failed to load event');
        router.push('/admin/events');
      }
    } catch (error) {
      console.error('Load failed:', error);
      alert('Failed to load event');
      router.push('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!event) return;
    
    const { name, value } = e.target;
    setEvent(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        router.push('/admin/events');
      } else {
        const data = await response.json();
        alert(`Failed to update event: ${data.error}`);
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/events');
      } else {
        const data = await response.json();
        alert(`Failed to delete event: ${data.error}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-red-400">Event not found</p>
          <Link href="/admin/events" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Edit UFO Event</h1>
          <div className="space-x-4">
            <Link href="/admin/events">
              <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white">
                Back to Events
              </button>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 px-4 py-2 rounded text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Event'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={event.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={event.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  required
                  placeholder="e.g., November 17, 1986"
                  value={event.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="text"
                  id="time"
                  name="time"
                  placeholder="e.g., 10:30 PM"
                  value={event.time || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Location Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={event.location || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={event.city || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={event.state || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={event.country || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  placeholder="e.g., 40.7128"
                  value={event.latitude || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  placeholder="e.g., -74.0060"
                  value={event.longitude || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Craft Characteristics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="craft_type" className="block text-sm font-medium text-gray-300 mb-2">
                  Craft Type
                </label>
                <select
                  id="craft_type"
                  name="craft_type"
                  value={event.craft_type || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select craft type</option>
                  {craftTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="craft_size" className="block text-sm font-medium text-gray-300 mb-2">
                  Craft Size
                </label>
                <input
                  type="text"
                  id="craft_size"
                  name="craft_size"
                  placeholder="e.g., 50 feet diameter"
                  value={event.craft_size || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="craft_behavior" className="block text-sm font-medium text-gray-300 mb-2">
                  Craft Behavior
                </label>
                <input
                  type="text"
                  id="craft_behavior"
                  name="craft_behavior"
                  placeholder="e.g., hovering, rapid movement"
                  value={event.craft_behavior || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  placeholder="e.g., metallic silver"
                  value={event.color || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="sound_or_noise" className="block text-sm font-medium text-gray-300 mb-2">
                  Sound/Noise
                </label>
                <input
                  type="text"
                  id="sound_or_noise"
                  name="sound_or_noise"
                  placeholder="e.g., humming, silent"
                  value={event.sound_or_noise || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="light_characteristics" className="block text-sm font-medium text-gray-300 mb-2">
                  Light Characteristics
                </label>
                <input
                  type="text"
                  id="light_characteristics"
                  name="light_characteristics"
                  placeholder="e.g., pulsing red lights"
                  value={event.light_characteristics || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Witness & Evidence</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="witnesses" className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Witnesses
                </label>
                <input
                  type="text"
                  id="witnesses"
                  name="witnesses"
                  placeholder="e.g., 3 witnesses"
                  value={event.witnesses || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="eyewitness" className="block text-sm font-medium text-gray-300 mb-2">
                  Eyewitness Details
                </label>
                <input
                  type="text"
                  id="eyewitness"
                  name="eyewitness"
                  placeholder="e.g., Police officer John Doe"
                  value={event.eyewitness || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  placeholder="e.g., 10 minutes"
                  value={event.duration || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="weather" className="block text-sm font-medium text-gray-300 mb-2">
                  Weather Conditions
                </label>
                <input
                  type="text"
                  id="weather"
                  name="weather"
                  placeholder="e.g., clear skies"
                  value={event.weather || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-2">
                  Photo Evidence
                </label>
                <input
                  type="text"
                  id="photo"
                  name="photo"
                  placeholder="e.g., Yes/No or URL"
                  value={event.photo || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="video" className="block text-sm font-medium text-gray-300 mb-2">
                  Video Evidence
                </label>
                <input
                  type="text"
                  id="video"
                  name="video"
                  placeholder="e.g., Yes/No or URL"
                  value={event.video || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="radar" className="block text-sm font-medium text-gray-300 mb-2">
                  Radar Evidence
                </label>
                <input
                  type="text"
                  id="radar"
                  name="radar"
                  placeholder="e.g., Yes/No"
                  value={event.radar || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Entity Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="entity_type" className="block text-sm font-medium text-gray-300 mb-2">
                  Entity Type
                </label>
                <select
                  id="entity_type"
                  name="entity_type"
                  value={event.entity_type || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select entity type</option>
                  {entityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="close_encounter_scale" className="block text-sm font-medium text-gray-300 mb-2">
                  Close Encounter Scale
                </label>
                <input
                  type="text"
                  id="close_encounter_scale"
                  name="close_encounter_scale"
                  placeholder="e.g., CE3"
                  value={event.close_encounter_scale || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="telepathic_communication" className="block text-sm font-medium text-gray-300 mb-2">
                  Telepathic Communication
                </label>
                <input
                  type="text"
                  id="telepathic_communication"
                  name="telepathic_communication"
                  placeholder="Details of any telepathic communication"
                  value={event.telepathic_communication || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Effects & Investigation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="physical_effects" className="block text-sm font-medium text-gray-300 mb-2">
                  Physical Effects
                </label>
                <input
                  type="text"
                  id="physical_effects"
                  name="physical_effects"
                  placeholder="e.g., electromagnetic interference"
                  value={event.physical_effects || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="temporal_distortions" className="block text-sm font-medium text-gray-300 mb-2">
                  Temporal Distortions
                </label>
                <input
                  type="text"
                  id="temporal_distortions"
                  name="temporal_distortions"
                  placeholder="e.g., missing time reported"
                  value={event.temporal_distortions || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="credibility" className="block text-sm font-medium text-gray-300 mb-2">
                  Credibility Rating
                </label>
                <input
                  type="text"
                  id="credibility"
                  name="credibility"
                  placeholder="e.g., High, Medium, Low"
                  value={event.credibility || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="notoriety" className="block text-sm font-medium text-gray-300 mb-2">
                  Notoriety Level
                </label>
                <input
                  type="text"
                  id="notoriety"
                  name="notoriety"
                  placeholder="e.g., Well-known, Obscure"
                  value={event.notoriety || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="government_involvement" className="block text-sm font-medium text-gray-300 mb-2">
                  Government Involvement
                </label>
                <input
                  type="text"
                  id="government_involvement"
                  name="government_involvement"
                  placeholder="e.g., Yes/No, details"
                  value={event.government_involvement || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="recurring_sightings" className="block text-sm font-medium text-gray-300 mb-2">
                  Recurring Sightings
                </label>
                <input
                  type="text"
                  id="recurring_sightings"
                  name="recurring_sightings"
                  placeholder="e.g., Yes/No, frequency"
                  value={event.recurring_sightings || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="artifacts_or_relics" className="block text-sm font-medium text-gray-300 mb-2">
                  Artifacts or Relics
                </label>
                <input
                  type="text"
                  id="artifacts_or_relics"
                  name="artifacts_or_relics"
                  placeholder="e.g., Physical evidence found"
                  value={event.artifacts_or_relics || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="symbols" className="block text-sm font-medium text-gray-300 mb-2">
                  Symbols
                </label>
                <input
                  type="text"
                  id="symbols"
                  name="symbols"
                  placeholder="Description of any symbols observed"
                  value={event.symbols || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Additional Information</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="media_link" className="block text-sm font-medium text-gray-300 mb-2">
                  Media Link
                </label>
                <input
                  type="url"
                  id="media_link"
                  name="media_link"
                  placeholder="https://example.com/article"
                  value={event.media_link || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="detailed_summary" className="block text-sm font-medium text-gray-300 mb-2">
                  Detailed Summary
                </label>
                <textarea
                  id="detailed_summary"
                  name="detailed_summary"
                  rows={6}
                  placeholder="Comprehensive description of the event..."
                  value={event.detailed_summary || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href="/admin/events">
              <button
                type="button"
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded"
            >
              {saving ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
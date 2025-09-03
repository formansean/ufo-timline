import { NextRequest, NextResponse } from 'next/server';
import { UFOEvent } from '@/types/event';

// In-memory storage for demonstration - will be replaced with database
let events: UFOEvent[] = [
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
  },
  {
    id: '43',
    title: 'Japan Airlines',
    category: 'Sighting',
    date: 'November 17, 1986',
    time: '5:11 pm',
    location: '',
    city: 'Anchorage',
    state: 'Alaska',
    country: 'United States',
    latitude: '61.2181',
    longitude: '-149.9003',
    craft_type: 'Saucer, Other',
    craft_size: 'Small, Large',
    entity_type: '',
    close_encounter_scale: '1 - Sighting',
    craft_behavior: 'Hover, Fly By, Instantaneous Acceleration',
    physical_effects: 'None Reported',
    witnesses: 'Captain Kenji Terauchi, First Officer Takanori Tamefuji, Flight Engineer Yoshio Tsukuda',
    eyewitness: 'Yes',
    duration: '50 minutes',
    weather: 'Clear Skies',
    photo: 'No',
    video: 'No',
    color: 'Orange',
    sound_or_noise: 'No',
    radar: 'No',
    credibility: '95',
    notoriety: '61',
    telepathic_communication: 'No',
    recurring_sightings: 'No',
    artifacts_or_relics: 'No',
    government_involvement: 'Yes',
    light_characteristics: 'Constant',
    temporal_distortions: 'No',
    media_link: '',
    detailed_summary: 'The Japan Airlines Cargo Flight 1628 incident is one of the most compelling and well-documented UFO encounters in modern aviation history...',
    symbols: 'No',
    likes: 1,
    dislikes: 0
  },
  {
    id: '50',
    title: 'Tehran',
    category: 'Military Contact',
    date: 'September 19, 1976',
    time: '',
    location: '',
    city: 'Tehran',
    state: 'Tehran Province',
    country: 'Iran',
    latitude: '35.6892',
    longitude: '51.3890',
    craft_type: 'Other',
    craft_size: 'Large',
    entity_type: 'None Reported',
    close_encounter_scale: '2 - Interaction',
    craft_behavior: 'Hover, Fly By, Instantaneous Acceleration',
    physical_effects: 'Instrumentation and communication failures, weapons systems failure, visual disorientation, radar interference, and reports from nearby residents of a loud noise and a bright flash of light.',
    witnesses: 'Lieutenant Yaddi Nazeri, Major Parviz Jafari, First Lieutenant Jalal Damirian, Several civilian witnesses',
    eyewitness: 'Yes',
    duration: 'Several hours',
    weather: 'Clear Skies',
    photo: 'No',
    video: 'No',
    color: 'Red, Green, Blue',
    sound_or_noise: 'No',
    radar: 'Yes',
    credibility: '95',
    notoriety: '85',
    telepathic_communication: 'None reported',
    recurring_sightings: 'No',
    artifacts_or_relics: 'No',
    government_involvement: 'Yes',
    light_characteristics: 'Flashing',
    temporal_distortions: 'No',
    media_link: '',
    detailed_summary: 'In the early morning of September 19, 1976, residents of Tehran began reporting a strange, luminous object in the sky...',
    symbols: 'No',
    likes: 0,
    dislikes: 0
  },
  {
    id: '52',
    title: 'Lonnie Zamora',
    category: 'Beings',
    date: 'April 24, 1964',
    time: '5:45 pm',
    location: '',
    city: 'Socorro',
    state: 'New Mexico',
    country: 'US',
    latitude: '34.0584',
    longitude: '-106.8914',
    craft_type: 'Egg',
    craft_size: 'Medium',
    entity_type: 'Humanoid',
    close_encounter_scale: '3 - Beings',
    craft_behavior: 'Fly By, Landed',
    physical_effects: 'None Reported',
    witnesses: 'Sergeant Lonnie Zamora',
    eyewitness: 'Yes',
    duration: '15-20 minutes',
    weather: 'Clear Skies',
    photo: 'No',
    video: 'No',
    color: 'Orange, Blue',
    sound_or_noise: 'Yes',
    radar: 'No',
    credibility: '95',
    notoriety: '87',
    telepathic_communication: 'None reported',
    recurring_sightings: 'No',
    artifacts_or_relics: 'No',
    government_involvement: 'Yes',
    light_characteristics: '',
    temporal_distortions: 'No',
    media_link: '',
    detailed_summary: 'The Lonnie Zamora Incident is one of the most credible and well-documented UFO sightings in the history of ufology...',
    symbols: 'Yes, Shapes, Unknown Writing',
    likes: 1,
    dislikes: 0
  }
];

// GET /api/events - Get all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let filteredEvents = [...events];

    // Apply filters
    if (category && category !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.city.toLowerCase().includes(searchLower) ||
        event.country.toLowerCase().includes(searchLower) ||
        event.detailed_summary?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const totalCount = filteredEvents.length;
    if (offset) {
      filteredEvents = filteredEvents.slice(parseInt(offset));
    }
    if (limit) {
      filteredEvents = filteredEvents.slice(0, parseInt(limit));
    }

    return NextResponse.json({
      events: filteredEvents,
      totalCount,
      hasMore: offset && limit ? 
        (parseInt(offset) + parseInt(limit)) < totalCount : false
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    // Validate required fields
    if (!eventData.title || !eventData.category || !eventData.date || !eventData.city || !eventData.country) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, date, city, country' },
        { status: 400 }
      );
    }

    // Create new event with generated ID
    const newEvent: UFOEvent = {
      ...eventData,
      id: Date.now().toString(),
      likes: 0,
      dislikes: 0,
    };

    // Add to events array (in production, this would be saved to database)
    events.push(newEvent);

    return NextResponse.json(newEvent, { status: 201 });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { COMPREHENSIVE_EVENTS } from '@/data/comprehensiveEvents';

// GET /api/events - Get all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Start with all events
    let filteredEvents = COMPREHENSIVE_EVENTS;

    // Filter by category
    if (category && category !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title?.toLowerCase().includes(searchTerm) ||
        event.city?.toLowerCase().includes(searchTerm) ||
        event.country?.toLowerCase().includes(searchTerm) ||
        event.detailed_summary?.toLowerCase().includes(searchTerm)
      );
    }

    // Get total count
    const totalCount = filteredEvents.length;

    // Apply pagination
    if (limit) {
      filteredEvents = filteredEvents.slice(offset, offset + limit);
    }

    return NextResponse.json({
      events: filteredEvents,
      totalCount,
      hasMore: limit ? (offset + limit) < totalCount : false
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}


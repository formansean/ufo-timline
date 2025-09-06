import { NextRequest, NextResponse } from 'next/server';
import { COMPREHENSIVE_EVENTS } from '@/data/comprehensiveEvents';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id] - Get single event by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const event = COMPREHENSIVE_EVENTS.find(e => e.id === id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);

  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}
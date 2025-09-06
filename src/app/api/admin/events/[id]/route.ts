import { NextRequest, NextResponse } from 'next/server';
import { UFOEvent } from '@/types/event';
import fs from 'fs';
import path from 'path';

const EVENTS_FILE = path.join(process.cwd(), 'src/data/comprehensiveEvents.ts');

// Helper function to read events from the TypeScript file
function readEventsFromFile(): UFOEvent[] {
  try {
    const content = fs.readFileSync(EVENTS_FILE, 'utf-8');
    const match = content.match(/export const COMPREHENSIVE_EVENTS: UFOEvent\[\] = (\[[\s\S]*?\]);/);
    if (match) {
      return eval(match[1]);
    }
    return [];
  } catch (error) {
    console.error('Error reading events:', error);
    return [];
  }
}

// Helper function to write events to the TypeScript file
function writeEventsToFile(events: UFOEvent[]): boolean {
  try {
    const fileContent = `import { UFOEvent } from '@/types/event';

// Comprehensive UFO events dataset spanning 1940-2024
// Based on historical UFO cases and documentation
export const COMPREHENSIVE_EVENTS: UFOEvent[] = ${JSON.stringify(events, null, 2)};
`;
    fs.writeFileSync(EVENTS_FILE, fileContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing events:', error);
    return false;
  }
}

// GET /api/admin/events/[id] - Get specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = readEventsFromFile();
    const event = events.find(e => e.id === id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/events/[id] - Update specific event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedEvent: UFOEvent = await request.json();
    const events = readEventsFromFile();
    
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    events[eventIndex] = { ...updatedEvent, id };
    
    if (writeEventsToFile(events)) {
      return NextResponse.json({ event: events[eventIndex] });
    } else {
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id] - Delete specific event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = readEventsFromFile();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    events.splice(eventIndex, 1);
    
    if (writeEventsToFile(events)) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
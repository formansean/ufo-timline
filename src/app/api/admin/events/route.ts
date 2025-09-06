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

// GET /api/admin/events - Get all events for admin
export async function GET() {
  try {
    const events = readEventsFromFile();
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching admin events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const newEvent: Omit<UFOEvent, 'id'> = await request.json();
    
    const events = readEventsFromFile();
    const maxId = Math.max(...events.map(e => parseInt(e.id) || 0), 0);
    const eventWithId: UFOEvent = {
      ...newEvent,
      id: String(maxId + 1)
    };
    
    events.push(eventWithId);
    
    if (writeEventsToFile(events)) {
      return NextResponse.json({ event: eventWithId }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Failed to save event' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
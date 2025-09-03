import { UFOEvent } from '@/types/event';

const API_BASE = '/api';

export interface EventsResponse {
  events: UFOEvent[];
  totalCount: number;
  hasMore: boolean;
}

export interface EventsParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Events API
export const eventsApi = {
  // Get all events with optional filters
  getAll: async (params?: EventsParams): Promise<EventsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}/events?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get single event by ID
  getById: async (id: string): Promise<UFOEvent> => {
    const response = await fetch(`${API_BASE}/events/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Event not found');
      }
      throw new Error(`Failed to fetch event: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Create new event
  create: async (eventData: Partial<UFOEvent>): Promise<UFOEvent> => {
    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create event: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Update existing event
  update: async (id: string, eventData: Partial<UFOEvent>): Promise<UFOEvent> => {
    const response = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update event: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Delete event
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete event: ${response.statusText}`);
    }
  },
};

// Statistics API (for admin dashboard)
export const statsApi = {
  getOverview: async () => {
    // For now, calculate from events - in production this would be a separate endpoint
    const { events, totalCount } = await eventsApi.getAll();
    
    const categories = new Set(events.map(e => e.category));
    const locations = new Set(events.map(e => `${e.city}, ${e.country}`));
    
    // Get recent events (within 30 days - for demo, we'll just take the 2 most recent)
    const sortedEvents = events.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return {
      totalEvents: totalCount,
      recentEvents: Math.min(2, totalCount),
      totalCategories: categories.size,
      totalLocations: locations.size,
      recentEventsList: sortedEvents.slice(0, 2)
    };
  }
};

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic error handler
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};
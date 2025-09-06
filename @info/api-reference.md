# API Reference Documentation

## Overview

The UFO Timeline API provides RESTful endpoints for managing UFO event data and user authentication. Built with Next.js 15 App Router, the API uses HTTP-only cookies for authentication and serves JSON responses.

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api`

## Authentication

The API uses JWT tokens stored in HTTP-only cookies for authentication. Protected endpoints require a valid `auth-token` cookie.

### Authentication Flow
1. Login via `/api/auth/login` to receive JWT token in HTTP-only cookie
2. Token automatically included in subsequent requests
3. Logout via `/api/auth/logout` to clear the token

## Public Endpoints

### Events API

#### GET `/api/events`
Get all UFO events with optional filtering and pagination.

**Query Parameters:**
- `category` (optional): Filter by event category
- `search` (optional): Search across title, city, country, and detailed summary
- `limit` (optional): Number of events to return
- `offset` (optional): Number of events to skip (pagination)

**Response:**
```typescript
{
  events: UFOEvent[];
  totalCount: number;
  hasMore: boolean;
}
```

**Example Request:**
```bash
GET /api/events?category=Sighting&search=phoenix&limit=10&offset=0
```

**Example Response:**
```json
{
  "events": [
    {
      "id": "1",
      "title": "Phoenix Lights",
      "category": "Mass Sighting",
      "date": "March 13, 1997",
      "city": "Phoenix",
      "state": "Arizona",
      "country": "United States",
      // ... additional UFOEvent fields
    }
  ],
  "totalCount": 1,
  "hasMore": false
}
```

#### GET `/api/events/[id]`
Get a specific UFO event by ID.

**Path Parameters:**
- `id`: Event ID (string)

**Response:**
```typescript
UFOEvent | { error: string }
```

**Example Request:**
```bash
GET /api/events/123
```

**Example Response:**
```json
{
  "id": "123",
  "title": "Roswell Incident",
  "category": "Major Events",
  "date": "July 8, 1947",
  "city": "Roswell",
  "state": "New Mexico",
  "country": "United States",
  "latitude": "33.3943",
  "longitude": "-104.5230",
  "craft_type": "Disc",
  "witnesses": "Multiple",
  "credibility": "85",
  "detailed_summary": "Famous UFO crash incident...",
  // ... all other UFOEvent fields
}
```

### Health Check

#### GET `/api/health`
System health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "ufo-timeline",
  "version": "1.0.0"
}
```

## Authentication Endpoints

### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```typescript
{
  username: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
  };
  error?: string;
}
```

**Example Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "securepassword"
}
```

**Success Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@ufo-timeline.com",
    "role": "admin"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### POST `/api/auth/logout`
Clear authentication token (logout).

**Response:**
```json
{
  "success": true
}
```

### GET `/api/auth/me`
Get current user information from token.

**Headers:**
- Requires `auth-token` cookie

**Response:**
```typescript
{
  success: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
  };
  error?: string;
}
```

## Protected Admin Endpoints

All admin endpoints require authentication with an admin role.

### GET `/api/admin/events`
Get all events for admin interface (no filtering).

**Headers:**
- Requires `auth-token` cookie with admin role

**Response:**
```json
{
  "events": UFOEvent[]
}
```

### POST `/api/admin/events`
Create a new UFO event.

**Headers:**
- Requires `auth-token` cookie with admin role

**Request Body:**
```typescript
Omit<UFOEvent, 'id'> // All UFOEvent fields except id
```

**Response:**
```json
{
  "event": UFOEvent
}
```

### GET `/api/admin/events/[id]`
Get specific event for admin interface.

**Path Parameters:**
- `id`: Event ID

**Headers:**
- Requires `auth-token` cookie with admin role

**Response:**
```json
{
  "event": UFOEvent
}
```

### PUT `/api/admin/events/[id]`
Update an existing UFO event.

**Path Parameters:**
- `id`: Event ID

**Headers:**
- Requires `auth-token` cookie with admin role

**Request Body:**
```typescript
UFOEvent // Complete UFOEvent object
```

**Response:**
```json
{
  "event": UFOEvent
}
```

### DELETE `/api/admin/events/[id]`
Delete a UFO event.

**Path Parameters:**
- `id`: Event ID

**Headers:**
- Requires `auth-token` cookie with admin role

**Response:**
```json
{
  "success": true
}
```

## Data Types

### UFOEvent Interface
The core data structure for UFO events with 40+ fields:

```typescript
interface UFOEvent {
  // Basic Information
  id: string;
  title: string;
  category: EventCategory;
  date: string; // "November 17, 1986" format
  time?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  
  // Craft characteristics
  craft_type?: string;
  craft_size?: string;
  craft_behavior?: string;
  color?: string;
  sound_or_noise?: string;
  light_characteristics?: string;
  
  // Witness and evidence data
  witnesses?: string;
  eyewitness?: string;
  duration?: string;
  weather?: string;
  photo?: string;
  video?: string;
  radar?: string;
  
  // Entity information
  entity_type?: string;
  close_encounter_scale?: string;
  telepathic_communication?: string;
  
  // Effects and phenomena
  physical_effects?: string;
  temporal_distortions?: string;
  
  // Investigation and credibility
  credibility?: string;
  notoriety?: string;
  government_involvement?: string;
  recurring_sightings?: string;
  artifacts_or_relics?: string;
  
  // Additional details
  media_link?: string;
  detailed_summary?: string;
  deep_dive_content?: DeepDiveContent;
  
  // User interaction
  likes?: number;
  dislikes?: number;
}
```

### EventCategory Enum
```typescript
type EventCategory = 
  | "Major Events"
  | "Tech" 
  | "Military Contact"
  | "Abduction"
  | "Beings"
  | "Interaction"
  | "Sighting"
  | "Mass Sighting"
  | "High Strangeness"
  | "Community";
```

### User Interface
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}
```

## Error Handling

All endpoints follow consistent error response patterns:

### HTTP Status Codes
- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request (missing/invalid parameters)
- `401`: Unauthorized (authentication required/invalid)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": "Human-readable error message"
}
```

### Authentication Errors
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

## Implementation Details

### Data Storage
- **Current**: File-based storage in TypeScript files
- **Future**: PostgreSQL with Prisma ORM (configured but not active)
- **Admin Operations**: Direct file system operations with TypeScript generation

### Security Features
- **JWT Tokens**: Secure token generation with configurable expiration
- **HTTP-Only Cookies**: Prevents XSS attacks on token storage
- **Password Hashing**: bcrypt with proper salt rounds
- **Input Validation**: Request body validation and sanitization
- **Error Messages**: Generic messages to prevent information disclosure

### Performance Considerations
- **File System Caching**: Event data loaded from file system on each request
- **Pagination**: Built-in pagination support for large datasets
- **Search Optimization**: Multi-field search with case-insensitive matching
- **Response Size**: Large datasets properly paginated to reduce response sizes

### Development vs Production
- **Cookie Security**: `secure` flag enabled in production
- **Error Logging**: Detailed server-side logging in development
- **CORS**: Appropriate cross-origin settings per environment

This API provides a complete interface for the UFO Timeline application with robust authentication, comprehensive event management, and proper error handling.
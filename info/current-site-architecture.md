# Current Site Architecture

## Overview

The current UFO Timeline site is built as a modern React application using Next.js 14 with TypeScript, representing a complete rewrite and modernization of the original WordPress/PHP implementation. This document provides a comprehensive overview of the current architecture, components, and technologies.

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 19.1.0** - Core UI library
- **TypeScript 5** - Type safety and developer experience
- **Tailwind CSS 4** - Utility-first CSS framework
- **D3.js 7.9.0** - Data visualization library

### Backend & Database
- **Express.js** - REST API server (in development)
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and load balancer
- **Redis** - Session storage and caching

## Project Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Main timeline page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── admin/             # Admin interface
│   │   │   ├── login/         # Admin authentication
│   │   │   ├── events/        # Event management
│   │   │   └── settings/      # Admin settings
│   │   └── api/               # API routes
│   │       └── events/        # Events CRUD endpoints
│   ├── components/            # React components
│   │   ├── Timeline/          # Interactive timeline
│   │   ├── Globe/             # 3D globe visualization
│   │   ├── DonutChart/        # Category statistics
│   │   ├── EventDetails/      # Event information display
│   │   ├── Search/            # Search and filters
│   │   └── DeepDive/          # Modal for rich content
│   ├── types/                 # TypeScript definitions
│   ├── constants/             # Configuration constants
│   ├── utils/                 # Utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Shared libraries
│   └── data/                  # Static data files
├── backend/                   # Express API server
│   └── src/
│       └── server.js          # API server entry point
├── prisma/
│   └── schema.prisma          # Database schema
├── docker-compose.yml         # Development environment
└── package.json               # Dependencies and scripts
```

## Core Components

### 1. Main Page (`src/app/page.tsx`)

The main application page orchestrates all components:

**State Management:**
- Event data loading and caching
- Filter states (categories, craft types, entities)
- Search functionality with debouncing
- Selected event tracking
- Favorites system (yellow/orange/red bookmarks)

**Key Features:**
- Responsive layout with absolute positioning
- Search bar with real-time filtering
- "Today in UFO History" feature
- Admin access controls

### 2. Timeline Component (`src/components/Timeline/Timeline.tsx`)

Interactive D3.js-powered timeline visualization:

**Implementation Details:**
- Horizontal timeline with zoom/pan (0.5x to 75x scale)
- Category-based Y-axis positioning
- Event rectangles with hover effects
- Real-time filtering integration
- Touch and mouse interaction support

**Key Features:**
- Matches original D3 implementation exactly
- Automatic initial zoom to 1940-1970 period
- Color-coded events by category
- Smooth zoom transitions with easing

### 3. Globe Component (`src/components/Globe/Globe.tsx`)

3D interactive globe with event mapping:

**Implementation Details:**
- D3.js orthographic projection
- Auto-rotation with pause on interaction
- Coordinate-based event plotting
- Real-time filter synchronization

**Features:**
- Touch/mouse rotation controls
- Hemisphere visibility calculations
- Category-based event filtering
- Automatic resume after interaction timeout

### 4. Event Details Panel

Comprehensive event information display:

**Data Fields (40+ fields):**
- Basic: title, date, time, location, coordinates
- Craft: type, size, behavior, color, sound, lights
- Witnesses: names, count, duration, weather
- Evidence: photos, videos, radar, physical effects
- Investigation: credibility, government involvement
- Rich content: detailed summaries, deep dive media

**Interactive Features:**
- Like/dislike rating system
- Deep dive modal for multimedia content
- Responsive grid layout

### 5. Search and Filtering System

Multi-layered filtering with real-time updates:

**Filter Types:**
- Text search across multiple fields
- Category toggles (10 categories)
- Craft type filters (16 types)
- Entity type filters (12 types)
- Favorites color filtering

**Implementation:**
- Debounced search (300ms delay)
- Set-based filter management
- Automatic component synchronization
- Search statistics display

## Data Architecture

### Event Data Structure (`src/types/event.ts`)

The UFOEvent interface defines the comprehensive data model:

```typescript
interface UFOEvent {
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
  
  // 30+ additional fields for craft, witnesses, evidence, etc.
  
  deep_dive_content?: DeepDiveContent;
  likes: number;
  dislikes: number;
}
```

### Database Schema (`prisma/schema.prisma`)

PostgreSQL database with Prisma ORM:

**Models:**
- **Event** - Core UFO event data with 40+ fields
- **User** - Authentication and user management
- **EventRating** - User like/dislike tracking
- **Favorite** - Color-coded bookmarking system

**Key Features:**
- Proper relational structure
- JSON support for deep dive content
- Cascading deletes for data integrity
- Indexed fields for performance

## API Architecture

### REST API Endpoints (`src/app/api/`)

Current API implementation in Next.js App Router:

```
GET    /api/events           # List all events with filters
GET    /api/events/[id]      # Get single event
POST   /api/events           # Create new event (admin)
PUT    /api/events/[id]      # Update event (admin)
DELETE /api/events/[id]      # Delete event (admin)
```

### External API Server (`backend/src/server.js`)

Separate Express.js server for production deployment:
- Health check endpoint
- CORS configuration
- Security middleware (Helmet)
- Error handling
- Rate limiting support

## State Management

### React Hooks Architecture

**Custom Hooks:**
- `useSearch()` - Search functionality with debouncing
- `useTodayInHistory()` - Today's featured events
- `useRating()` - Event rating system

**State Flow:**
1. Main page loads events via API
2. Filters are applied through custom hooks
3. Components receive filtered data via props
4. User interactions update state
5. All visualizations re-render automatically

### Data Flow Pattern

```
API Data → Main Component State → Custom Hooks → Component Props → D3 Visualizations
                    ↓
              User Interactions → State Updates → Re-render Cycle
```

## Styling System

### Tailwind CSS Configuration

**Theme Configuration:**
- Custom UFO-themed color palette
- CSS variables for dynamic theming
- Responsive breakpoints
- Custom component classes

**Key Style Features:**
- Dark theme optimized for UFO content
- Neon cyan/purple/pink accent colors
- Smooth transitions and hover effects
- Responsive design for all screen sizes

### Component-Specific Styling

- **Timeline**: Black background with cyan borders
- **Globe**: Radial gradient background
- **Event Details**: Semi-transparent overlay with pink border
- **Filters**: Color-coded toggle buttons

## Performance Optimizations

### React Optimizations
- `useMemo()` for expensive calculations
- `useCallback()` for event handlers
- Debounced search to prevent excessive API calls
- Component-level state isolation

### D3.js Optimizations
- Efficient data binding with enter/update/exit pattern
- SVG element reuse where possible
- Smooth transitions with easing functions
- Event delegation for interaction handling

## Security Features

### Authentication System
- JWT-based authentication
- Protected admin routes
- Password hashing with bcryptjs
- Role-based access control (USER/ADMIN)

### API Security
- CORS configuration
- Request validation
- SQL injection prevention via Prisma
- XSS protection through React

## Development Workflow

### Scripts
```json
{
  "dev": "next dev --turbopack",
  "build": "next build --turbopack", 
  "start": "next start",
  "lint": "eslint"
}
```

### Environment Configuration
- Development: Hot reloading with Turbopack
- Production: Optimized builds with static generation
- Docker: Containerized development environment

## Admin System

### Admin Dashboard (`src/app/admin/`)
- Event management CRUD interface
- User authentication system
- Settings configuration
- Role-based access control

### Admin Features
- Create/edit/delete events
- Upload multimedia content
- User management
- System configuration

## Integration Points

### External Services
- Patreon integration (planned)
- PayPal donation system (in original)
- Google Analytics (configured)
- File upload system for media

### API Compatibility
- RESTful design for easy integration
- JSON response format
- Proper HTTP status codes
- Error handling with consistent format

## Deployment Architecture

### Docker Configuration
- Multi-service setup with docker-compose
- Frontend container (Node.js)
- Backend API container
- PostgreSQL database container
- Redis caching container
- Nginx reverse proxy

### Production Considerations
- Environment variable management
- SSL/TLS termination at nginx
- Database backup strategies
- Log aggregation and monitoring

## Future Architecture Plans

### Scalability
- API rate limiting
- Database query optimization
- CDN integration for static assets
- Horizontal scaling with load balancers

### Features
- Real-time updates with WebSockets
- Mobile app with React Native
- Advanced search with Elasticsearch
- ML-powered event recommendations
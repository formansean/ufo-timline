# UFO Timeline Architecture Overview

## System Overview

The UFO Timeline is a modern web application built with Next.js 15 and React 19, providing an interactive visualization platform for UFO event data. The application features a comprehensive timeline, 3D globe visualization, advanced search/filtering capabilities, and an admin dashboard.

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router architecture
- **React 19.1.0**: Core UI library with latest features
- **TypeScript 5**: Full type safety across the application
- **Tailwind CSS 4**: Utility-first CSS framework for styling
- **D3.js 7.9.0**: Data visualization library for Timeline and Globe components

### Backend
- **Next.js API Routes**: RESTful API endpoints built into the framework
- **JWT Authentication**: Token-based authentication system
- **bcrypt**: Password hashing for security
- **File-based Storage**: JSON file storage for user data (development)

### Database
- **PostgreSQL**: Primary database (configured but not yet fully integrated)
- **Prisma ORM**: Database toolkit and query builder (configured)
- **JSON Data**: Current events stored in TypeScript data files

### DevOps & Deployment
- **Docker**: Containerization with multi-stage builds
- **Docker Compose**: Orchestration for development and production
- **Nginx**: Reverse proxy configuration (configured)
- **Environment Configuration**: Separate dev/prod configurations

## Core Architecture Patterns

### App Router Structure
```
src/app/
├── page.tsx                 # Main timeline application
├── layout.tsx              # Root layout with fonts and global styles
├── globals.css             # Global Tailwind CSS styles
├── admin/                  # Admin interface routes
│   ├── page.tsx           # Admin dashboard
│   ├── login/page.tsx     # Admin authentication
│   └── events/page.tsx    # Event management interface
└── api/                   # API routes
    ├── events/            # Public event endpoints
    ├── admin/             # Protected admin endpoints
    ├── auth/              # Authentication endpoints
    └── health/            # Health check endpoint
```

### Component Architecture
```
src/components/
├── Timeline/              # D3.js interactive timeline
├── Globe/                 # 3D orthographic projection globe
├── EventDetails/          # Event information display
├── Search/                # Search and filtering interface
├── DonutChart/            # Category statistics visualization
└── DeepDive/              # Modal for rich multimedia content
```

### Data Flow Architecture

1. **Event Data**: Stored in `src/data/comprehensiveEvents.ts`
2. **API Layer**: Next.js route handlers process requests
3. **Component State**: React state management with hooks
4. **Visualization**: D3.js components render data
5. **User Interaction**: Events trigger state updates and re-renders

## Design Patterns

### Component Communication
- **Props Down**: Data flows down through component props
- **Callbacks Up**: Events bubble up through callback functions
- **State Co-location**: State managed at appropriate component levels
- **Custom Hooks**: Reusable logic in `src/hooks/`

### Data Management
- **Static Data**: Event data imported from TypeScript files
- **API Integration**: RESTful endpoints with proper HTTP methods
- **Error Handling**: Try-catch blocks with appropriate error responses
- **Type Safety**: Full TypeScript coverage with strict configurations

### Security Patterns
- **JWT Tokens**: HTTP-only cookies for token storage
- **Route Protection**: Middleware-based authentication checks
- **Password Hashing**: bcrypt with proper salt rounds
- **CORS**: Proper cross-origin resource sharing configuration

## Performance Optimizations

### Frontend Optimizations
- **React 19 Features**: Latest React optimizations and concurrent features
- **D3.js Efficiency**: Optimized rendering with proper data binding
- **Component Memoization**: Strategic use of React.memo and useMemo
- **Code Splitting**: Next.js automatic route-based code splitting

### Build Optimizations
- **Turbopack**: Next.js Turbopack for faster builds
- **TypeScript**: Compile-time optimizations with strict mode
- **ESLint**: Code quality enforcement with custom rules
- **Tree Shaking**: Automatic dead code elimination

## Deployment Architecture

### Docker Configuration
- **Multi-stage Builds**: Separate development and production images
- **Volume Mounts**: Hot reload support in development
- **Health Checks**: Container health monitoring
- **Network Isolation**: Separate Docker networks for services

### Service Architecture
```
Production Stack:
├── Next.js App (Port 3000)
├── PostgreSQL Database (Port 5432)
├── pgAdmin (Port 8080)
└── Nginx Reverse Proxy (Port 80/443)
```

## Data Models

### Core Event Schema
The UFO event data model contains 40+ fields organized into categories:
- **Basic Information**: title, date, location, coordinates
- **Craft Characteristics**: type, size, behavior, visual properties
- **Witness Data**: eyewitness accounts, duration, weather conditions
- **Evidence**: photos, videos, radar data
- **Entity Information**: close encounter classifications
- **Investigation**: credibility ratings, government involvement

### Type Definitions
- `UFOEvent`: Core event interface with all fields
- `EventCategory`: Enumerated event categories
- `CraftType`: Standardized craft classifications
- `EntityType`: Entity/being classifications
- `User`: Authentication and authorization data

## Integration Points

### External Dependencies
- **D3.js**: Geographic data for globe projection
- **Font System**: Google Fonts (Geist Sans/Mono) integration
- **Environment Variables**: Configuration management
- **Docker Registry**: Container image management

### API Boundaries
- **Public Endpoints**: Event data retrieval with filtering
- **Protected Endpoints**: Admin operations with JWT verification
- **Authentication Flow**: Login/logout with token management
- **Health Monitoring**: System status and diagnostics

This architecture provides a solid foundation for the UFO Timeline application with clear separation of concerns, type safety, and modern development patterns.
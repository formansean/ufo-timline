# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Scripts
```bash
npm run dev                 # Start development server with Turbopack
npm run build              # Production build with Turbopack  
npm run build:strict       # Build with zero ESLint warnings (fails on warnings)
npm run lint               # Run ESLint
npm run lint:fix           # Fix auto-fixable ESLint issues
npm run type-check         # TypeScript type checking (no emit)
```

### Database Operations

The application now uses **PostgreSQL for all environments** (both local development via Docker and production).

**Docker Development (Recommended)**
```bash
./deploy.sh dev            # Start PostgreSQL database + app in Docker
./deploy.sh stop           # Stop all services
./deploy.sh logs           # View logs
./deploy.sh status         # Check service status
```

**Local Prisma Commands (for development)**
Use the wrapper script for local development with Docker PostgreSQL:
```bash
./prisma.sh generate       # Generate Prisma client after schema changes
./prisma.sh db push        # Push schema changes to database  
./prisma.sh studio         # Open Prisma Studio for database management
./prisma.sh migrate dev    # Create and apply migrations (development)
```

**Manual Environment Loading (if needed)**
```bash
source .env && npx prisma generate
source .env && npx prisma db push
source .env && npx prisma studio
source .env && npx prisma migrate dev
```

**Database Configuration**
- **Development**: PostgreSQL via Docker (localhost:5433)
- **Production**: PostgreSQL via Docker Compose (internal network)
- **Legacy SQLite support**: Commented out in environment files

### Docker Development
```bash
docker-compose up -d       # Start all services (app, database, pgAdmin)
./dev-docker.sh            # Development mode with hot reload
./prod-docker.sh           # Production mode build and run
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM (all environments)
- **Authentication**: JWT-based with middleware protection
- **Visualization**: D3.js for Timeline and Globe components
- **Containerization**: Docker with multi-stage builds

### Database Schema
The application uses Prisma with comprehensive UFO event tracking:
- **Events**: 40+ fields including location, craft characteristics, witness info, evidence
- **Users**: Admin/user roles with JWT authentication
- **EventRating**: Like/dislike system
- **Favorite**: Color-coded bookmarking (yellow/orange/red)

### Key Components

#### Timeline Component (`src/components/Timeline/Timeline.tsx`)
- D3.js horizontal timeline with zoom/pan functionality (0.5x to 75x scale)
- Category-based Y-axis positioning with event rectangles
- Mouse wheel and touch zoom support
- Auto-focuses on 1940-1970 period on initial load

#### Globe Component (`src/components/Globe/Globe.tsx`) 
- D3.js orthographic projection with auto-rotation
- Event point mapping using coordinates
- Touch/mouse controls for rotation and interaction
- Pauses rotation on user interaction

#### Authentication System
- JWT tokens stored in HTTP-only cookies
- Middleware protection for `/admin` and `/api/admin` routes
- Role-based access (USER/ADMIN) with React context

### API Structure
- `/api/events` - Public event data endpoints
- `/api/admin/*` - Protected admin endpoints (require authentication)
- `/api/auth/*` - Authentication endpoints (login/logout/me)

### Deep Dive Content
Events support rich multimedia content stored as JSON in `deepDiveContent` field:
- Videos, images, reports, news articles
- Tabbed interface in EventDetails component

## Important Patterns

### Database Queries
Always use Prisma client for database operations. Import from `@prisma/client` and use proper error handling.

### Authentication Checks
Use the `useAuth()` hook for client-side authentication state. For API routes requiring auth, tokens are automatically validated by middleware.

### Event Data Format
Events maintain compatibility with original WordPress implementation:
- Date field stored as string (e.g., "November 17, 1986")
- Coordinates as strings for latitude/longitude
- All craft/entity characteristics as optional string fields

### Component State Management
Timeline and Globe components sync with SearchAndFilters via prop callbacks. No external state management library is used.

### Docker Configuration
Development uses volume mounts for hot reload. Production builds standalone Next.js output optimized for containers.

## Environment Variables Required

**For Docker Development**
```env
DATABASE_URL="postgresql://ufo_user:ufo_password@localhost:5433/ufo_timeline"
POSTGRES_PASSWORD="ufo_password"
JWT_SECRET="your-jwt-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**For Production**
```env
DATABASE_URL="postgresql://ufo_user:${POSTGRES_PASSWORD}@database:5432/ufo_timeline"
POSTGRES_PASSWORD="secure-production-password" 
JWT_SECRET="secure-production-jwt-secret"
NEXTAUTH_SECRET="secure-production-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

**Legacy SQLite Configuration (commented out)**
```env
# DATABASE_URL="file:./prisma/dev.db"
```

## Docker Deployment Troubleshooting

**Common Issues:**

1. **Port Conflicts**: Use `./deploy.sh dev --force` to automatically kill conflicting processes
2. **Database Connection Issues**: 
   - Ensure PostgreSQL container is healthy: `docker-compose -p ufo-timeline ps`
   - Check database logs: `docker-compose -p ufo-timeline logs database`
3. **Prisma Schema Issues**: 
   - Schema is now PostgreSQL-only with JSONB optimization
   - Use `./prisma.sh generate` after schema changes
4. **Environment Variable Issues**:
   - All environment variables are now centralized in `.env` files
   - Docker compose automatically loads environment variables

**Deployment Commands:**
```bash
./deploy.sh dev             # Development with hot reload
./deploy.sh prod            # Production deployment  
./deploy.sh clean           # Full cleanup including volumes
./deploy.sh logs            # View all service logs
./deploy.sh status          # Check service health
```

**Database Access:**
- **pgAdmin**: http://localhost:8080 (admin@ufo.local / admin)
- **Direct Connection**: localhost:5433 (development) or localhost:5432 (production)
- **Prisma Studio**: `./prisma.sh studio` (connects to Docker PostgreSQL)
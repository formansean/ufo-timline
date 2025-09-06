# UFO Timeline Project Structure

## Directory Overview

```
/home/sean/Desktop/The Lab/ufoTimeline/
├── @info/                          # Comprehensive technical documentation
├── backend/                        # Legacy backend components
├── info/                          # Original analysis documentation  
├── nginx/                         # Nginx reverse proxy configuration
├── oldCode/                       # Archived legacy implementation
├── public/                        # Static assets and favicon
├── src/                           # Source code directory
└── [config files]                # Root configuration files
```

## Source Code Structure (`src/`)

### Application Routes (`src/app/`)
```
src/app/
├── page.tsx                       # Main application entry point
├── layout.tsx                     # Root layout with fonts and styling
├── globals.css                    # Global Tailwind CSS configuration
├── admin/                         # Admin interface routes
│   ├── page.tsx                  # Admin dashboard
│   ├── login/page.tsx            # Admin authentication page
│   └── events/page.tsx           # Event management interface
└── api/                          # Next.js API routes
    ├── events/                   # Public event operations
    │   ├── route.ts             # GET/POST events
    │   └── [id]/route.ts        # GET/PUT/DELETE single event
    ├── admin/                    # Protected admin operations  
    │   └── events/              # Admin event management
    │       ├── route.ts         # Admin event operations
    │       └── [id]/route.ts    # Admin single event operations
    ├── auth/                     # Authentication system
    │   ├── login/route.ts       # User login endpoint
    │   ├── logout/route.ts      # User logout endpoint
    │   └── me/route.ts          # Current user info
    └── health/route.ts          # System health check
```

### React Components (`src/components/`)
```
src/components/
├── Timeline/
│   └── Timeline.tsx             # D3.js horizontal timeline visualization
├── Globe/
│   └── Globe.tsx                # 3D orthographic projection globe
├── EventDetails/
│   └── EventDetails.tsx         # Event information display panel
├── Search/
│   └── SearchAndFilters.tsx     # Search and filtering interface
├── DonutChart/
│   └── DonutChart.tsx           # Category statistics visualization
└── DeepDive/
    └── DeepDiveModal.tsx        # Modal for rich multimedia content
```

### Data Layer (`src/data/`)
```
src/data/
├── comprehensiveEvents.ts       # Main UFO events dataset
└── users.json                  # User authentication data
```

### Type Definitions (`src/types/`)
```
src/types/
├── event.ts                     # UFO event interfaces and types
└── user.ts                     # User authentication types
```

### Utility Functions (`src/utils/`)
```
src/utils/
└── eventProcessing.ts          # Date parsing and event processing
```

### Custom Hooks (`src/hooks/`)
```
src/hooks/
├── useAuth.tsx                 # Authentication state management
├── useRating.ts                # Event rating functionality  
├── useSearch.ts                # Search state management
└── useTodayInHistory.ts        # Today in UFO History feature
```

### Core Libraries (`src/lib/`)
```
src/lib/
├── api.ts                      # API client utilities
└── auth.ts                     # Authentication utilities
```

### Constants (`src/constants/`)
```
src/constants/
└── categories.ts               # Event categories, craft types, colors
```

## Configuration Files

### Build & Development
```
├── package.json                # Dependencies and build scripts
├── package-lock.json          # Lockfile for consistent builds
├── tsconfig.json              # TypeScript configuration
├── tsconfig.tsbuildinfo       # TypeScript build cache
├── next.config.ts             # Next.js configuration
├── eslint.config.mjs          # ESLint linting rules
├── postcss.config.mjs         # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS configuration (if exists)
└── next-env.d.ts             # Next.js environment types
```

### Environment & Deployment
```
├── .env                       # Environment variables (development)
├── .env.local                # Local environment overrides
├── Dockerfile                # Docker image configuration
├── docker-compose.yml        # Development services orchestration
├── docker-compose.prod.yml   # Production services orchestration
├── .dockerignore            # Docker build exclusions
├── deploy.sh                # Deployment automation script
├── dev-docker.sh           # Development Docker script
├── dev-local.sh            # Local development script
├── prod-docker.sh          # Production Docker script
└── test-docker-build.sh    # Docker build testing
```

### Version Control & Documentation
```
├── .git/                     # Git repository data
├── .gitignore               # Git exclusions
├── README.md                # Project overview and setup
├── CLAUDE.md               # Claude Code development instructions
├── DOCKER.md               # Docker-specific documentation
├── "Docker Image Rebuild Options.md"  # Docker troubleshooting
├── cookies.txt             # Development cookies/session data
└── test-upload.json        # Test data for uploads
```

## File Responsibilities

### Core Application Files
- **`src/app/page.tsx`**: Main application component, renders Timeline, Globe, and search interface
- **`src/app/layout.tsx`**: Root layout with font loading and global HTML structure
- **`src/app/globals.css`**: Tailwind CSS imports and custom global styles
- **`src/middleware.ts`**: Next.js middleware (currently minimal implementation)

### Component Architecture
- **Timeline Component**: Interactive D3.js timeline with zoom/pan, category positioning
- **Globe Component**: 3D visualization with event mapping and rotation controls
- **EventDetails**: Comprehensive event data display with tabbed interface
- **SearchAndFilters**: Multi-field search with category/type filtering
- **DonutChart**: Statistical visualization of event categories
- **DeepDiveModal**: Rich media content display (videos, images, reports)

### API Architecture  
- **Public API**: `/api/events/*` - Open event data access with filtering
- **Admin API**: `/api/admin/*` - Protected event management operations
- **Auth API**: `/api/auth/*` - User authentication and session management
- **Health API**: `/api/health` - System status monitoring

### Data Management
- **Event Data**: Comprehensive UFO event records with 40+ fields
- **User Data**: Authentication credentials and session management
- **Type Definitions**: Full TypeScript coverage for data structures
- **Processing Utilities**: Date parsing, filtering, and data transformation

### Build System
- **Next.js Config**: Turbopack integration, build optimizations
- **TypeScript**: Strict mode configuration with comprehensive types
- **ESLint**: Code quality rules with Next.js best practices
- **Docker**: Multi-stage builds with development/production variants

## Development Workflow Files

### Scripts (`package.json`)
- **`npm run dev`**: Start development server with Turbopack
- **`npm run build`**: Production build
- **`npm run build:strict`**: Build with zero ESLint warnings
- **`npm run lint`**: Run ESLint checks
- **`npm run type-check`**: TypeScript type checking

### Docker Scripts
- **`./deploy.sh dev`**: Start development environment
- **`./deploy.sh prod`**: Deploy production environment  
- **`./deploy.sh clean`**: Full cleanup of containers and volumes
- **`./dev-docker.sh`**: Development with hot reload
- **`./prod-docker.sh`**: Production deployment

This structure provides clear separation of concerns with modern development practices, comprehensive type safety, and efficient build processes.
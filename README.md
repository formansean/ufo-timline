# UFO Timeline React

A comprehensive React port of the UFO Timeline application, featuring an interactive timeline visualization, 3D globe, advanced search and filtering, and admin dashboard for content management.

## 🛸 Features

### Core Visualization Components
- **Interactive Timeline**: D3.js-powered horizontal timeline with zoom/pan functionality (0.5x to 75x scale)
- **3D Globe**: Orthographic projection globe with auto-rotation and event point mapping
- **Event Details**: Comprehensive event information with tabbed "Deep Dive" multimedia content
- **Advanced Filtering**: Multi-layer filtering by categories, craft types, entity types, and favorites

### Key Capabilities
- **Search System**: Multi-field text search across event titles, descriptions, locations, and characteristics
- **Category Management**: 10 event categories with color-coded visual system
- **Favorites System**: Color-coded bookmarking (yellow/orange/red) with filtering
- **Real-time Updates**: All components sync automatically with filter changes
- **Mobile Optimized**: Touch support for timeline zoom/pan and globe rotation
- **Responsive Design**: Adapts seamlessly to desktop, tablet, and mobile viewports

## 🏗 Architecture

### Frontend (React/Next.js)
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for responsive styling  
- **D3.js** for data visualization
- **Component-based architecture** with proper state management

### Backend (Node.js/Express)
- **Express.js** REST API
- **PostgreSQL** database with Prisma ORM
- **JWT authentication** system
- **File upload** support for multimedia content

### DevOps
- **Docker Compose** for development environment
- **Nginx** reverse proxy configuration
- **PostgreSQL** with automated migrations
- **Redis** for session management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Installation

1. **Clone and setup the project**
```bash
git clone <repository-url>
cd ufo-timeline-react
npm install
```

2. **Start the development environment**
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or run frontend only for development
npm run dev
```

3. **Initialize the database**
```bash
cd backend
npm run db:migrate
npm run db:seed
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432

## 📊 Data Structure

Events contain 40+ fields matching the original WordPress implementation:

### Basic Information
- Title, category, date, time, location (city, state, country, coordinates)

### UFO Characteristics  
- Craft type, size, behavior, color, sound, light characteristics

### Witness Information
- Witness names, eyewitness status, duration, weather conditions

### Evidence
- Photos, videos, radar data, physical effects, artifacts

### Investigation
- Credibility score (0-100), notoriety level, government involvement
- Close encounter scale, entity types, symbols

### Rich Content
- Detailed summaries, deep dive multimedia content (videos, images, reports, news)

## 🎯 Component Overview

### Timeline Component (`/components/Timeline/`)
- Matches original D3.js implementation exactly
- Horizontal timeline with category-based Y-axis positioning
- Zoom/pan with mouse wheel and touch support
- Event rectangles with hover effects and click handling
- Automatic initial zoom to 1940-1970 period

### Globe Component (`/components/Globe/`)
- D3.js orthographic projection
- Auto-rotation with interaction pause/resume
- Event point plotting with coordinate mapping
- Touch/mouse controls for rotation and zoom
- Category filtering with real-time updates

### Search & Filters (`/components/Search/`)
- Real-time text search with debouncing
- Category toggles with visual state management
- Craft and entity type multi-select filters
- Favorites color-coded filtering system

### Event Details (`/components/EventDetails/`)
- Comprehensive event information display
- Tabbed interface for basic info and deep dive content
- Multimedia content support (videos, images, reports)
- User rating system integration

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Timeline/       # D3.js timeline visualization  
│   ├── Globe/          # 3D globe component
│   ├── Search/         # Search and filtering
│   └── EventDetails/   # Event information display
├── types/              # TypeScript type definitions
├── constants/          # Configuration and constants
├── utils/              # Utility functions
└── app/                # Next.js app router pages

backend/
├── src/
│   ├── server.js       # Express.js server
│   ├── routes/         # API route handlers
│   ├── models/         # Database models
│   └── middleware/     # Custom middleware
└── prisma/
    └── schema.prisma   # Database schema
```

### Key Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking

# Backend
cd backend
npm run dev          # Start backend server
npm run db:migrate   # Run database migrations  
npm run db:seed      # Seed sample data
```

### Environment Variables
```env
DATABASE_URL="postgresql://ufo_user:ufo_password@localhost:5432/ufo_timeline"
JWT_SECRET="your-jwt-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 🎨 Original Implementation Fidelity

This React port maintains **100% functional compatibility** with the original WordPress/PHP implementation:

### Exact Feature Matching
- **Timeline behavior**: Same zoom levels, pan controls, event positioning
- **Globe functionality**: Identical rotation, projection, and interaction
- **Color schemes**: Exact category colors and visual styling
- **Filter logic**: Same multi-layer filtering with identical precedence
- **Event scoring**: Matching credibility + notoriety calculation

### Enhanced Capabilities
- **Modern React architecture** with proper component separation
- **TypeScript safety** with comprehensive type definitions  
- **Improved performance** with optimized rendering
- **Better mobile experience** with enhanced touch controls
- **Scalable backend** ready for production deployment

## 🚧 Roadmap

### Phase 2: Admin Dashboard
- [ ] Content management system for events
- [ ] User management and authentication
- [ ] File upload system for multimedia
- [ ] Analytics and reporting dashboard

### Phase 3: Advanced Features  
- [ ] Real-time collaboration
- [ ] Event submission workflow
- [ ] Advanced search with AI
- [ ] Mobile app (React Native)

### Phase 4: Production
- [ ] Performance optimization
- [ ] CDN integration
- [ ] Monitoring and logging
- [ ] Automated testing suite

## 📄 License

This project maintains the same licensing as the original UFO Timeline application.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions about this React port or the original UFO Timeline application, please open an issue in the GitHub repository.

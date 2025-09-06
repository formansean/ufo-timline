# UFO Timeline Technical Documentation

## Overview

This directory contains comprehensive technical documentation for the UFO Timeline application - a modern React/Next.js application for visualizing and exploring UFO event data through interactive timeline and globe visualizations.

## Documentation Structure

### 📋 Core Architecture
- **[Architecture Overview](./architecture.md)** - System architecture, technology stack, and design patterns
- **[Project Structure](./project-structure.md)** - Directory organization, file responsibilities, and code organization

### ⚛️ Frontend Development  
- **[Components Overview](./components-overview.md)** - Complete React component documentation with props and usage
- **[Data Visualization](./data-visualization.md)** - D3.js Timeline and Globe implementation details

### 🔧 Backend Development
- **[API Reference](./api-reference.md)** - REST API endpoints, authentication, request/response schemas
- **[Database Schema](./database-schema.md)** - Data models, relationships, and storage architecture

### 🔒 Security & Authentication
- **[Security & Authentication](./security-authentication.md)** - JWT system, password security, and authorization

### 🚀 DevOps & Deployment
- **[Docker Deployment](./docker-deployment.md)** - Container setup, multi-environment deployment
- **[Development Workflow](./development-workflow.md)** - Build processes, scripts, and development setup

### 🛠️ Support & Maintenance
- **[Troubleshooting & FAQ](./troubleshooting-faq.md)** - Common issues, debugging strategies, frequently asked questions

## Quick Navigation

### For New Developers
1. Start with [Architecture Overview](./architecture.md) to understand the system
2. Review [Project Structure](./project-structure.md) to navigate the codebase
3. Set up development environment with [Development Workflow](./development-workflow.md)
4. Deploy locally using [Docker Deployment](./docker-deployment.md)

### For Frontend Development
1. [Components Overview](./components-overview.md) - React component architecture
2. [Data Visualization](./data-visualization.md) - D3.js Timeline and Globe components
3. [API Reference](./api-reference.md) - Backend integration patterns

### For Backend Development  
1. [API Reference](./api-reference.md) - REST endpoint implementation
2. [Database Schema](./database-schema.md) - Data models and storage
3. [Security & Authentication](./security-authentication.md) - JWT and user management

### For DevOps & Deployment
1. [Docker Deployment](./docker-deployment.md) - Container orchestration
2. [Development Workflow](./development-workflow.md) - Build and deployment scripts
3. [Security & Authentication](./security-authentication.md) - Production security considerations

### For Support & Debugging
1. [Troubleshooting & FAQ](./troubleshooting-faq.md) - Common issues and solutions
2. [Architecture Overview](./architecture.md) - System understanding for debugging
3. [Docker Deployment](./docker-deployment.md) - Container debugging strategies

## Technology Stack Summary

### Frontend
- **Next.js 15** - React framework with App Router and Turbopack
- **React 19** - UI library with concurrent features
- **TypeScript 5** - Full type safety
- **Tailwind CSS 4** - Utility-first styling
- **D3.js 7.9** - Data visualization

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **JWT** - Authentication system
- **bcrypt** - Password hashing
- **PostgreSQL** - Database (planned)
- **File Storage** - Current data storage

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration
- **Nginx** - Reverse proxy (production)
- **Multi-stage builds** - Optimized containers

## Key Features Documented

### Interactive Visualizations
- **Timeline Component**: Horizontal timeline with zoom/pan (0.5x to 75x scale)
- **Globe Component**: 3D orthographic projection with auto-rotation
- **Event Details**: Comprehensive data display with multimedia content
- **Search & Filtering**: Multi-layer filtering system

### Data Management
- **UFO Events**: 40+ field comprehensive event schema
- **Categories**: 10 event categories with color coding
- **Craft Types**: 16 classified craft types
- **Entity Types**: 11 entity/being classifications

### Security Features
- **JWT Authentication**: HTTP-only cookie storage
- **Password Security**: bcrypt hashing
- **Role-based Access**: Admin/user authorization
- **API Protection**: Secured admin endpoints

### Development Features
- **Hot Reload**: Development server with instant updates
- **Type Safety**: Complete TypeScript coverage
- **Code Quality**: ESLint and strict build processes
- **Container Support**: Docker development and production

## Application Overview

The UFO Timeline application provides an interactive platform for exploring UFO event data spanning from 1940 to 2024. Key capabilities include:

**Timeline Visualization**:
- Horizontal timeline with category-based positioning
- Zoom functionality from decades to individual years
- Interactive event selection and details
- Category filtering and search capabilities

**Globe Visualization**:
- 3D Earth projection showing event locations
- Auto-rotation with user interaction pause
- Coordinate-based event mapping
- Touch and mouse controls

**Data Management**:
- Comprehensive UFO event database
- Rich multimedia content support
- Admin interface for data management
- User authentication and authorization

**Technical Excellence**:
- Modern React/TypeScript architecture
- D3.js powered visualizations
- Docker-based deployment
- Comprehensive security implementation

## Documentation Standards

All documentation follows consistent standards:
- **Code Examples**: Working, tested code snippets
- **Type Definitions**: Complete TypeScript interfaces
- **Configuration**: Environment and setup details
- **Troubleshooting**: Common issues and solutions
- **Best Practices**: Recommended approaches and patterns

## Contributing to Documentation

When updating documentation:
1. Follow the established structure and format
2. Include working code examples
3. Update relevant cross-references
4. Test all code snippets
5. Maintain consistency with existing documentation

## Support

For technical support or documentation questions:
1. Check [Troubleshooting & FAQ](./troubleshooting-faq.md) first
2. Review relevant technical documentation
3. Examine application logs and error messages
4. Use debugging strategies provided in documentation

This documentation system provides complete technical coverage for developing, deploying, and maintaining the UFO Timeline application.
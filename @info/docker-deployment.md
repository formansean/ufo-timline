# Docker Deployment Documentation

## Overview

The UFO Timeline application uses Docker for containerized deployment with multi-stage builds, PostgreSQL database, and comprehensive development/production environments.

## Architecture

### Multi-Environment Setup
- **Development**: Hot reload with volume mounts and pgAdmin
- **Production**: Optimized builds with Nginx reverse proxy
- **Database**: PostgreSQL 15 Alpine with persistent volumes
- **Network**: Isolated Docker network for service communication

## Docker Configuration Files

### Dockerfile (Multi-Stage Build)

**Stage 1: Base Dependencies**
```dockerfile
FROM node:18-alpine AS base
```

**Stage 2: Dependencies Installation**
```dockerfile
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile
```

**Stage 3: Development Environment**
```dockerfile
FROM deps AS development
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

**Stage 4: Production Builder**
```dockerfile
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
# Copy source files and build configurations
RUN npm run build:docker
```

**Stage 5: Production Runner**
```dockerfile
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Optimized standalone build with minimal dependencies
CMD ["node", "server.js"]
```

### Docker Compose Development (`docker-compose.yml`)

**Application Service**:
```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://ufo_user:${POSTGRES_PASSWORD:-ufo_password}@database:5432/ufo_timeline
      - JWT_SECRET=${JWT_SECRET:-dev_jwt_secret_key}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-dev_nextauth_secret}
    volumes:
      - .:/app                    # Hot reload
      - /app/node_modules         # Preserve node_modules
      - /app/.next                # Preserve build cache
    depends_on:
      database:
        condition: service_healthy
```

**Database Service**:
```yaml
  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ufo_timeline
      - POSTGRES_USER=ufo_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-ufo_password}
    ports:
      - "5433:5432"               # Development port to avoid conflicts
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ufo_user -d ufo_timeline"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**pgAdmin Service** (Development Only):
```yaml
  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@ufo.local
      - PGADMIN_DEFAULT_PASSWORD=admin
    ports:
      - "8080:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
```

### Docker Compose Production (`docker-compose.prod.yml`)

**Application Service**:
```yaml
  app:
    build:
      target: runner              # Production optimized build
      args:
        BUILD_DATABASE_URL: postgresql://ufo_user:${POSTGRES_PASSWORD}@database:5432/ufo_timeline
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://ufo_user:${POSTGRES_PASSWORD}@database:5432/ufo_timeline
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_SECRET=${JWT_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Nginx Reverse Proxy**:
```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
```

## Deployment Script (`deploy.sh`)

### Command Usage
```bash
./deploy.sh [command] [options]
```

### Available Commands

**Development Deployment**:
```bash
./deploy.sh dev [--force]
```
- Starts development environment with hot reload
- Includes pgAdmin for database management
- Uses development port 5433 for PostgreSQL
- Optional `--force` flag kills conflicting processes

**Production Deployment**:
```bash
./deploy.sh prod [--force]
```
- Builds optimized production images
- Includes Nginx reverse proxy
- Uses production environment variables
- SSL support ready

**Cleanup Operations**:
```bash
./deploy.sh clean [--volumes]
```
- Removes all containers and images
- Optional `--volumes` flag removes persistent data
- Reclaims Docker disk space

**Status and Logs**:
```bash
./deploy.sh status          # Show container status
./deploy.sh logs [service]  # View service logs
```

### Script Features

**Intelligent Port Management**:
- Automatically detects processes using required ports
- Differentiates between Docker, Node.js, and other processes
- Safe process termination with user confirmation
- Force mode for automated deployment

**Container Lifecycle Management**:
- Graceful container shutdown with timeout
- Orphan container cleanup
- Image optimization and cache management
- Volume persistence with backup options

**Health Monitoring**:
- Database connection health checks
- Application API health endpoints
- Service dependency management
- Automatic restart policies

## Environment Configuration

### Development Environment (`.env`)
```env
# Database Configuration
DATABASE_URL="postgresql://ufo_user:ufo_password@localhost:5433/ufo_timeline"

# Application Secrets
JWT_SECRET="your-super-secret-jwt-key-for-development"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXT_PUBLIC_API_URL="http://localhost:3003"

# Docker PostgreSQL Configuration
POSTGRES_PASSWORD="ufo_password"
```

### Production Environment Variables
```env
# Database (Internal Docker Network)
DATABASE_URL="postgresql://ufo_user:${POSTGRES_PASSWORD}@database:5432/ufo_timeline"

# Secrets (Set in production)
JWT_SECRET="${SECURE_JWT_SECRET}"
NEXTAUTH_SECRET="${SECURE_NEXTAUTH_SECRET}"
NEXTAUTH_URL="https://yourdomain.com"

# Database Password (Set in production)
POSTGRES_PASSWORD="${SECURE_DB_PASSWORD}"
```

## Network Architecture

### Development Network
```
Host Machine
├── Port 3000 → App Service (Hot Reload)
├── Port 5433 → PostgreSQL (Development)
├── Port 8080 → pgAdmin (Database Management)
└── Internal Network (ufo-network)
    ├── app ↔ database
    └── pgadmin ↔ database
```

### Production Network
```
Host Machine
├── Port 80/443 → Nginx (Reverse Proxy)
└── Internal Network (ufo-network)
    ├── nginx → app:3000
    ├── app ↔ database:5432
    └── Health Checks
```

## Volume Management

### Development Volumes
```yaml
volumes:
  postgres_dev_data:        # Database persistence
    driver: local
  pgadmin_data:            # pgAdmin settings
    driver: local
```

### Bind Mounts (Development)
```yaml
volumes:
  - .:/app                 # Source code hot reload
  - /app/node_modules      # Preserve dependencies
  - /app/.next             # Next.js build cache
```

### Production Volumes
```yaml
volumes:
  postgres_data:           # Production database
    driver: local
```

## Docker Ignore Configuration (`.dockerignore`)

**Excluded from Build Context**:
```dockerignore
# Dependencies
node_modules
npm-debug.log*

# Next.js build artifacts
.next/
out/

# Development files
.env*
README.md
*.md

# Docker files themselves
Dockerfile*
docker-compose*.yml

# Development tools
.vscode/
.idea/
*.test.*
cypress/

# Git and CI/CD
.git
.github/

# OS and editor files
.DS_Store
Thumbs.db
*.swp
```

## Build Optimization

### Multi-Stage Benefits
1. **Dependency Isolation**: Separate dependency installation stage
2. **Build Caching**: Efficient layer caching for dependencies
3. **Size Optimization**: Production images exclude dev dependencies
4. **Security**: Runtime images contain minimal attack surface

### Next.js Optimizations
- **Turbopack**: Faster builds with `npm run build:docker`
- **Standalone Output**: Self-contained production builds
- **Static Asset Optimization**: Efficient asset serving
- **Tree Shaking**: Automatic dead code elimination

### Alpine Linux Benefits
- **Minimal Size**: 5MB base image vs 100MB+ standard images
- **Security**: Reduced attack surface with minimal packages
- **Performance**: Faster container startup times
- **Compatibility**: `libc6-compat` for Node.js compatibility

## Health Checks and Monitoring

### Database Health Check
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ufo_user -d ufo_timeline"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### Application Health Check
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Health Check Endpoint
The application provides `/api/health` endpoint returning:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "ufo-timeline",
  "version": "1.0.0"
}
```

## Development Workflow

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd ufo-timeline

# Start development environment
./deploy.sh dev

# Access services
# App: http://localhost:3000
# Database: localhost:5433
# pgAdmin: http://localhost:8080 (admin@ufo.local/admin)
```

### Development Commands
```bash
# View logs
./deploy.sh logs app
./deploy.sh logs database

# Check status
./deploy.sh status

# Restart services
./deploy.sh dev --force

# Clean environment
./deploy.sh clean
```

### Database Management
```bash
# Access pgAdmin: http://localhost:8080
# Username: admin@ufo.local
# Password: admin

# Connect to database:
# Host: database (internal) or localhost:5433 (external)
# Database: ufo_timeline
# Username: ufo_user
# Password: ufo_password
```

## Production Deployment

### Prerequisites
- Docker and Docker Compose installed
- SSL certificates (if using HTTPS)
- Production environment variables configured
- Domain name and DNS configured

### Deployment Steps
```bash
# 1. Clone and configure
git clone <repo-url>
cd ufo-timeline

# 2. Set production environment variables
cp .env.example .env.production
# Edit .env.production with secure values

# 3. Configure SSL (if needed)
mkdir -p nginx/ssl
# Copy SSL certificates

# 4. Deploy
./deploy.sh prod

# 5. Verify deployment
curl http://localhost/api/health
```

### Production Monitoring
```bash
# Container status
docker-compose -f docker-compose.prod.yml ps

# Application logs
docker-compose -f docker-compose.prod.yml logs app

# Database logs
docker-compose -f docker-compose.prod.yml logs database

# Nginx logs
docker-compose -f docker-compose.prod.yml logs nginx
```

## Troubleshooting

### Common Issues

**Port Conflicts**:
```bash
# Check what's using port 3000
./deploy.sh dev --force
# Or manually check
lsof -i :3000
```

**Database Connection Issues**:
```bash
# Check database health
docker-compose exec database pg_isready -U ufo_user -d ufo_timeline

# Check logs
./deploy.sh logs database
```

**Build Failures**:
```bash
# Clean Docker cache
./deploy.sh clean
docker system prune -a

# Rebuild from scratch
./deploy.sh dev --force
```

**Volume Issues**:
```bash
# Remove all volumes (WARNING: Data loss)
./deploy.sh clean --volumes

# Backup before cleanup
docker-compose exec database pg_dump -U ufo_user ufo_timeline > backup.sql
```

### Debugging Commands
```bash
# Enter running container
docker-compose exec app sh

# Check container logs
docker-compose logs -f app

# Monitor resources
docker stats

# Check disk usage
docker system df
```

This Docker deployment system provides a robust, scalable foundation for the UFO Timeline application with proper development/production separation and comprehensive tooling.
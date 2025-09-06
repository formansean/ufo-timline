# Troubleshooting and FAQ

## Quick Troubleshooting Guide

### Development Server Issues

**Problem**: `npm run dev` fails to start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Or use deployment script with force flag
./deploy.sh dev --force
```

**Problem**: Hot reload not working
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# For Docker development
./deploy.sh dev --force
```

**Problem**: TypeScript errors preventing build
```bash
# Check types without building
npm run type-check

# Fix linting issues
npm run lint:fix

# Strict build to catch all issues
npm run build:strict
```

### Database Connection Issues

**Problem**: PostgreSQL connection refused (Docker)
```bash
# Check database container status
docker-compose -p ufo-timeline ps database

# Check database logs
./deploy.sh logs database

# Verify database health
docker-compose -p ufo-timeline exec database pg_isready -U ufo_user -d ufo_timeline
```

**Problem**: Database schema out of sync
```bash
# For file-based storage (current)
# No schema sync needed - using TypeScript files

# For future Prisma integration
# ./prisma.sh generate
# ./prisma.sh db push
```

### Docker Issues

**Problem**: Container build failures
```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
./deploy.sh clean
./deploy.sh dev

# Check for port conflicts
netstat -tulpn | grep :3000
netstat -tulpn | grep :5433
```

**Problem**: Container won't start
```bash
# Check container logs
./deploy.sh logs app

# Verify all services
./deploy.sh status

# Check disk space
docker system df
```

## Frequently Asked Questions (FAQ)

### General Questions

**Q: What technology stack does UFO Timeline use?**

A: The application uses:
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + PostCSS
- **Visualization**: D3.js 7.9.0
- **Database**: PostgreSQL (planned) / File-based storage (current)
- **Authentication**: JWT with HTTP-only cookies
- **Deployment**: Docker with multi-stage builds

**Q: How do I switch between development and production environments?**

A: Use the deployment script:
```bash
./deploy.sh dev   # Development with hot reload
./deploy.sh prod  # Production optimized
```

**Q: Can I run the application locally without Docker?**

A: Yes, use local development mode:
```bash
npm install
npm run dev
```

### Development Questions

**Q: How do I add new UFO events to the system?**

A: Currently, events are stored in `src/data/comprehensiveEvents.ts`. To add events:

1. **Via Admin Interface** (Recommended):
   - Login at `/admin/login`
   - Navigate to `/admin/events`
   - Use the event management interface

2. **Direct File Editing**:
   ```typescript
   // Add to COMPREHENSIVE_EVENTS array in src/data/comprehensiveEvents.ts
   {
     "id": "new_id",
     "title": "New UFO Event",
     "category": "Sighting",
     "date": "January 1, 2024",
     "city": "City Name",
     "country": "Country",
     // ... other fields
     "likes": 0,
     "dislikes": 0
   }
   ```

**Q: How do I add new event categories?**

A: Update the type definition and constants:

1. **Update Types** (`src/types/event.ts`):
   ```typescript
   export type EventCategory = 
     | "Major Events"
     | "Tech"
     | "New Category"; // Add here
   ```

2. **Update Constants** (`src/constants/categories.ts`):
   ```typescript
   export const CATEGORIES: EventCategory[] = [
     // ... existing categories
     "New Category"
   ];
   
   export const CATEGORY_COLORS: Record<EventCategory, { base: string; hover: string }> = {
     // ... existing colors
     "New Category": { base: "#COLOR", hover: "#HOVER_COLOR" }
   };
   ```

**Q: How do I customize the Timeline appearance?**

A: Modify the constants in `src/constants/categories.ts`:

```typescript
export const TIMELINE_DIMENSIONS = {
  margin: { top: 30, right: 50, bottom: 30, left: 200 },
  eventBoxWidth: 60,
  eventBoxHeight: 30,
  height: 420
};

export const ZOOM_CONFIG = {
  scaleExtent: [0.5, 75],
  wheelDelta: 0.1,
  transitionDuration: 200
};
```

**Q: How do I add new craft types or entity types?**

A: Update the type definitions and constants:

```typescript
// In src/types/event.ts
export type CraftType = 
  | "Orb"
  | "Saucer"
  | "New Craft Type"; // Add here

// In src/constants/categories.ts
export const CRAFT_TYPES: CraftType[] = [
  // ... existing types
  "New Craft Type"
];
```

### Authentication Questions

**Q: How do I create a new admin user?**

A: Currently, users are stored in `src/data/users.json`. To create a new user:

1. **Generate Password Hash**:
   ```javascript
   const bcrypt = require('bcrypt');
   const password = 'your_password';
   const hash = await bcrypt.hash(password, 10);
   console.log(hash);
   ```

2. **Add to users.json**:
   ```json
   {
     "id": "2",
     "username": "newadmin",
     "email": "newadmin@example.com",
     "password": "generated_hash_here",
     "role": "admin",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
   ```

**Q: How do I change the JWT secret?**

A: Update the environment variable:
```bash
# In .env file
JWT_SECRET="your-new-secret-key-here"

# For production, use a strong random key:
JWT_SECRET="$(openssl rand -base64 32)"
```

**Q: How long do authentication sessions last?**

A: JWT tokens expire after 24 hours by default. To change this:

```typescript
// In src/lib/auth.ts
export function generateToken(user: User): string {
  return jwt.sign(
    { /* claims */ },
    JWT_SECRET,
    { expiresIn: '7d' } // Change to 7 days
  );
}
```

### Deployment Questions

**Q: How do I deploy to production?**

A: Use the production deployment script:

1. **Set Environment Variables**:
   ```bash
   # Create .env.production
   JWT_SECRET="secure-production-secret"
   POSTGRES_PASSWORD="secure-db-password"
   NEXTAUTH_URL="https://yourdomain.com"
   ```

2. **Deploy**:
   ```bash
   ./deploy.sh prod
   ```

**Q: How do I enable HTTPS in production?**

A: Configure SSL certificates and Nginx:

1. **Add SSL certificates** to `nginx/ssl/`
2. **Update nginx configuration** in `nginx/nginx.prod.conf`
3. **Deploy with SSL**:
   ```bash
   ./deploy.sh prod
   ```

**Q: How do I backup the database?**

A: For PostgreSQL (future):
```bash
docker-compose exec database pg_dump -U ufo_user ufo_timeline > backup.sql
```

For current file-based storage:
```bash
cp src/data/comprehensiveEvents.ts backup/
cp src/data/users.json backup/
```

### Performance Questions

**Q: The Timeline is slow with many events. How can I optimize it?**

A: Several optimization strategies:

1. **Implement Virtualization**:
   ```typescript
   // Only render events in viewport
   if (x < -50 || x > width + 50) return;
   ```

2. **Reduce Event Detail**:
   ```typescript
   // Simplify rendering at certain zoom levels
   if (zoomLevel < threshold) {
     renderSimpleCircle();
   } else {
     renderDetailedEvent();
   }
   ```

3. **Implement Data Pagination**:
   ```typescript
   // Load events in chunks
   const paginatedEvents = events.slice(offset, offset + limit);
   ```

**Q: The Globe rotation is stuttering. How to fix?**

A: Adjust rotation configuration:

```typescript
// In src/constants/categories.ts
export const GLOBE_CONFIG = {
  rotationSpeed: 0.1, // Reduce speed
  rotationInterval: 16, // Increase frequency (60 FPS)
  zoomExtent: [1, 8],
  transitionDuration: 1000
};
```

## Common Error Messages

### Build Errors

**Error**: `Module not found: Can't resolve '@/...'`

**Solution**: Check TypeScript path configuration:
```json
// In tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Error**: `Type '...' is not assignable to type '...'`

**Solution**: Check TypeScript interfaces and ensure proper typing:
```typescript
// Make sure event data matches UFOEvent interface
interface UFOEvent {
  id: string;
  title: string;
  category: EventCategory;
  // ... other required fields
}
```

### Runtime Errors

**Error**: `Cannot read property of undefined`

**Solution**: Add proper null checking:
```typescript
// Before
event.title.toUpperCase()

// After  
event.title?.toUpperCase() || 'Unknown'
```

**Error**: `D3 selection is empty`

**Solution**: Ensure DOM element exists:
```typescript
useEffect(() => {
  if (!svgRef.current) return;
  
  // D3 code here
}, [dependencies]);
```

### Docker Errors

**Error**: `Port 3000 is already in use`

**Solution**: Use the deployment script with force flag:
```bash
./deploy.sh dev --force
```

**Error**: `Database connection refused`

**Solution**: Wait for database initialization:
```bash
# Check database status
./deploy.sh status

# Wait for healthy status
./deploy.sh logs database
```

## Debugging Strategies

### Frontend Debugging

**React DevTools**:
- Install React DevTools browser extension
- Inspect component hierarchy and props
- Monitor state changes and re-renders

**Browser Console**:
```typescript
// Add strategic debugging
console.log('Event data:', event);
console.log('Filter state:', { activeCategories, activeCraftTypes });

// Use debugger statements
debugger; // Pauses execution
```

**D3.js Debugging**:
```typescript
// Inspect D3 selections
const selection = d3.select('.event-circle');
console.log('Selection:', selection.nodes());

// Check data binding
selection.each(function(d) {
  console.log('Data:', d);
});
```

### Backend Debugging

**API Route Debugging**:
```typescript
export async function GET(request: NextRequest) {
  console.log('Request URL:', request.url);
  console.log('Headers:', Object.fromEntries(request.headers));
  
  try {
    // API logic
  } catch (error) {
    console.error('API Error:', error);
    // Error response
  }
}
```

**Authentication Debugging**:
```typescript
// Check JWT token validity
const token = request.cookies.get('auth-token')?.value;
console.log('Token:', token);

const decoded = verifyToken(token);
console.log('Decoded:', decoded);
```

### Docker Debugging

**Container Inspection**:
```bash
# Enter running container
docker-compose exec app sh

# Check container logs
./deploy.sh logs app

# Monitor resource usage
docker stats ufo-timeline_app_1
```

**Network Debugging**:
```bash
# Check container networking
docker-compose exec app nslookup database

# Test database connection
docker-compose exec app nc -zv database 5432
```

## Getting Help

### Documentation Locations
- **Architecture**: `@info/architecture.md`
- **Components**: `@info/components-overview.md`
- **API Reference**: `@info/api-reference.md`
- **Database Schema**: `@info/database-schema.md`
- **Docker Deployment**: `@info/docker-deployment.md`
- **Development Workflow**: `@info/development-workflow.md`
- **Security**: `@info/security-authentication.md`
- **Visualizations**: `@info/data-visualization.md`

### Log Analysis

**Application Logs**:
```bash
# View all service logs
./deploy.sh logs

# View specific service
./deploy.sh logs app
./deploy.sh logs database
```

**Error Log Locations**:
- **Browser Console**: Client-side errors
- **Docker Logs**: `docker-compose logs service_name`
- **Build Logs**: `.next/build.log` (if exists)
- **System Logs**: `/var/log/` in containers

### Health Checks

**System Health**:
```bash
# Check all service status
./deploy.sh status

# Application health endpoint
curl http://localhost:3000/api/health
```

**Database Health**:
```bash
# PostgreSQL health check
docker-compose exec database pg_isready -U ufo_user -d ufo_timeline
```

This troubleshooting guide covers the most common issues and debugging strategies for the UFO Timeline application. For complex issues, examine the relevant documentation sections and use the debugging techniques appropriate to the problem domain.
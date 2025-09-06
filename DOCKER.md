# UFO Timeline - Docker Setup Guide

This guide explains how to run the UFO Timeline application using Docker containers with automatic cleanup and deployment scripts.

## 🚀 Quick Start

### Development Mode
```bash
# Start development environment with hot reload
./dev-docker.sh
```

### Production Mode
```bash
# Deploy in production mode
./prod-docker.sh
```

## 📋 Prerequisites

- Docker and Docker Compose installed
- At least 2GB of available RAM
- Ports 3000, 5432, and 8080 available

## 🛠️ Available Scripts

### Main Deployment Script
```bash
./deploy.sh [command]
```

**Commands:**
- `dev` (default) - Development mode with hot reload
- `prod` - Production deployment  
- `clean` - Full cleanup including volumes ⚠️ 
- `cleanup` - Clean unused containers/images
- `status` - Show running services
- `logs` - View application logs
- `stop` - Stop all services
- `restart` - Restart all services

### Helper Scripts
- `./dev-docker.sh` - Quick development setup
- `./prod-docker.sh` - Production deployment with checks

## 🌐 Service URLs

When running, access these services:

- **Application**: http://localhost:3000
- **Admin Login**: http://localhost:3000/login  
- **Database Admin (pgAdmin)**: http://localhost:8080
  - Email: `admin@ufo.local`
  - Password: `admin`

## 🗄️ Database Configuration

The application uses PostgreSQL in Docker mode:

- **Database**: `ufo_timeline`
- **User**: `ufo_user` 
- **Password**: Set in `.env` file
- **Port**: `5432`

### Database Migrations

Migrations run automatically during deployment. Manual migration:

```bash
# Inside the app container
docker-compose exec app npx prisma migrate deploy
```

## 🔧 Environment Configuration

The deployment script creates a `.env` file automatically with secure defaults:

```env
# Database
POSTGRES_PASSWORD=secure_random_password
DATABASE_URL=postgresql://ufo_user:${POSTGRES_PASSWORD}@database:5432/ufo_timeline

# JWT Secret  
JWT_SECRET=secure_random_secret

# Application
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

## 🧹 Container Cleanup

The deployment script automatically cleans up:

- ✅ Stopped containers
- ✅ Unused images
- ✅ Unused networks  
- ✅ Project-specific containers

**Full cleanup** (including volumes):
```bash
./deploy.sh clean
```

⚠️ **Warning**: Full cleanup removes all data including the database!

## 🐛 Troubleshooting

### Port Conflicts
If you get port errors, check what's using the ports:
```bash
sudo lsof -i :3000
sudo lsof -i :5432
sudo lsof -i :8080
```

### Container Issues
Check container status:
```bash
./deploy.sh status
docker-compose ps
```

View logs:
```bash
./deploy.sh logs
# Or for specific service
docker-compose logs app
```

### Database Connection Issues
1. Ensure database container is healthy:
   ```bash
   docker-compose ps database
   ```

2. Check database logs:
   ```bash
   docker-compose logs database
   ```

3. Test database connection:
   ```bash
   docker-compose exec database psql -U ufo_user -d ufo_timeline
   ```

### Clean Restart
If you encounter persistent issues:
```bash
./deploy.sh cleanup  # Clean containers/images
./deploy.sh dev       # Fresh start
```

## 🏗️ Build Optimization

The Docker setup uses multi-stage builds and includes:

- ✅ Optimized Next.js standalone output
- ✅ Minimal Alpine Linux base images  
- ✅ Efficient layer caching
- ✅ Security-focused user permissions
- ✅ Comprehensive `.dockerignore`

## 🔒 Production Considerations

For production deployment:

1. **Change default passwords** in `.env`
2. **Set secure JWT secret** (32+ characters)
3. **Configure domain** in `NEXTAUTH_URL`
4. **Set up SSL/HTTPS** with reverse proxy
5. **Configure firewall** rules
6. **Set up backups** for database volumes
7. **Monitor application** health and logs

## 📊 Monitoring

Check application health:
```bash
curl http://localhost:3000/api/health
```

Service status:
```bash
./deploy.sh status
```

## 🔄 Updates

To update the application:
```bash
git pull origin main
./deploy.sh cleanup  # Clean old images
./deploy.sh dev       # Rebuild and restart
```

## 🤝 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review application logs: `./deploy.sh logs`
3. Try a clean restart: `./deploy.sh cleanup && ./deploy.sh dev`
4. Check Docker system resources: `docker system df`
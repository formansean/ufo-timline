 Docker Image Rebuild Options

  1. Using Docker Compose (Recommended)

  # Force rebuild and restart all services
  docker-compose up --build -d

  # Or rebuild specific service only
  docker-compose build app
  docker-compose up -d app

  2. Using the Convenience Scripts

  # For development environment
  ./dev-docker.sh

  # For production environment  
  ./prod-docker.sh

  3. Manual Docker Commands

  # Build the image directly
  docker build -t ufo-timeline .

  # Or with no cache to force complete rebuild
  docker build --no-cache -t ufo-timeline .

  4. Complete Environment Refresh

  # Stop everything, rebuild, and restart
  docker-compose down
  docker-compose up --build -d

  Key Points

  - Your Dockerfile uses multi-stage builds with dependency caching
  - The npm run build:docker command is used for Docker builds (uses Turbopack)
  - Your setup includes PostgreSQL database and pgAdmin services
  - The --build flag forces Docker Compose to rebuild images even if they exist
  - Use --no-cache if you need to completely rebuild without using cached layers

  The recommended approach is docker-compose up --build -d as it will rebuild only what's changed and restart all dependent services automatically.

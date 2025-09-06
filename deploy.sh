#!/bin/bash

# UFO Timeline Deployment Script with Container Cleanup
# Usage: ./deploy.sh [dev|prod|clean]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="ufo-timeline"
COMPOSE_PROJECT_NAME="ufo-timeline"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get process info using a port
get_port_process() {
    local port=$1
    # Try lsof first (more detailed), fall back to fuser
    if command -v lsof >/dev/null 2>&1; then
        lsof -i :$port -t 2>/dev/null | head -1
    elif command -v fuser >/dev/null 2>&1; then
        fuser $port/tcp 2>/dev/null | awk '{print $1}'
    else
        return 1
    fi
}

# Function to get process details
get_process_details() {
    local pid=$1
    if [ -n "$pid" ] && ps -p $pid >/dev/null 2>&1; then
        ps -p $pid -o pid,ppid,user,comm,args --no-headers 2>/dev/null
    fi
}

# Function to kill process on port with safety checks
kill_port_process() {
    local port=$1
    local force=${2:-false}
    
    local pid=$(get_port_process $port)
    if [ -z "$pid" ]; then
        return 0  # Port is free
    fi
    
    local process_info=$(get_process_details $pid)
    if [ -z "$process_info" ]; then
        print_warning "Could not get details for process using port $port"
        return 1
    fi
    
    local process_name=$(echo "$process_info" | awk '{print $4}')
    local process_args=$(echo "$process_info" | awk '{for(i=5;i<=NF;i++) printf "%s ", $i; print ""}')
    
    # Check if it's a Docker process
    if echo "$process_args" | grep -q "docker\|containerd"; then
        print_status "Found Docker-related process on port $port: $process_name"
        print_status "This will be handled by Docker cleanup"
        return 0
    fi
    
    # Check if it's a Node.js dev server
    if echo "$process_args" | grep -qE "(next dev|npm.*dev|node.*dev|vite|webpack-dev-server)"; then
        print_warning "Found Node.js development server on port $port"
        print_status "Process: $process_name ($pid)"
        print_status "Command: $(echo "$process_args" | cut -c1-80)..."
        
        if [ "$force" = "true" ]; then
            print_status "Killing Node.js dev server..."
            kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
            sleep 2
            return $?
        else
            print_status "Use --force flag to automatically kill this process"
            return 1
        fi
    fi
    
    # For other processes, be more cautious
    print_warning "Found process using port $port:"
    print_status "PID: $pid, Process: $process_name"
    print_status "Command: $(echo "$process_args" | cut -c1-80)..."
    
    if [ "$force" = "true" ]; then
        print_warning "Force killing process $pid..."
        kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
        sleep 2
        return $?
    else
        print_error "Please manually stop this process or use --force flag"
        return 1
    fi
}

# Function to check and clear ports
clear_required_ports() {
    local ports="$1"
    local force=${2:-false}
    
    for port in $ports; do
        if get_port_process $port >/dev/null; then
            print_status "Clearing port $port..."
            if ! kill_port_process $port $force; then
                return 1
            fi
        fi
    done
    return 0
}

# Function to show Docker space usage
show_docker_space() {
    print_status "Docker disk usage:"
    docker system df
    echo ""
}

# Function to clean up Docker resources
cleanup_docker() {
    local cleanup_type="${1:-standard}"
    
    print_status "Starting Docker cleanup ($cleanup_type mode)..."
    
    # Show space before cleanup
    show_docker_space
    
    # Stop and remove all containers for this project (both compose files)
    print_status "Stopping containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    
    # Remove project containers by name patterns (more comprehensive)
    print_status "Removing project containers..."
    docker ps -a --filter "name=ufo-timeline" -q | xargs -r docker rm -f 2>/dev/null || true
    docker ps -a --filter "name=ufotimeline" -q | xargs -r docker rm -f 2>/dev/null || true
    docker ps -a --filter "name=${COMPOSE_PROJECT_NAME}" -q | xargs -r docker rm -f 2>/dev/null || true
    
    # Remove containers by image patterns (catch containers from our builds)
    print_status "Removing containers by image patterns..."
    docker ps -a --filter "ancestor=ufotimeline" -q | xargs -r docker rm -f 2>/dev/null || true
    docker ps -a --filter "ancestor=ufo-timeline" -q | xargs -r docker rm -f 2>/dev/null || true
    
    # Standard cleanup
    print_status "Removing unused containers..."
    docker container prune -f
    
    print_status "Removing unused networks..."
    docker network prune -f
    
    # Enhanced cleanup based on type
    case "$cleanup_type" in
        "standard")
            print_status "Removing unused images..."
            docker image prune -f
            ;;
        "aggressive"|"full")
            print_status "Removing all unused images (including tagged)..."
            docker image prune -a -f
            
            print_status "Removing dangling images..."
            docker images -f "dangling=true" -q | xargs -r docker rmi -f 2>/dev/null || true
            
            print_status "Removing project-specific images..."
            docker images --filter="reference=ufotimeline*" -q | xargs -r docker rmi -f 2>/dev/null || true
            docker images --filter="reference=ufo-timeline*" -q | xargs -r docker rmi -f 2>/dev/null || true
            
            if [ "$cleanup_type" = "full" ]; then
                print_warning "Performing full cleanup including volumes..."
                docker volume prune -f
            fi
            ;;
        "build")
            print_status "Cleaning build cache..."
            docker builder prune -a -f
            
            print_status "Removing unused images..."
            docker image prune -f
            
            print_status "Removing dangling images..."
            docker images -f "dangling=true" -q | xargs -r docker rmi -f 2>/dev/null || true
            ;;
        "system")
            print_warning "Performing system-wide Docker cleanup..."
            print_status "This will remove ALL unused Docker resources system-wide!"
            
            docker system prune -a -f
            docker builder prune -a -f
            
            print_warning "Removing ALL unused volumes (this may affect other projects)..."
            docker volume prune -f
            ;;
    esac
    
    print_success "Docker cleanup completed!"
    
    # Show space after cleanup
    print_status "Space usage after cleanup:"
    show_docker_space
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to generate environment file
generate_env() {
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
# Database
POSTGRES_PASSWORD=ufo_password_$(openssl rand -hex 16)
DATABASE_URL=postgresql://ufo_user:\${POSTGRES_PASSWORD}@database:5432/ufo_timeline

# JWT Secret
JWT_SECRET=$(openssl rand -hex 32)

# Next Auth (for production)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=\${JWT_SECRET}

# Node Environment
NODE_ENV=development
EOF
        print_success ".env file created!"
    else
        print_status ".env file already exists, skipping..."
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Checking for database migration requirements..."
    
    # Check if Prisma schema exists in the container
    if ! docker-compose -p $COMPOSE_PROJECT_NAME exec -T app test -f prisma/schema.prisma >/dev/null 2>&1; then
        print_warning "No Prisma schema found - application uses static data"
        print_status "Skipping database migrations (static data mode)"
        return 0
    fi
    
    # Check if Prisma is installed
    if ! docker-compose -p $COMPOSE_PROJECT_NAME exec -T app which prisma >/dev/null 2>&1; then
        print_warning "Prisma not installed - application uses static data"
        print_status "Skipping database migrations (static data mode)"
        return 0
    fi
    
    print_status "Running database migrations..."
    
    # Wait for database to be ready with health check
    print_status "Waiting for database to be ready..."
    local retry_count=0
    local max_retries=30
    
    while [ $retry_count -lt $max_retries ]; do
        if docker-compose -p $COMPOSE_PROJECT_NAME exec -T database pg_isready -U ufo_user -d ufo_timeline >/dev/null 2>&1; then
            print_success "Database is ready!"
            break
        fi
        retry_count=$((retry_count + 1))
        print_status "Waiting for database... (attempt $retry_count/$max_retries)"
        sleep 2
    done
    
    if [ $retry_count -eq $max_retries ]; then
        print_error "Database failed to become ready within timeout"
        return 1
    fi
    
    # Regenerate Prisma client (should already be built in container)
    print_status "Verifying Prisma client..."
    if ! docker-compose -p $COMPOSE_PROJECT_NAME exec -T app npx prisma generate; then
        print_error "Failed to generate Prisma client"
        return 1
    fi
    
    # Run database push for PostgreSQL
    print_status "Pushing database schema..."
    if ! docker-compose -p $COMPOSE_PROJECT_NAME exec -T app npx prisma db push --accept-data-loss; then
        print_warning "Initial database push failed. Attempting force reset..."
        if ! docker-compose -p $COMPOSE_PROJECT_NAME exec -T app npx prisma db push --force-reset; then
            print_error "Database migration failed completely"
            return 1
        fi
    fi
    
    # Verify schema was applied
    print_status "Verifying database schema..."
    if ! docker-compose -p $COMPOSE_PROJECT_NAME exec -T app npx prisma db pull --print; then
        print_warning "Could not verify database schema, but continuing..."
    fi
    
    print_success "Database migrations completed!"
}

# Function to deploy in development mode
deploy_dev() {
    local force_kill=${1:-false}
    print_status "Deploying in DEVELOPMENT mode..."
    
    # Clear required ports
    print_status "Checking and clearing required ports..."
    if ! clear_required_ports "3000 5433" $force_kill; then
        print_error "Could not clear required ports. Use 'deploy.sh dev --force' to automatically kill processes."
        exit 1
    fi
    
    # Check pgAdmin port (non-critical)
    if get_port_process 8080 >/dev/null; then
        print_warning "Port 8080 is in use. pgAdmin may not be available."
        if [ "$force_kill" = "true" ]; then
            kill_port_process 8080 true || print_warning "Could not clear port 8080"
        fi
    fi
    
    generate_env
    cleanup_docker "standard"
    
    print_status "Building and starting containers..."
    docker-compose -p $COMPOSE_PROJECT_NAME up --build -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if containers are running
    if ! docker-compose -p $COMPOSE_PROJECT_NAME ps | grep -q "Up"; then
        print_error "Containers failed to start properly"
        docker-compose -p $COMPOSE_PROJECT_NAME logs
        exit 1
    fi
    
    if ! run_migrations; then
        print_error "Migration failed. Check the logs:"
        docker-compose -p $COMPOSE_PROJECT_NAME logs app
        exit 1
    fi
    
    print_success "Development deployment completed!"
    print_status "Application: http://localhost:3000"
    print_status "Database Admin (pgAdmin): http://localhost:8080"
    print_status "  Email: admin@ufo.local"
    print_status "  Password: admin"
}

# Function to deploy in production mode
deploy_prod() {
    local force_kill=${1:-false}
    print_status "Deploying in PRODUCTION mode..."
    
    if [ ! -f .env ]; then
        print_error "Production deployment requires .env file. Please create one first."
        exit 1
    fi
    
    # Clear required ports
    print_status "Checking and clearing required ports..."
    if ! clear_required_ports "3000 5432" $force_kill; then
        print_error "Could not clear required ports. Use 'deploy.sh prod --force' to automatically kill processes."
        exit 1
    fi
    
    cleanup_docker "standard"
    
    print_status "Building and starting production containers..."
    docker-compose -p $COMPOSE_PROJECT_NAME -f docker-compose.prod.yml up --build -d
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    # Check if containers are running
    if ! docker-compose -p $COMPOSE_PROJECT_NAME -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_error "Production containers failed to start properly"
        docker-compose -p $COMPOSE_PROJECT_NAME -f docker-compose.prod.yml logs
        exit 1
    fi
    
    if ! run_migrations; then
        print_error "Production migration failed. Check the logs:"
        docker-compose -p $COMPOSE_PROJECT_NAME -f docker-compose.prod.yml logs app
        exit 1
    fi
    
    print_success "Production deployment completed!"
    print_status "Application: http://localhost:3000"
}

# Function to show running services
show_status() {
    print_status "Current running services:"
    docker-compose -p $COMPOSE_PROJECT_NAME ps
    echo ""
    print_status "Docker system info:"
    docker system df
}

# Function to show logs
show_logs() {
    print_status "Showing logs for all services..."
    docker-compose -p $COMPOSE_PROJECT_NAME logs -f
}

# Parse force flag
FORCE_KILL=false
if [ "$2" = "--force" ] || [ "$1" = "--force" ]; then
    FORCE_KILL=true
fi

# Main script logic
case "${1:-dev}" in
    "dev" | "development")
        deploy_dev $FORCE_KILL
        show_status
        ;;
    "prod" | "production")
        deploy_prod $FORCE_KILL
        show_status
        ;;
    "clean")
        cleanup_docker "full"
        ;;
    "clean-all"|"clean-system")
        cleanup_docker "system"
        ;;
    "clean-build")
        cleanup_docker "build"
        ;;
    "clean-aggressive")
        cleanup_docker "aggressive"
        ;;
    "cleanup")
        cleanup_docker "standard"
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose -p $COMPOSE_PROJECT_NAME down
        print_success "All services stopped!"
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose -p $COMPOSE_PROJECT_NAME restart
        print_success "Services restarted!"
        ;;
    *)
        echo "Usage: $0 {dev|prod|clean|cleanup|status|logs|stop|restart} [--force]"
        echo ""
        echo "Commands:"
        echo "  dev             - Deploy in development mode (default)"
        echo "  prod            - Deploy in production mode"
        echo "  clean           - Full cleanup including volumes"
        echo "  clean-all       - System-wide Docker cleanup (affects all projects)"
        echo "  clean-build     - Clean build cache and dangling images"
        echo "  clean-aggressive- Aggressive project cleanup (all unused images)"
        echo "  cleanup         - Standard cleanup (unused containers/images)"
        echo "  status          - Show running services and system info"
        echo "  logs            - Show logs for all services"
        echo "  stop            - Stop all services"
        echo "  restart         - Restart all services"
        echo ""
        echo "Options:"
        echo "  --force         - Automatically kill processes using required ports"
        exit 1
        ;;
esac

check_docker
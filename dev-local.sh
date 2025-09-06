#!/bin/bash

# UFO Timeline Local Development Script
# This script sets up local development with SQLite

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Update Prisma schema for SQLite
update_schema_for_sqlite() {
    print_status "Updating Prisma schema for SQLite..."
    sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
    print_success "Schema updated for SQLite"
}

# Update Prisma schema for PostgreSQL
update_schema_for_postgresql() {
    print_status "Updating Prisma schema for PostgreSQL..."
    sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    print_success "Schema updated for PostgreSQL"
}

# Setup local development
setup_local() {
    print_status "Setting up local development with SQLite..."
    
    # Update schema for SQLite
    update_schema_for_sqlite
    
    # Generate Prisma client
    print_status "Generating Prisma client for SQLite..."
    DATABASE_URL="file:./prisma/dev.db" npx prisma generate
    
    # Push schema to SQLite database
    print_status "Creating/updating SQLite database..."
    DATABASE_URL="file:./prisma/dev.db" npx prisma db push
    
    print_success "Local development setup completed!"
    print_status "You can now run: npm run dev"
}

# Prepare for Docker
prepare_docker() {
    print_status "Preparing for Docker deployment..."
    
    # Update schema for PostgreSQL
    update_schema_for_postgresql
    
    print_success "Ready for Docker deployment!"
    print_status "You can now run: ./deploy.sh dev"
}

# Reset to clean state
reset() {
    print_status "Resetting to clean state..."
    
    # Remove SQLite database
    if [ -f "prisma/dev.db" ]; then
        rm prisma/dev.db
        print_status "Removed SQLite database"
    fi
    
    # Clean up node_modules/.prisma
    if [ -d "node_modules/.prisma" ]; then
        rm -rf node_modules/.prisma
        print_status "Cleaned Prisma client cache"
    fi
    
    print_success "Reset completed!"
}

case "${1:-local}" in
    "local")
        setup_local
        ;;
    "docker")
        prepare_docker
        ;;
    "reset")
        reset
        ;;
    *)
        echo "Usage: $0 {local|docker|reset}"
        echo ""
        echo "Commands:"
        echo "  local   - Setup for local development with SQLite (default)"
        echo "  docker  - Prepare for Docker deployment with PostgreSQL"
        echo "  reset   - Reset to clean state"
        exit 1
        ;;
esac
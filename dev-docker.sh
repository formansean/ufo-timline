#!/bin/bash

# UFO Timeline Development Docker Script
# Quick development environment setup

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DEV]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_status "Starting UFO Timeline development environment..."

# Run the main deploy script in dev mode
./deploy.sh dev

print_success "Development environment is ready!"
print_status ""
print_status "🚀 Application: http://localhost:3000"
print_status "🛸 Admin Login: http://localhost:3000/login"
print_status "🗄️  pgAdmin: http://localhost:8080 (admin@ufo.local / admin)"
print_status ""
print_status "Useful commands:"
print_status "  ./deploy.sh logs    - View logs"
print_status "  ./deploy.sh stop    - Stop services"
print_status "  ./deploy.sh status  - Check service status"
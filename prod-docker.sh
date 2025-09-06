#!/bin/bash

# UFO Timeline Production Docker Script
# Production deployment with security checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[PROD]${NC} $1"
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

# Check for production requirements
check_production_requirements() {
    print_status "Checking production requirements..."
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_error ".env file is required for production deployment"
        print_status "Please create .env file with:"
        echo "  POSTGRES_PASSWORD=your_secure_password"
        echo "  JWT_SECRET=your_jwt_secret"
        echo "  NEXTAUTH_URL=your_domain"
        exit 1
    fi
    
    # Check for secure JWT secret
    JWT_SECRET=$(grep JWT_SECRET .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ ${#JWT_SECRET} -lt 32 ]; then
        print_warning "JWT_SECRET should be at least 32 characters long for security"
    fi
    
    # Check for default passwords
    if grep -q "ufo_password" .env; then
        print_warning "Using default database password. Consider changing it for production."
    fi
    
    print_success "Production requirements check completed!"
}

# Main production deployment
deploy_production() {
    print_status "Deploying UFO Timeline in PRODUCTION mode..."
    print_warning "This will replace any existing production deployment!"
    
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled."
        exit 0
    fi
    
    check_production_requirements
    
    # Run the main deploy script in production mode
    ./deploy.sh prod
    
    print_success "Production deployment completed!"
    print_status ""
    print_status "🚀 Application: http://localhost:3000"
    print_status "🛸 Admin Panel: http://localhost:3000/admin"
    print_status ""
    print_status "Production Management:"
    print_status "  ./deploy.sh logs    - View application logs"
    print_status "  ./deploy.sh status  - Check service health"
    print_status "  ./deploy.sh restart - Restart services"
    print_status "  ./deploy.sh stop    - Stop production services"
    print_status ""
    print_warning "Remember to:"
    print_warning "  - Set up SSL certificates for HTTPS"
    print_warning "  - Configure firewall rules"
    print_warning "  - Set up regular backups"
    print_warning "  - Monitor application logs"
}

# Show production status
show_production_status() {
    print_status "Production Status Check:"
    ./deploy.sh status
    
    print_status ""
    print_status "Health Check:"
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Application is responding ✓"
    else
        print_error "Application is not responding ✗"
    fi
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy_production
        ;;
    "status")
        show_production_status
        ;;
    "check")
        check_production_requirements
        ;;
    *)
        echo "Usage: $0 {deploy|status|check}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy in production mode (default)"
        echo "  status  - Show production status and health"
        echo "  check   - Check production requirements"
        exit 1
        ;;
esac
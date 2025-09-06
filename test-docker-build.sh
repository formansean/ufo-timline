#!/bin/bash

# Test script to verify Docker build configurations
# This is a verification script to ensure our Docker optimizations work

set -e

echo "Testing Docker build configurations..."

# Test development build
echo "Testing development build target..."
docker build --target development -t ufo-timeline:dev-test . || {
    echo "❌ Development build failed"
    exit 1
}
echo "✅ Development build successful"

# Test production build
echo "Testing production build (runner target)..."
docker build --target runner -t ufo-timeline:prod-test . || {
    echo "❌ Production build failed"
    exit 1
}
echo "✅ Production build successful"

# Clean up test images
echo "Cleaning up test images..."
docker rmi ufo-timeline:dev-test ufo-timeline:prod-test || true

echo "🎉 All Docker build tests passed!"
echo ""
echo "Next steps:"
echo "1. Run './deploy.sh dev' to start development environment"
echo "2. Run './deploy.sh prod' to start production environment"
echo "3. Use './deploy.sh --help' to see all available options"
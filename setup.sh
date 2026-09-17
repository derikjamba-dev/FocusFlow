#!/bin/bash

# FocusFlow Production Setup Script
# This script sets up the entire development environment

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  FocusFlow Production Setup             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✅ Docker installed${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose installed${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed (optional for local dev)${NC}"
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION} installed${NC}"
fi

echo ""

# Setup environment file
echo "📝 Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env with your configuration${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping${NC}"
fi

echo ""

# Ask user for setup type
echo "Choose setup type:"
echo "1) Docker (Recommended - everything in containers)"
echo "2) Local Development (Node.js required)"
echo "3) Skip for now"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "🐳 Setting up with Docker..."
        echo ""
        
        # Pull images
        echo "📦 Pulling Docker images..."
        docker-compose pull
        
        # Start services
        echo "🚀 Starting services..."
        docker-compose up -d
        
        # Wait for services to be ready
        echo "⏳ Waiting for services to start..."
        sleep 10
        
        # Check if services are running
        if docker-compose ps | grep -q "Up"; then
            echo -e "${GREEN}✅ Services started successfully!${NC}"
            echo ""
            echo "📊 Service Status:"
            docker-compose ps
            echo ""
            echo "🎉 Setup complete!"
            echo ""
            echo "Access your app:"
            echo "  Web App:      http://localhost:3000"
            echo "  API:          http://localhost:4000"
            echo "  Database UI:  http://localhost:8080"
            echo "  Redis UI:     http://localhost:8081"
            echo ""
            echo "📖 Next steps:"
            echo "  1. Create an account at http://localhost:3000"
            echo "  2. Read QUICKSTART.md for more info"
            echo "  3. Check logs: docker-compose logs -f"
        else
            echo -e "${RED}❌ Failed to start services${NC}"
            echo "Check logs: docker-compose logs"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo "💻 Setting up for local development..."
        echo ""
        
        # Check Node.js again
        if ! command -v node &> /dev/null; then
            echo -e "${RED}❌ Node.js is required for local development${NC}"
            exit 1
        fi
        
        # Install dependencies
        echo "📦 Installing dependencies..."
        npm install
        
        # Start just database services
        echo "🚀 Starting database services..."
        docker-compose up postgres redis -d
        
        # Wait for databases
        echo "⏳ Waiting for databases..."
        sleep 5
        
        # Setup Prisma
        echo "🗄️  Setting up database..."
        cd apps/api
        npx prisma generate
        npx prisma migrate dev --name init
        cd ../..
        
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo ""
        echo "🚀 Start development servers:"
        echo "  npm run dev"
        echo ""
        echo "Then access:"
        echo "  Web App: http://localhost:3000"
        echo "  API:     http://localhost:4000"
        ;;
        
    3)
        echo ""
        echo "⏭️  Skipping automated setup"
        echo ""
        echo "Manual setup instructions:"
        echo "  1. Edit .env file"
        echo "  2. Run: docker-compose up -d"
        echo "  3. Read QUICKSTART.md"
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "📚 Documentation:"
echo "  Quick Start:  ./QUICKSTART.md"
echo "  Migration:    ./MIGRATION.md"
echo "  API Docs:     ./docs/API.md"
echo "  Deployment:   ./docs/deployment.md"
echo ""
echo "💡 Useful commands:"
echo "  View logs:    docker-compose logs -f"
echo "  Stop:         docker-compose down"
echo "  Restart:      docker-compose restart"
echo ""
echo "🆘 Need help? Check ./docs/ or create an issue on GitHub"
echo ""


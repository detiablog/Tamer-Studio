#!/bin/bash

# Installation & Setup Script for Production Integration
# Run this script after all code has been added to your project

set -e

echo "🚀 Tamer Studio - Production Integration Setup"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node version
echo -e "${BLUE}📋 Checking Node.js version...${NC}"
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION == v22* ]] || [[ $NODE_VERSION == v21* ]]; then
  echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"
else
  echo -e "${YELLOW}⚠ Recommended: Node.js 22+, found $NODE_VERSION${NC}"
fi

# Install dependencies
echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Setup environment
echo ""
echo -e "${BLUE}🔑 Setting up environment variables...${NC}"
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo -e "${GREEN}✓ Created .env.local${NC}"
  echo -e "${YELLOW}⚠ Please fill in these values:${NC}"
  echo "   - UPSTASH_REDIS_REST_URL"
  echo "   - UPSTASH_REDIS_REST_TOKEN"
  echo "   - REDIS_URL (local or Upstash)"
  echo "   - DATABASE_URL"
else
  echo -e "${GREEN}✓ .env.local exists${NC}"
fi

# Generate database types
echo ""
echo -e "${BLUE}🗄️  Generating database types...${NC}"
pnpm db:generate
echo -e "${GREEN}✓ Database types generated${NC}"

# Run migrations
echo ""
echo -e "${BLUE}🔄 Running database migrations...${NC}"
pnpm db:migrate
echo -e "${GREEN}✓ Database migrations applied${NC}"

# Install Docker (optional)
echo ""
echo -e "${BLUE}🐳 Docker setup (optional)${NC}"
if command -v docker &> /dev/null; then
  echo -e "${GREEN}✓ Docker is installed${NC}"
  echo ""
  echo "Start infrastructure with:"
  echo "  docker compose -f docker-compose.local.yml up -d"
else
  echo -e "${YELLOW}⚠ Docker not found (optional but recommended)${NC}"
  echo "Install from: https://www.docker.com/products/docker-desktop"
fi

# Summary
echo ""
echo -e "${GREEN}=============================================="
echo "✅ Setup Complete!"
echo "=============================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Configure environment variables in .env.local"
echo "  2. Start services: docker compose -f docker-compose.local.yml up -d"
echo "  3. Start dev: pnpm dev"
echo "  4. Review: METRICS_INTEGRATION.md"
echo ""
echo "Features installed:"
echo "  ✅ Production metrics recording"
echo "  ✅ Collaborative editing (WebSocket)"
echo "  ✅ Daily cron aggregation"
echo "  ✅ Rate limiting"
echo "  ✅ Analytics dashboard"
echo ""
echo "Documentation:"
echo "  📚 INTEGRATION_COMPLETE.md"
echo "  📚 METRICS_INTEGRATION.md"
echo "  📚 INTEGRATION_CHECKLIST.md"
echo ""

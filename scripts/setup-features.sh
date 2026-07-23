#!/bin/bash

# Quick Start Setup Script for New Features
# Run this after installing dependencies

set -e

echo "🔧 Setting up Tamer Studio with Rate Limiting, Real-Time Collaboration & Analytics..."

# 1. Check environment variables
echo "\n📋 Checking environment variables..."
if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local not found. Copying from .env.example..."
  cp .env.example .env.local
  echo "✅ Created .env.local - please fill in required values:"
  echo "   - UPSTASH_REDIS_REST_URL"
  echo "   - UPSTASH_REDIS_REST_TOKEN"
  echo "   - REDIS_URL"
else
  echo "✅ .env.local exists"
fi

# 2. Install dependencies
echo "\n📦 Installing dependencies..."
pnpm add @upstash/ratelimit @upstash/redis socket.io socket.io-client redis recharts

# 3. Generate database migrations
echo "\n🗄️  Generating database migrations..."
pnpm db:generate

# 4. Apply migrations
echo "\n📝 Applying migrations..."
pnpm db:migrate

echo "\n✅ Setup complete!"
echo "\n📚 Next steps:"
echo "   1. Configure environment variables in .env.local"
echo "   2. Start Redis: redis-server"
echo "   3. Run: pnpm dev"
echo "   4. Read IMPLEMENTATION_GUIDE.md for detailed setup"
echo "\n🚀 Features added:"
echo "   ✓ Rate limiting on auth endpoints (Upstash Redis)"
echo "   ✓ Real-time collaboration with WebSocket (Socket.io)"
echo "   ✓ Analytics dashboard with metrics"

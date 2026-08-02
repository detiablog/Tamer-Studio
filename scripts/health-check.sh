#!/bin/bash
APP_URL=${APP_URL:-http://localhost:3000}

echo "Checking application health..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health")

if [ "$STATUS" = "200" ]; then
  echo "Application: HEALTHY (HTTP $STATUS)"
else
  echo "Application: UNHEALTHY (HTTP $STATUS)"
  exit 1
fi

echo ""
curl -s "$APP_URL/health" | python3 -m json.tool 2>/dev/null || curl -s "$APP_URL/health"

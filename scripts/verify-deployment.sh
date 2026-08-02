#!/bin/bash
set -e

APP_URL=${APP_URL:-http://localhost:3000}
ERRORS=0

echo "=== Deployment Verification ==="
echo ""

echo "1. Health Check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health")
if [ "$STATUS" = "200" ]; then echo "   PASS"; else echo "   FAIL (HTTP $STATUS)"; ERRORS=$((ERRORS + 1)); fi

echo "2. API Health..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health")
if [ "$STATUS" = "200" ]; then echo "   PASS"; else echo "   FAIL (HTTP $STATUS)"; ERRORS=$((ERRORS + 1)); fi

echo "3. Database Health..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health/database")
if [ "$STATUS" = "200" ]; then echo "   PASS"; else echo "   FAIL (HTTP $STATUS)"; ERRORS=$((ERRORS + 1)); fi

echo "4. Runtime Health..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health/runtime")
if [ "$STATUS" = "200" ]; then echo "   PASS"; else echo "   FAIL (HTTP $STATUS)"; ERRORS=$((ERRORS + 1)); fi

echo "5. Static Assets..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/favicon.ico")
if [ "$STATUS" = "200" ] || [ "$STATUS" = "304" ]; then echo "   PASS"; else echo "   FAIL (HTTP $STATUS)"; ERRORS=$((ERRORS + 1)); fi

echo ""
echo "=== Results: $ERRORS failures ==="
if [ $ERRORS -gt 0 ]; then exit 1; fi
echo "All checks passed!"

#!/bin/bash

# Warmup.ai - Pre-Deployment Validation Script

echo "🔍 Validating Warmup.ai setup for deployment..."
echo ""

errors=0
warnings=0

# Check backend files
echo "📦 Checking backend files..."

if [ ! -f "backend/requirements.txt" ]; then
  echo "❌ backend/requirements.txt missing"
  ((errors++))
else
  echo "✅ requirements.txt exists"
fi

if [ ! -f "backend/Procfile" ]; then
  echo "❌ backend/Procfile missing"
  ((errors++))
else
  echo "✅ Procfile exists"
fi

if [ ! -f "backend/.env" ]; then
  echo "⚠️  backend/.env missing (needed for local testing)"
  ((warnings++))
else
  echo "✅ .env exists"
fi

# Check frontend files
echo ""
echo "🎨 Checking frontend files..."

if [ ! -f ".env.production" ]; then
  echo "⚠️  .env.production missing (should have VITE_API_URL)"
  ((warnings++))
else
  echo "✅ .env.production exists"
fi

# Check for localhost URLs (should be updated)
echo ""
echo "🔗 Checking for localhost URLs..."

localhost_count=$(grep -r "localhost:5000" src/ 2>/dev/null | grep -v "import.meta.env" | wc -l | tr -d ' ')

if [ "$localhost_count" -gt 0 ]; then
  echo "⚠️  Found $localhost_count hardcoded localhost URLs"
  echo "   Run: ./update-api-urls.sh"
  ((warnings++))
else
  echo "✅ No hardcoded localhost URLs"
fi

# Check git status
echo ""
echo "📝 Checking git status..."

if git rev-parse --git-dir > /dev/null 2>&1; then
  uncommitted=$(git status --porcelain | wc -l | tr -d ' ')
  if [ "$uncommitted" -gt 0 ]; then
    echo "⚠️  $uncommitted uncommitted changes"
    echo "   Commit before deploying!"
    ((warnings++))
  else
    echo "✅ All changes committed"
  fi
else
  echo "❌ Not a git repository"
  ((errors++))
fi

# Check required environment variables in .env.example
echo ""
echo "🔑 Checking environment variables..."

required_vars=(
  "STRIPE_SECRET_KEY"
  "STRIPE_PUBLISHABLE_KEY"
  "PRICE_ONE_TIME"
  "PRICE_STARTER"
  "PRICE_GROWTH"
  "JWT_SECRET"
  "DATABASE_URL"
  "FRONTEND_URL"
)

if [ -f "backend/.env" ]; then
  for var in "${required_vars[@]}"; do
    if grep -q "^$var=" backend/.env; then
      echo "✅ $var configured"
    else
      echo "⚠️  $var missing from .env"
      ((warnings++))
    fi
  done
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VALIDATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Errors: $errors"
echo "Warnings: $warnings"
echo ""

if [ $errors -gt 0 ]; then
  echo "❌ Fix errors before deploying!"
  exit 1
elif [ $warnings -gt 0 ]; then
  echo "⚠️  Check warnings before deploying"
  exit 0
else
  echo "✅ All checks passed! Ready to deploy! 🚀"
  exit 0
fi

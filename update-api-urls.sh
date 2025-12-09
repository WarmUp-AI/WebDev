#!/bin/bash

# Warmup.ai - Update Frontend API URLs for Production

echo "🔄 Updating frontend API URLs for production..."

# Array of files to update
files=(
  "src/Signup.jsx"
  "src/Login.jsx"
  "src/Dashboard.jsx"
  "src/AdminLogin.jsx"
  "src/AdminDashboard.jsx"
  "src/Success.jsx"
)

# Backup directory
backup_dir="api_url_backups_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Updating $file..."
    
    # Backup original
    cp "$file" "$backup_dir/"
    
    # Replace localhost URL with environment variable
    sed -i '' "s|const API_URL = 'http://localhost:5000';|const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';|g" "$file"
    
    echo "✅ Updated $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ All files updated!"
echo "📦 Backups saved to: $backup_dir"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Test locally: npm run dev"
echo "3. Commit and push: git add . && git commit -m 'Update API URLs for production' && git push"
echo ""

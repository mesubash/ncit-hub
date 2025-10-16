#!/bin/bash

echo "🔍 NCIT Hub - Verification Script"
echo "=================================="
echo ""

# Check if .next directory exists
if [ -d ".next" ]; then
    echo "⚠️  .next cache directory exists"
    echo "   Recommendation: Delete it with: rm -rf .next"
else
    echo "✅ .next cache is clean"
fi

echo ""

# Check if dev server is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Development server is running on port 3000"
else
    echo "⚠️  Development server is NOT running"
    echo "   Start it with: npm run dev"
fi

echo ""

# Check if required files exist
echo "📁 Checking required files..."

files=(
    "lib/events.ts"
    "app/blogs/page.tsx"
    "supabase/final_schema.sql"
    "APPLY_ALL_FIXES.sql"
    "FINAL_INSTRUCTIONS.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
    fi
done

echo ""
echo "📝 Next Steps:"
echo "1. Run the SQL script (APPLY_ALL_FIXES.sql) in Supabase SQL Editor"
echo "2. Delete .next cache: rm -rf .next"
echo "3. Restart dev server: npm run dev"
echo "4. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo ""
echo "📖 Read FINAL_INSTRUCTIONS.md for detailed steps"
echo ""

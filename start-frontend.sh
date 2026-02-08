#!/bin/bash

echo "🚀 Starting ChineseFlow Frontend..."

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ Frontend is ready!"
echo "🌐 Open: http://localhost:5173"
echo ""
npm run dev

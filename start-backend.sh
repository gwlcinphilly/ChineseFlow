#!/bin/bash

echo "🚀 Starting ChineseFlow Backend..."
echo "🗄️  Using Neon PostgreSQL database"

cd backend

# Set Neon PostgreSQL database URL for all environments
export DATABASE_URL="postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -q -r requirements.txt

# Create data directory if it doesn't exist (for settings and other files)
mkdir -p data

# Start server
echo ""
echo "✅ Backend is ready!"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🗄️  Database: Neon PostgreSQL"
echo ""
python main.py

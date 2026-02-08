#!/bin/bash

echo "🚀 Starting ChineseFlow Backend..."

cd backend

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

# Create data directory if it doesn't exist
mkdir -p data

# Start server
echo ""
echo "✅ Backend is ready!"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
python main.py

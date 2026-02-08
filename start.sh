#!/bin/bash

echo "🎯 Starting ChineseFlow..."
echo ""
echo "This will start both the backend and frontend servers."
echo "Make sure you have:"
echo "  - Python 3.9+ installed"
echo "  - Node.js 18+ installed"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - open two terminal windows
    osascript -e 'tell application "Terminal" to do script "cd \"'"$(pwd)"'\" && ./start-backend.sh"'
    sleep 2
    osascript -e 'tell application "Terminal" to do script "cd \"'"$(pwd)"'\" && ./start-frontend.sh"'
    
    echo "✅ Opening backend and frontend in separate terminal windows..."
    echo ""
    echo "📚 Backend: http://localhost:8000"
    echo "🌐 Frontend: http://localhost:5173"
else
    # Linux/other - provide instructions
    echo "Please open two terminal windows and run:"
    echo ""
    echo "Terminal 1: ./start-backend.sh"
    echo "Terminal 2: ./start-frontend.sh"
fi

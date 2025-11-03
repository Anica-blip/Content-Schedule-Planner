#!/bin/bash
# Content Schedule Planner - Startup Script

echo "================================================"
echo "  📅 Content Schedule Planner"
echo "================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first time setup)..."
    echo "This may take 2-3 minutes..."
    echo ""
    npm install
    echo ""
    echo "✅ Dependencies installed!"
    echo ""
fi

# Check if PORT is set, otherwise use 3000
if [ -z "$PORT" ]; then
    PORT=3000
fi

echo "🚀 Starting Content Schedule Planner..."
echo "📍 Server will run on: http://localhost:$PORT"
echo ""
echo "💡 Tips:"
echo "   - Browser will open automatically"
echo "   - Press Ctrl+C to stop the server"
echo "   - Keep this terminal window open"
echo ""
echo "================================================"
echo ""

# Start the development server
npm start

#!/bin/bash

# RizqShare Backend Start Script

echo "🌟 Starting RizqShare Backend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Please create a .env file. You can copy .env.example:"
    echo "   cp .env.example .env"
    echo ""
    exit 1
fi

# Check if MongoDB is running (local)
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB doesn't seem to be running locally."
    echo "   If using MongoDB Atlas, ignore this warning."
    echo "   If using local MongoDB, start it with: brew services start mongodb-community"
    echo ""
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads/receipts/expenses
    mkdir -p uploads/receipts/donations
    mkdir -p uploads/profiles
    echo ""
fi

echo "🚀 Starting server in development mode..."
echo "🌐 API will be available at: http://localhost:5000"
echo "📚 Health check: http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"
echo ""

# Start the server
npm run dev


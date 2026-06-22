#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 Starting GPS Manager System..."

# Function to kill all processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID
    exit
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# 1. Start Backend
echo "📡 Starting Backend (Port 3003)..."
cd "$DIR/server"
npm run dev &
BACKEND_PID=$!

# 2. Start Frontend
echo "💻 Starting Frontend (Port 5173)..."
cd "$DIR/app"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ System is running!"
echo "------------------------------------------------"
echo "Backend: http://localhost:3003"
echo "Frontend: http://localhost:5173"
echo "------------------------------------------------"
echo "Press Ctrl+C to stop both."

# Wait for background processes
wait

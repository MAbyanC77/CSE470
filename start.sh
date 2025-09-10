#!/bin/bash

echo "===================================="
echo "   EduConnect - Quick Start Script"
echo "===================================="
echo

echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js is installed ✓"
echo

echo "Checking if dependencies are installed..."
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd client
    npm install
    cd ..
fi

echo "Dependencies are ready ✓"
echo

echo "Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    echo
    read -p "Would you like to create a basic .env file now? (y/n): " choice
    if [[ $choice == [Yy]* ]]; then
        cp ".env.example" ".env"
        echo "Basic .env file created. Please edit it with your MongoDB configuration."
    fi
    echo
fi

echo "Starting EduConnect..."
echo
echo "Backend server will start on http://localhost:5000"
echo "Frontend will start on http://localhost:3000"
echo
echo "Press Ctrl+C to stop the servers"
echo

echo "Starting backend server..."
gnome-terminal --title="EduConnect Backend" -- bash -c "npm start; exec bash" 2>/dev/null || \
xterm -title "EduConnect Backend" -e "npm start" 2>/dev/null || \
open -a Terminal.app . 2>/dev/null || \
echo "Please manually run 'npm start' in a new terminal"

echo "Waiting 5 seconds for backend to initialize..."
sleep 5

echo "Starting frontend server..."
gnome-terminal --title="EduConnect Frontend" -- bash -c "cd client && npm start; exec bash" 2>/dev/null || \
xterm -title "EduConnect Frontend" -e "cd client && npm start" 2>/dev/null || \
open -a Terminal.app client 2>/dev/null || \
echo "Please manually run 'cd client && npm start' in a new terminal"

echo
echo "===================================="
echo "Both servers are starting!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "===================================="
echo
echo "Your browser should open automatically."
echo "If not, manually navigate to http://localhost:3000"
echo

# Make the script wait so user can see the output
read -p "Press Enter to continue..."
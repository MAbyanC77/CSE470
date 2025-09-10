@echo off
echo ====================================
echo    EduConnect - Quick Start Script
echo ====================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed ✓
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
)

if not exist "client\node_modules" (
    echo Installing frontend dependencies...
    cd client
    npm install
    cd ..
)

echo Dependencies are ready ✓
echo.

echo Checking environment configuration...
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and configure it.
    echo.
    echo Would you like to create a basic .env file now? (y/n)
    set /p choice="Enter your choice: "
    if /i "%choice%"=="y" (
        copy ".env.example" ".env"
        echo Basic .env file created. Please edit it with your MongoDB configuration.
    )
    echo.
)

echo Starting EduConnect...
echo.
echo Backend server will start on http://localhost:5000
echo Frontend will start on http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

echo Starting backend server...
start "EduConnect Backend" cmd /k "npm start"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting frontend server...
start "EduConnect Frontend" cmd /k "cd client && npm start"

echo.
echo ====================================
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ====================================
echo.
echo Your browser should open automatically.
echo If not, manually navigate to http://localhost:3000
echo.
pause
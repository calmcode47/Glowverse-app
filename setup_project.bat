@echo off
echo ==========================================
echo Glowverse Project Setup Script
echo ==========================================
echo.

echo [1/2] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b %errorlevel%
)
echo Backend dependencies installed successfully.
echo.

echo [2/2] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b %errorlevel%
)
echo Frontend dependencies installed successfully.
echo.

echo ==========================================
echo Setup Complete!
echo You can now run the project.
echo ==========================================
pause

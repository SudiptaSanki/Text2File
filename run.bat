@echo off
title Text2File - Development Server
cd /d "%~dp0"

echo ===================================================
echo               Text2File Dev Server
echo ===================================================
echo.

if not exist "node_modules\" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b %errorlevel%
    )
    echo.
)

echo [INFO] Starting development server...
echo.
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Dev server stopped or failed.
    pause
)

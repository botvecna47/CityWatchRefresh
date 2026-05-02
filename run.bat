@echo off
title CityWatch — Project Launcher
color 0A

echo.
echo  =====================================================
echo   CityWatch Civic Platform — Project Launcher
echo  =====================================================
echo.

REM ── Locate JDK 23 ──────────────────────────────────────────────────────────
set "JDK23_PATH=C:\Program Files\Java\jdk-23"

if not exist "%JDK23_PATH%\bin\java.exe" (
    echo  [ERROR] JDK 23 not found at: %JDK23_PATH%
    echo  Please install JDK 23 from https://www.oracle.com/java/technologies/downloads/
    echo  or update JDK23_PATH in this file to point to your JDK 23 installation.
    pause
    exit /b 1
)

set "JAVA_HOME=%JDK23_PATH%"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo  [OK] Using Java:
java -version 2>&1 | findstr /i "version"
echo.

REM ── Check that .env files exist ────────────────────────────────────────────
if not exist "%~dp0backend\.env" (
    echo  [ERROR] backend\.env file is missing!
    echo  Please copy backend\.env.example to backend\.env and fill in the values.
    pause
    exit /b 1
)

if not exist "%~dp0frontend\.env" (
    echo  [ERROR] frontend\.env file is missing!
    echo  Please copy frontend\.env.example to frontend\.env and fill in the values.
    pause
    exit /b 1
)

REM ── Check Node.js ─────────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed or not on PATH.
    echo  Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo  [OK] Using Node.js:
node --version
echo.

REM ── Install frontend dependencies if needed ────────────────────────────────
if not exist "%~dp0frontend\node_modules" (
    echo  [INFO] Installing frontend dependencies (first-time setup)...
    cd /d "%~dp0frontend"
    call npm install
    if %errorlevel% neq 0 (
        echo  [ERROR] npm install failed. Check your internet connection.
        pause
        exit /b 1
    )
    cd /d "%~dp0"
)

echo  [INFO] Starting CityWatch Backend on port 8081...
start "CityWatch Backend" cmd /k "set JAVA_HOME=%JDK23_PATH% && set PATH=%JDK23_PATH%\bin;%PATH% && cd /d "%~dp0backend" && mvn spring-boot:run"

echo  [INFO] Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo  [INFO] Starting CityWatch Frontend on http://localhost:5173...
start "CityWatch Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  =====================================================
echo   Both servers are starting in separate windows.
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8081
echo   API Docs:  http://localhost:8081/actuator/health
echo  =====================================================
echo.
echo  Close those windows to stop the servers.
echo.
pause

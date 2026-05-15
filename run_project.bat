@echo off
title CityWatch — Project Launcher
color 0A

echo.
echo  =====================================================
echo   CityWatch Civic Platform — Project Launcher
echo  =====================================================
echo.

:: ── Use JDK 23 (required for Maven + Spring Boot 3.2.4 with Java 21 target) ──
set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "PATH=%JAVA_HOME%\bin;%PATH%"

:: Verify JDK 23 exists
if not exist "%JAVA_HOME%\bin\java.exe" (
    echo  [ERROR] JDK 23 not found at: %JAVA_HOME%
    echo  Please install JDK 23 or update JAVA_HOME in this file.
    pause
    exit /b 1
)

echo  [OK] Using Java:
java -version 2>&1 | findstr /i "version"
echo.

:: ── Kill stale processes ─────────────────────────────────────────────────────
echo  [INFO] Clearing stale processes on ports 8081 and 5173...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%p /F /T >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%p /F /T >nul 2>&1
)

:: ── Check .env files ──────────────────────────────────────────────────────────
if not exist "%~dp0backend\.env" (
    echo  [ERROR] backend\.env file is missing!
    pause
    exit /b 1
)

:: ── Check Node.js ─────────────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed or not on PATH.
    pause
    exit /b 1
)

:: ── Install frontend dependencies if needed ────────────────────────────────────
if not exist "%~dp0frontend\node_modules" (
    echo  [INFO] Installing frontend dependencies - first-time setup...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
)

:: ── Build the backend JAR (compile + package, skip tests) ─────────────────────
echo.
echo  [INFO] Building backend JAR (this may take 30-60 seconds first time)...
echo         Using bundled Maven: backend\apache-maven-3.9.6
echo.

set "MVN=%~dp0backend\apache-maven-3.9.6\bin\mvn.cmd"
if not exist "%MVN%" (
    echo  [ERROR] Bundled Maven not found at backend\apache-maven-3.9.6\bin\mvn.cmd
    echo  Make sure the apache-maven-3.9.6 folder is in the backend directory.
    pause
    exit /b 1
)

:: Run the Maven build in the backend directory, piping output so we see errors
cd /d "%~dp0backend"
call "%MVN%" package -DskipTests -q
if %ERRORLEVEL% neq 0 (
    echo.
    echo  [ERROR] Maven build FAILED. Run the following to see detailed errors:
    echo          cd backend
    echo          apache-maven-3.9.6\bin\mvn.cmd package -DskipTests
    echo.
    pause
    exit /b 1
)

:: ── Find the built JAR ────────────────────────────────────────────────────────
set "JAR_FILE=%~dp0backend\target\citywatch-backend-0.0.1-SNAPSHOT.jar"
if not exist "%JAR_FILE%" (
    echo  [ERROR] JAR not found at: %JAR_FILE%
    echo  Check that the Maven build succeeded.
    pause
    exit /b 1
)
echo  [OK] JAR built successfully: citywatch-backend-0.0.1-SNAPSHOT.jar

:: ── Launch Backend via java -jar (bypasses Maven/JDK version conflicts) ────────
echo.
echo  [INFO] Starting CityWatch Backend on port 8081...
start "CityWatch Backend" /D "%~dp0backend" cmd /k "set JAVA_HOME=%JAVA_HOME% && set PATH=%JAVA_HOME%\bin;%PATH% && echo Starting CityWatch Backend... && java -jar target\citywatch-backend-0.0.1-SNAPSHOT.jar || pause"

:: ── Wait for backend warm-up ──────────────────────────────────────────────────
echo  [INFO] Waiting 20 seconds for backend to initialize (DB connect + seed)...
ping -n 21 127.0.0.1 >nul

:: ── Launch Frontend ────────────────────────────────────────────────────────────
echo  [INFO] Starting CityWatch Frontend...
start "CityWatch Frontend" /D "%~dp0frontend" cmd /k "npm run dev || pause"

:: ── Summary ───────────────────────────────────────────────────────────────────
echo.
echo  =====================================================
echo   Both servers are starting in separate windows.
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8081
echo   Health:    http://localhost:8081/actuator/health
echo.
echo   Admin Login:       admin@citywatch.in  /  Admin@123
echo   Coordinator Login: ravi@citywatch.in   /  Admin@123
echo  =====================================================
echo.
echo  [TIP] If the backend window shows an error, check:
echo    1. backend\.env has correct DB_URL, DB_PASSWORD, CW_JWT_SECRET
echo    2. Run the SQL migration: database\schema_migration.sql in Supabase
echo.
pause

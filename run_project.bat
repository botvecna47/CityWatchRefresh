@echo off
set "PROJECT_ROOT=%~dp0"
set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [CityWatch] Checking for stale processes...

:: Kill anything on backend port 8081
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING" 2^>nul') do (
    echo [CityWatch] Killing stale process on port 8081 (PID %%p)
    taskkill /PID %%p /F >nul 2>&1
)

:: Kill anything on frontend port 5173
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING" 2^>nul') do (
    echo [CityWatch] Killing stale process on port 5173 (PID %%p)
    taskkill /PID %%p /F >nul 2>&1
)

echo [CityWatch] Starting Backend (JDK 23, port 8081)...
start "CityWatch Backend" cmd /k "set JAVA_HOME=C:\Program Files\Java\jdk-23 && set PATH=%JAVA_HOME%\bin;%PATH% && cd /d %PROJECT_ROOT%backend && .\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"

timeout /t 3 /nobreak >nul

echo [CityWatch] Starting Frontend (Vite, port 5173)...
start "CityWatch Frontend" cmd /k "cd /d %PROJECT_ROOT%frontend && npm run dev"

echo.
echo [CityWatch] Both services are starting in separate windows.
echo   Backend:  http://localhost:8081
echo   Frontend: http://localhost:5173
echo.

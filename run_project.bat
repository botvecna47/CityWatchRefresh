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

echo [CityWatch] Starting Backend (JDK 23)...
start "CityWatch Backend" /D "%PROJECT_ROOT%backend" cmd /k ".\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.datasource.url=jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require -Dspring.datasource.username=postgres.axtcsaknntdxhzxwzvmo -Dspring.datasource.password=botvecna@47 -Djwt.secret=cOJnbZHo26X7O9lNvEIPd5yuuAYa2Am9aWiUuE96XgZfSD0Wpp98tRMMRTvCWyRS""

:: Wait a moment for backend to initialize
echo [CityWatch] Waiting for backend to warm up...
ping -n 6 127.0.0.1 >nul

echo [CityWatch] Starting Frontend (Vite)...
start "CityWatch Frontend" /D "%PROJECT_ROOT%frontend" cmd /k "echo Starting Frontend... && npm run dev"

echo.
echo [CityWatch] Both services have been launched in separate windows.
echo   - Check the "CityWatch Backend" window for Spring Boot logs.
echo   - Check the "CityWatch Frontend" window for Vite logs.
echo.
echo   Backend URL:  http://localhost:8081
echo   Frontend URL: http://localhost:5173
echo.
pause

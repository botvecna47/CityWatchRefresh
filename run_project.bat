@echo off
set "PROJECT_ROOT=%~dp0"
set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [CityWatch] Checking for stale processes...

:: Kill old windows
taskkill /FI "WINDOWTITLE eq CityWatch Backend" /F /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq CityWatch Frontend" /F /T >nul 2>&1

:: Kill anything on port 8081
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING" 2^>nul') do (
    echo [CityWatch] Killing stale process on port 8081 (PID %%p)
    taskkill /PID %%p /F /T >nul 2>&1
)

:: Kill anything on port 5173
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING" 2^>nul') do (
    echo [CityWatch] Killing stale process on port 5173 (PID %%p)
    taskkill /PID %%p /F /T >nul 2>&1
)

:: ── Write run_backend.bat ─────────────────────────────────────────────────
echo [CityWatch] Preparing backend launcher...
(
    echo @echo off
    echo set "JAVA_HOME=C:\Program Files\Java\jdk-23"
    echo set "PATH=%%JAVA_HOME%%\bin;%%PATH%%"
    echo echo.
    echo echo ============================================
    echo echo   CityWatch Backend
    echo echo   URL: http://localhost:8081
    echo echo   Log: backend\backend.log
    echo echo ============================================
    echo echo.
    echo for /f "tokens=5" %%%%p in ^('netstat -ano ^^^| findstr ":8081" ^^^| findstr "LISTENING" 2^^^>nul'^) do ^(
    echo     echo [CityWatch] Force killing process on port 8081 ^(PID %%%%p^)
    echo     taskkill /PID %%%%p /F /T ^>nul 2^>^&1
    echo ^)
    echo echo.
    echo .\\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
    echo echo.
    echo if %%ERRORLEVEL%% NEQ 0 (
    echo   echo ============================================
    echo   echo   BACKEND CRASHED - scroll up for errors
    echo   echo ============================================
    echo ^)
    echo pause
) > "%PROJECT_ROOT%backend\run_backend.bat"

echo [CityWatch] Starting Backend...
start "CityWatch Backend" /D "%PROJECT_ROOT%backend" cmd /k "run_backend.bat"

:: Wait for backend to warm up
echo [CityWatch] Waiting for backend to warm up (15 seconds)...
ping -n 16 127.0.0.1 >nul

:: ── Write run_frontend.bat ────────────────────────────────────────────────
echo [CityWatch] Preparing frontend launcher...
(
    echo @echo off
    echo echo.
    echo echo ============================================
    echo echo   CityWatch Frontend
    echo echo   URL: http://localhost:5173
    echo echo ============================================
    echo echo.
    echo npm run dev
    echo pause
) > "%PROJECT_ROOT%frontend\run_frontend.bat"

echo [CityWatch] Starting Frontend...
start "CityWatch Frontend" /D "%PROJECT_ROOT%frontend" cmd /k "run_frontend.bat"

echo.
echo [CityWatch] Both services launched.
echo   Backend:  http://localhost:8081
echo   Frontend: http://localhost:5173
echo   Login:    admin@citywatch.in / Admin@123
echo.
pause

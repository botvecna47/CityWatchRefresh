@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo.
echo ============================================
echo   CityWatch Backend
echo   URL: http://localhost:8081
echo   Log: backend\backend.log
echo ============================================
echo.
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING" 2^>nul') do (
    echo [CityWatch] Force killing process on port 8081 (PID %%p)
    taskkill /PID %%p /F /T >nul 2>&1
)
echo.
.\\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
echo.
if %ERRORLEVEL% NEQ 0 (
  echo ============================================
  echo   BACKEND CRASHED - scroll up for errors
  echo ============================================
)
pause

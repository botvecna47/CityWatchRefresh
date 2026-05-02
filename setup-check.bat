@echo off
title CityWatch — Dependency Check & Setup
color 0B

echo.
echo  =====================================================
echo   CityWatch — First-Time Setup Checker
echo  =====================================================
echo.

set "ALL_OK=1"

REM ── Java 23 ───────────────────────────────────────────────────────────────
echo  Checking Java 23...
if exist "C:\Program Files\Java\jdk-23\bin\java.exe" (
    echo  [OK] JDK 23 found.
) else (
    echo  [MISSING] JDK 23 not found.
    echo           Download: https://www.oracle.com/java/technologies/downloads/#java23
    set "ALL_OK=0"
)
echo.

REM ── Node.js ───────────────────────────────────────────────────────────────
echo  Checking Node.js...
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do (
        echo  [OK] Node.js %%i found.
    )
) else (
    echo  [MISSING] Node.js not found.
    echo           Download: https://nodejs.org/en/download  ^(LTS version^)
    set "ALL_OK=0"
)
echo.

REM ── Git ───────────────────────────────────────────────────────────────────
echo  Checking Git...
where git >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('git --version') do echo  [OK] %%i
) else (
    echo  [MISSING] Git not found.
    echo           Download: https://git-scm.com/download/win
    set "ALL_OK=0"
)
echo.

REM ── .env files ────────────────────────────────────────────────────────────
echo  Checking .env files...
if exist "%~dp0backend\.env" (
    echo  [OK] backend\.env exists.
) else (
    echo  [MISSING] backend\.env not found.
    echo           Copy backend\.env.example to backend\.env and fill in the secrets.
    set "ALL_OK=0"
)

if exist "%~dp0frontend\.env" (
    echo  [OK] frontend\.env exists.
) else (
    echo  [MISSING] frontend\.env not found.
    echo           Copy frontend\.env.example to frontend\.env and fill in the Supabase keys.
    set "ALL_OK=0"
)
echo.

REM ── npm install ───────────────────────────────────────────────────────────
echo  Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% equ 0 (
    echo  [OK] npm install complete.
) else (
    echo  [ERROR] npm install failed.
    set "ALL_OK=0"
)
cd /d "%~dp0"
echo.

REM ── Final summary ──────────────────────────────────────────────────────────
if "%ALL_OK%"=="1" (
    echo  =====================================================
    echo   All dependencies are installed!
    echo   Run run.bat to start the project.
    echo  =====================================================
) else (
    echo  =====================================================
    echo   Some dependencies are missing. Please install them
    echo   and then run this script again.
    echo  =====================================================
)
echo.
pause

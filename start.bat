@echo off
chcp 65001 >nul 2>&1
title CF Daily Grind
setlocal enabledelayedexpansion

:: ═══════════════════════════════════════════════════════════════
::  CF Daily Grind — Windows Startup Script
::  Handles ALL initialization: deps, dirs, port, server, browser
:: ═══════════════════════════════════════════════════════════════

echo.
echo   ╔═══════════════════════════════════════╗
echo   ║       CF Daily Grind — Starting       ║
echo   ╚═══════════════════════════════════════╝
echo.

:: ── Navigate to script directory ────────────────────────────────
cd /d "%~dp0"

:: ── Step 1: Find Python ─────────────────────────────────────────
echo   [1/5] Checking Python...

set PYTHON=
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON=python
) else (
    where python3 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set PYTHON=python3
    ) else (
        where py >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            set PYTHON=py -3
        )
    )
)

if not defined PYTHON (
    echo   [ERROR] Python 3 is not installed or not in PATH.
    echo.
    echo   Download from: https://python.org/downloads
    echo   Make sure to check "Add Python to PATH" during install.
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('%PYTHON% --version 2^>^&1') do set PY_VERSION=%%v
echo   [OK] Found: %PYTHON% (%PY_VERSION%)

:: ── Step 2: Verify required files ───────────────────────────────
echo   [2/5] Verifying project files...

set MISSING=0
for %%F in (server.py index.html app.js styles.css lc_schedule.json) do (
    if not exist "%%F" (
        echo   [MISS] %%F
        set MISSING=1
    )
)

if %MISSING% EQU 1 (
    echo   [ERROR] Required files are missing.
    pause
    exit /b 1
)

echo   [OK] All required files present

:: ── Step 3: Ensure directories exist ────────────────────────────
echo   [3/5] Setting up directories...

if not exist "user_code" mkdir "user_code"
if not exist "lc_cache" mkdir "lc_cache"
echo   [OK] user_code\ and lc_cache\ ready

:: ── Step 4: Kill existing server on port 8080 ───────────────────
echo   [4/5] Checking port 8080...

set PORT=8080
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| find ":%PORT%" ^| find "LISTENING"') do (
    if %%a NEQ 0 (
        taskkill /F /PID %%a >nul 2>&1
        echo   [!!] Killed existing process on port %PORT% ^(PID %%a^)
    )
)

echo   [OK] Port %PORT% is available

:: ── Step 5: Launch server ───────────────────────────────────────
echo   [5/5] Launching server...
echo.
echo   ═══════════════════════════════════════
echo     URL:   http://localhost:%PORT%
echo     Dir:   %CD%
echo     Stop:  Press Ctrl+C
echo   ═══════════════════════════════════════
echo.

%PYTHON% server.py
pause

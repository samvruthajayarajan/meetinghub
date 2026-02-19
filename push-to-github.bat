@echo off
echo ========================================
echo MeetingHub - Push to GitHub
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo Then run this script again.
    pause
    exit /b 1
)

echo Git is installed. Proceeding...
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Check if git repo exists
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git branch -M main
    git remote add origin https://github.com/samvruthajayarajan/Meetinghub.git
    echo.
)

echo Adding all files...
git add .
echo.

echo Committing changes...
git commit -m "feat: Redesigned auth pages with modern dark UI and purple-blue gradients"
echo.

echo Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Changes pushed to GitHub
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR: Push failed
    echo ========================================
    echo.
    echo This might be because:
    echo 1. You need to authenticate with GitHub
    echo 2. The remote repository already has different content
    echo 3. You don't have write access to the repository
    echo.
    echo Try running: git push -u origin main --force
    echo WARNING: Force push will overwrite remote repository!
)

echo.
pause

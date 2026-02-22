@echo off
REM Cleanup script for temporary PDFs
REM Run this script periodically (e.g., daily) to clean up old PDFs

echo Starting PDF cleanup...
curl -X GET http://localhost:3000/api/cleanup-temp-pdfs
echo.
echo Cleanup completed!

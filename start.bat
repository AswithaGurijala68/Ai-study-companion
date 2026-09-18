@echo off
echo ====================================================
echo Starting StudyFlow AI - AI Study Companion Workspace
echo ====================================================

start cmd /k "cd server && node server.js"
start cmd /k "cd client && npm run dev"

echo Backend API starting on http://localhost:5000
echo Frontend UI starting on http://localhost:5173
echo ====================================================

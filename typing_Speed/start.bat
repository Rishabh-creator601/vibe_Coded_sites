@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
echo Starting Typing Speed: client on http://localhost:3000, API on http://localhost:5000
call npm run dev

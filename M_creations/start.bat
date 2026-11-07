@echo off
setlocal
cd /d "%~dp0"

if not exist server\node_modules (
  echo Installing server packages...
  pushd server && call npm install && popd
)
if not exist client\node_modules (
  echo Installing website packages...
  pushd client && call npm install && popd
)

if not exist server\.env (
  copy server\.env.example server\.env >nul
  echo Created server\.env. Set your own ADMIN_EMAIL and ADMIN_PASSWORD there, then run this again.
  pause
  exit /b 1
)

pushd server
call npm run seed
if errorlevel 1 (
  popd
  echo Could not set up the database. Check that MongoDB is running.
  pause
  exit /b 1
)
popd

start "M Creations API" cmd /k "cd /d %~dp0server && npm run dev"
start "M Creations website" cmd /k "cd /d %~dp0client && npm run dev"
echo The site will open at http://localhost:3100
timeout /t 6 >nul
start http://localhost:3100

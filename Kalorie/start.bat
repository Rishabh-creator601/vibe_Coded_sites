@echo off
rem Starts KALORIE locally: the Express API (http://localhost:5000) and the
rem Vite client (http://localhost:5173), each in its own window.
rem Installs dependencies the first time it runs.
setlocal
set "ROOT=%~dp0"

if not exist "%ROOT%server\node_modules" (
  echo Installing Kalorie server dependencies...
  call npm install --prefix "%ROOT%server" || goto :fail
)
if not exist "%ROOT%client\node_modules" (
  echo Installing Kalorie client dependencies...
  call npm install --prefix "%ROOT%client" || goto :fail
)

start "Kalorie API (5000)" /D "%ROOT%server" cmd /k npm run dev
start "Kalorie client (5173)" /D "%ROOT%client" cmd /k npm run dev

echo Kalorie starting: open http://localhost:5173
exit /b 0

:fail
echo Kalorie: npm install failed.
pause
exit /b 1

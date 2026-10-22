@echo off
rem Starts Saffron & Steam locally: the Next.js web app (http://localhost:3000)
rem in its own window. Installs dependencies the first time it runs.
setlocal
set "ROOT=%~dp0"

rem Also checks the workspace link: it breaks if the folder is copied or moved.
if not exist "%ROOT%node_modules\@saffron\shared\package.json" (
  echo Installing Saffron ^& Steam dependencies...
  pushd "%ROOT%"
  call npm install
  if errorlevel 1 ( popd & goto :fail )
  popd
)

start "Saffron & Steam web (3000)" /D "%ROOT%apps\web" cmd /k npm run dev

echo Saffron ^& Steam starting: open http://localhost:3000
exit /b 0

:fail
echo Saffron ^& Steam: npm install failed.
pause
exit /b 1

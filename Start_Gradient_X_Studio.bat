@echo off
title Gradient X Studio Launcher
echo ===================================================
echo        Starting Gradient X Studio...
echo ===================================================
echo.
echo Opening browser at http://localhost:3000 ...
start http://localhost:3000
echo.
echo Launching development server...
cmd /c npm run dev
pause

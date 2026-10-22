@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Starting backend (Spring Boot, port 8080)...
start "Backend - Spring Boot" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

echo Starting frontend (Vite, port 5173)...
start "Frontend - Vite" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting for the servers to start...
timeout /t 40 /nobreak >nul
start "" http://localhost:5173

echo.
echo Done. Keep the two black windows open while you use the site.
echo To stop: close the two windows.
pause

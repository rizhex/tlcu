@echo off
chcp 65001 > nul
title TLcu - Iniciar Proyecto
color 0A

echo ============================================
echo           TLcu - SISTEMA DE DICCIONARIOS
echo ============================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado o no está en el PATH.
    echo Por favor, instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm está instalado
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm no está instalado.
    pause
    exit /b 1
)

echo [1/3] Verificando estructura del proyecto...
if not exist "tlcu.server" (
    echo ERROR: No se encuentra la carpeta tlcu.server
    echo Asegúrate de que el proyecto esté en la misma carpeta que este script.
    pause
    exit /b 1
)

if not exist "tlcu.client" (
    echo ERROR: No se encuentra la carpeta tlcu.client
    echo Asegúrate de que el proyecto esté en la misma carpeta que este script.
    pause
    exit /b 1
)

echo [2/3] Verificando dependencias...
if not exist "tlcu.server\node_modules" (
    echo ADVERTENCIA: El backend no tiene dependencias instaladas.
    echo Debes ejecutar manualmente en la carpeta tlcu.server:
    echo   npm install
    echo.
)

if not exist "tlcu.client\node_modules" (
    echo ADVERTENCIA: El frontend no tiene dependencias instaladas.
    echo Debes ejecutar manualmente en la carpeta tlcu.client:
    echo   npm install
    echo.
)

echo [3/3] Iniciando servidores...
echo.
echo ============================================
echo IMPORTANTE:
echo Se abrirán DOS ventanas de comandos:
echo 1. Backend (puerto 3001)
echo 2. Frontend (puerto 3000)
echo.
echo Además, se abrirá tu navegador con la aplicación.
echo.
echo Mantén las ventanas de comandos abiertas mientras uses el sistema.
echo ============================================
echo.
echo Presiona una tecla para continuar...
pause >nul

REM Iniciar backend en una nueva ventana
start "TLcu Backend" cmd /k "cd /d %CD%\tlcu.server && echo Iniciando backend TLcu... && echo Puerto: 3001 && echo URL API: http://localhost:3001 && echo. && npm run start:dev"

REM Esperar 5 segundos para que el backend inicie completamente
echo.
echo Esperando a que el backend se inicie (5 segundos)...
timeout /t 5 /nobreak >nul

REM Iniciar frontend en una nueva ventana
start "TLcu Frontend" cmd /k "cd /d %CD%\tlcu.client && echo Iniciando frontend TLcu... && echo Puerto: 3000 && echo URL: http://localhost:3000 && echo. && npm run dev"

REM Esperar 8 segundos para que el frontend inicie
echo.
echo Esperando a que el frontend se inicie (8 segundos)...
timeout /t 8 /nobreak >nul

REM Abrir el navegador con la URL del frontend
echo.
echo Abriendo navegador con la aplicación TLcu...
start "" "http://localhost:3000"

echo.
echo ============================================
echo ¡Servidores iniciados!
echo.
echo Accede al sistema en: http://localhost:3000
echo Backend API en: http://localhost:3001
echo.
echo El navegador se ha abierto automáticamente.
echo Si no se abre, copia la URL manualmente.
echo.
echo Presiona una tecla para cerrar este mensaje...
pause >nul
@echo off
chcp 65001 > nul
title TLcu - Actualizar Proyecto
color 0B

echo ============================================
echo           TLcu - ACTUALIZAR PROYECTO
echo ============================================
echo.

REM Verificar si Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git no está instalado o no está en el PATH.
    echo Por favor, instala Git desde: https://git-scm.com/
    pause
    exit /b 1
)

echo [1/4] Verificando estado del repositorio...
git status
echo.

set /p CONFIRMAR="¿Continuar con la actualización? (s/n): "
if /i not "%CONFIRMAR%"=="s" (
    echo Proceso cancelado por el usuario.
    pause
    exit /b 0
)

echo [2/4] Deteniendo servidores si están corriendo...
taskkill /F /IM node.exe >nul 2>nul
echo Servidores detenidos (si estaban corriendo).
timeout /t 2 /nobreak >nul

echo [3/4] Actualizando proyecto desde GitHub...
echo.
git pull -b dev https://github.com/rizhex/tlcu/

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo actualizar desde GitHub.
    echo Posibles causas:
    echo 1. Problemas de conexión a Internet
    echo 2. Conflictos en los archivos
    echo 3. Repositorio no configurado
    echo.
    echo Verifica que el repositorio remoto esté configurado correctamente.
    pause
    exit /b 1
)

echo.
echo [4/4] Verificando cambios en dependencias...
echo.
echo ============================================
echo ¡PROYECTO ACTUALIZADO EXITOSAMENTE!
echo.
echo Cambios realizados:
echo 1. Código actualizado desde GitHub (rama dev)
echo 2. Servidores detenidos (si estaban corriendo)
echo.
echo NOTA IMPORTANTE:
echo Si el proyecto incluye cambios en package.json,
echo debes instalar/actualizar las dependencias manualmente:
echo.
echo Para el backend (tlcu.server):
echo   cd tlcu.server
echo   npm install
echo.
echo Para el frontend (tlcu.client):
echo   cd tlcu.client
echo   npm install
echo.
echo Después, ejecuta "iniciar_proyecto.bat" para usar la versión actualizada.
echo ============================================
echo.
echo Presiona una tecla para cerrar...
pause >nul

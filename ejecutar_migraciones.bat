
@echo off
chcp 65001 > nul
title TLcu - Ejecutar Migraciones de Base de Datos
color 0C

echo ============================================
echo      TLcu - MIGRACIONES DE BASE DE DATOS
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

echo [1/4] Verificando estructura del proyecto...
if not exist "tlcu.server" (
    echo ERROR: No se encuentra la carpeta tlcu.server
    echo Asegúrate de que el proyecto esté en la misma carpeta que este script.
    pause
    exit /b 1
)

echo [2/4] Verificando dependencias del backend...
if not exist "tlcu.server\node_modules" (
    echo ERROR: El backend no tiene dependencias instaladas.
    echo.
    echo Debes instalar las dependencias primero:
    echo 1. Ejecuta "Instalar Dependencias TLcu" desde el escritorio
    echo 2. O ejecuta manualmente: cd tlcu.server && npm install
    echo.
    pause
    exit /b 1
)

echo [3/4] Verificando archivo package.json...
if not exist "tlcu.server\package.json" (
    echo ERROR: No se encuentra package.json en tlcu.server
    echo El proyecto podría estar corrupto.
    pause
    exit /b 1
)

echo [4/4] Ejecutando migraciones de base de datos...
echo.
echo IMPORTANTE:
echo 1. Este proceso actualizará la estructura de la base de datos.
echo 2. Asegúrate de tener una copia de seguridad si es necesario.
echo 3. El backend debe estar DETENIDO durante este proceso.
echo.
echo Verificando si el backend está corriendo...
tasklist /FI "WINDOWTITLE eq TLcu Backend*" 2>nul | find /i "node.exe" >nul
if %errorlevel% equ 0 (
    echo.
    echo ADVERTENCIA: El backend está corriendo.
    echo.
    echo ¿Quieres detenerlo automáticamente?
    set /p DETENER="(S/N): "
    if /i "%DETENER%"=="S" (
        echo Deteniendo backend...
        taskkill /F /FI "WINDOWTITLE eq TLcu Backend*" >nul 2>nul
        timeout /t 3 /nobreak >nul
        echo Backend detenido.
    ) else (
        echo Debes detener manualmente el backend antes de continuar.
        echo Busca la ventana "TLcu Backend" y ciérrala.
        pause
        exit /b 1
    )
)

echo.
echo ============================================
echo EJECUTANDO MIGRACIONES...
echo ============================================
echo.

cd /d "tlcu.server"

REM Ejecutar migraciones
echo Ejecutando: npm run migrations:run
echo.
npm run migrations:run

if %errorlevel% neq 0 (
    echo.
    echo ============================================
    echo ERROR: Las migraciones fallaron.
    echo ============================================
    echo.
    echo Posibles causas:
    echo 1. Problemas de conexión a la base de datos
    echo 2. Configuración incorrecta en .env
    echo 3. Conflictos con migraciones anteriores
    echo.
    echo Verifica:
    echo 1. Que la base de datos esté disponible
    echo 2. Que el archivo .env tenga la configuración correcta
    echo 3. Los logs de error arriba
    cd ..
    pause
    exit /b 1
)

echo.
echo ============================================
echo ¡MIGRACIONES COMPLETADAS EXITOSAMENTE!
echo ============================================
echo.
echo La estructura de la base de datos ha sido actualizada.
echo.
echo Ahora puedes:
echo 1. Ejecutar "Ejecutar Seed Admin" para crear usuarios iniciales
echo 2. O iniciar el sistema con "Iniciar TLcu"
echo.
cd ..
echo Presiona una tecla para cerrar...
pause >nul

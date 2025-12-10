@echo off
chcp 65001 > nul
title TLcu - Ejecutar Seed Admin (Usuario Administrador)
color 0D

echo ============================================
echo     TLcu - SEED ADMIN (USUARIO INICIAL)
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

echo [4/4] Ejecutando seed para crear usuario administrador...
echo.
echo IMPORTANTE:
echo 1. Este proceso creará un usuario administrador inicial.
echo 2. Las migraciones deben estar ejecutadas primero.
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
echo CREANDO USUARIO ADMINISTRADOR...
echo ============================================
echo.

cd /d "tlcu.server"

REM Preguntar por credenciales personalizadas
echo ¿Quieres usar credenciales personalizadas para el admin?
echo (Deja en blanco para usar las credenciales por defecto)
echo.
set /p CUSTOM="Usar credenciales personalizadas? (S/N): "

if /i "%CUSTOM%"=="S" (
    echo.
    echo Ingresa las credenciales para el usuario administrador:
    set /p ADMIN_EMAIL="Email (ej: admin@tlcu.com): "
    set /p ADMIN_USERNAME="Username (ej: admin): "
    set /p ADMIN_PASSWORD="Password (mínimo 6 caracteres): "
    
    echo.
    echo Credenciales a usar:
    echo Email: %ADMIN_EMAIL%
    echo Username: %ADMIN_USERNAME%
    echo.
    
    set "ENV_VARS=ADMIN_EMAIL=%ADMIN_EMAIL% ADMIN_USERNAME=%ADMIN_USERNAME% ADMIN_PASSWORD=%ADMIN_PASSWORD% "
)

REM Ejecutar seed admin
echo.
echo Ejecutando: %ENV_VARS%npm run seed:admin
echo.
%ENV_VARS%npm run seed:admin

if %errorlevel% neq 0 (
    echo.
    echo ============================================
    echo ERROR: El seed admin falló.
    echo ============================================
    echo.
    echo Posibles causas:
    echo 1. Las migraciones no están ejecutadas
    echo 2. Problemas de conexión a la base de datos
    echo 3. El usuario admin ya existe
    echo 4. Configuración incorrecta en .env
    echo.
    echo Verifica:
    echo 1. Que hayas ejecutado las migraciones primero
    echo 2. Que la base de datos esté disponible
    echo 3. Los logs de error arriba
    cd ..
    pause
    exit /b 1
)

echo.
echo ============================================
echo ¡SEED ADMIN COMPLETADO EXITOSAMENTE!
echo ============================================
echo.
echo Se ha creado el usuario administrador.
echo.
echo Credenciales por defecto (si no usaste personalizadas):
echo Email: admin@tlcu.com
echo Username: admin
echo Password: admin123
echo.
echo NOTA: Cambia la contraseña después del primer login.
echo.
echo Ahora puedes iniciar el sistema con "Iniciar TLcu"
echo.
cd ..
echo Presiona una tecla para cerrar...
pause >nul

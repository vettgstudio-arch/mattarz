@echo off
cls
echo ============================================================
echo    MATTARZ INVESTIMENTOS - Instalador Premium v2.0          
echo ============================================================
echo.

echo [INFO] Verificando Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Instalando Node.js...
    powershell -Command "Start-Process 'https://nodejs.org/'"
    pause
    exit /b 1
)

where pnpm >nul 2>nul
if errorlevel 1 (
    echo [AVISO] pnpm nao encontrado. Instalando globalmente...
    call npm install -g pnpm
)

echo [INFO] Instalando dependencias do projeto...
call pnpm install
if errorlevel 1 (
    echo [AVISO] pnpm install falhou, tentando com npm...
    call npm install
)

if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo [OK] Arquivo .env criado a partir do modelo (.env.example)
    ) else (
        echo PORT=3000 > .env
        echo NODE_ENV=development >> .env
        echo JWT_SECRET=chave-secreta-mattarz-investimentos-2024 >> .env
        echo [OK] Arquivo .env basico criado
    )
)

echo.
echo ============================================================
echo              INSTALACAO CONCLUIDA COM SUCESSO!             
echo ============================================================
echo.
echo Para iniciar o aplicativo:
echo   1. Execute: start.bat
echo.
pause

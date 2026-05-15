@echo off
cls
echo ============================================================
echo      MATTARZ INVESTIMENTOS - Sistema de Gestao Comercial    
echo ============================================================
echo.

REM Definir variaveis de ambiente
set NODE_ENV=development
set PORT=3000
set OAUTH_SERVER_URL=http://localhost:3000

where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js nao esta instalado!
    echo Por favor, instale Node.js em: https://nodejs.org/
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

echo [OK] Dependencias instaladas com sucesso!
echo.
echo [INFO] Abrindo o navegador em http://localhost:3000...
timeout /t 3 /nobreak
start http://localhost:3000

echo.
echo [INFO] Iniciando servidor de desenvolvimento...
echo [INFO] O banco de dados SQLite sera criado automaticamente.
echo.

call npx tsx watch server/_core/index.ts

echo.
echo [AVISO] Servidor encerrado.
pause

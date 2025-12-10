@echo off
REM ==============================================================================
REM Script para iniciar o servidor SISCOF evitando problemas de PowerShell
REM ==============================================================================

echo.
echo ====================================
echo SISCOF - Iniciando Servidor Local
echo ====================================
echo.

cd /d "d:\SISTEMA SISCOFNEWS 2025\nexus-culto-sync-main"

echo Verificando Node.js...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale em: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Iniciando servidor de desenvolvimento...
echo Acesse: http://localhost:5173
echo Pressione Ctrl+C para parar o servidor
echo.

npm run dev

pause

@echo off
echo ========================================
echo  SISCOF - Deploy Automatico
echo ========================================
echo.
echo Enviando mudancas para o site online...
echo.

cd /d "%~dp0"

git add .
git commit -m "Atualizar: Banner memorial Paulo Lucas + Paginas SISCOF"
git push

echo.
echo ========================================
echo  DEPLOY CONCLUIDO!
echo ========================================
echo.
echo Aguarde 3-5 minutos e acesse:
echo https://nexus-culto-sync.lovable.app/
echo.
pause

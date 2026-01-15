@echo off
REM Script para commit, push e deploy automático no Render via GitHub

echo Adicionando arquivos...
git add .

echo Fazendo commit...
git commit -m "Deploy automático para Render"

echo Enviando para o GitHub...
git push origin main

echo Se o Render estiver conectado ao GitHub, o deploy será iniciado automaticamente.
echo.
echo Pronto!
pause

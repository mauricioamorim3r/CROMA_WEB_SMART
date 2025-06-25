@echo off
echo ===============================================
echo   �� GIT UPDATE - VALIDADOR CROMATOGRAFIA
echo ===============================================
echo.

echo [1/4] Verificando mudanças...
git status

echo.
echo [2/4] Adicionando arquivos modificados...
git add .

echo.
echo [3/4] Criando commit...
set /p commit_msg="Digite a mensagem do commit: "
if "%commit_msg%"=="" set commit_msg="Atualização automática"
git commit -m "%commit_msg%"

echo.
echo [4/4] Enviando para repositório remoto...
git push origin main

echo.
echo ===============================================
echo   ✅ REPOSITÓRIO ATUALIZADO COM SUCESSO!
echo ===============================================
echo.
echo Para conectar a um repositório GitHub:
echo git remote add origin https://github.com/usuario/repo.git
echo git branch -M main
echo git push -u origin main
echo.
pause

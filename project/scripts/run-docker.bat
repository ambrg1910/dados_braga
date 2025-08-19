@echo off
setlocal

echo === Iniciando o Card Operations System com Docker ===

echo Verificando se o Docker esta instalado...
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Docker nao encontrado. Por favor, instale o Docker Desktop antes de continuar.
    echo Download: https://www.docker.com/products/docker-desktop
    exit /b 1
)

REM Ir para a raiz do projeto com base no caminho deste script
set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.."

REM Detectar comando do Compose (docker compose vs docker-compose)
for /f "tokens=*" %%i in ('docker compose version 2^>nul') do set "HAS_DOCKER_COMPOSE_SUBCMD=1"
if defined HAS_DOCKER_COMPOSE_SUBCMD (
    set "COMPOSE_CMD=docker compose"
) else (
    set "COMPOSE_CMD=docker-compose"
)

echo Iniciando os containers com %COMPOSE_CMD%...
%COMPOSE_CMD% up -d
if %ERRORLEVEL% neq 0 (
    echo Erro ao iniciar os containers. Verifique se o Docker esta em execucao e se o docker-compose.yml existe.
    popd
    exit /b 1
)

echo.
echo === Sistema iniciado com sucesso! ===
echo.
echo Acesse o sistema em: http://localhost:3000
echo.
echo Credenciais padrao:
echo   Usuario: admin
echo   Senha: admin123
echo.
echo Para parar o sistema, execute: %COMPOSE_CMD% down
echo.

popd

pause
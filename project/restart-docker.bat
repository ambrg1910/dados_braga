@echo off
echo Parando os containers Docker...
docker-compose down

echo Reiniciando o serviço Docker...
net stop com.docker.service
net start com.docker.service

echo Aguardando o Docker reiniciar (30 segundos)...
timeout /t 30 /nobreak

echo Iniciando os containers novamente...
docker-compose up -d

echo Processo concluído! Verifique se os containers estão funcionando corretamente.
docker ps
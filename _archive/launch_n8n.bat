@echo off
SET "PATH=%~dp0node_portable;%PATH%"
echo Démarrage de n8n...
"%~dp0node_portable\node.exe" -v
echo Lancement de n8n...
set N8N_HOST=127.0.0.1
set N8N_PORT=5678
set N8N_Listen_Address=127.0.0.1
set N8N_USER_FOLDER=%~dp0n8n_data
set N8N_LOG_LEVEL=debug
set N8N_RESTRICT_FILE_ACCESS_TO=C:\;C:/;%~dp0
echo Ouvre http://127.0.0.1:5678
"%~dp0node_portable\node.exe" "node_modules\n8n\bin\n8n" start
pause

@echo off
title KaoBot

REM Vérifie si le dossier .git existe
IF NOT EXIST .git (
    REM Si le dossier .git n'existe pas, initialise un nouveau dépôt Git
    "git_portable\git-bash.exe" -c "git init -b main"
    "git_portable\git-bash.exe" -c "git remote add origin https://github.com/ShalltearFR/TwitchBot-3.0.git"
) ELSE (
    REM Si le dossier .git existe, effectue un git pull
    "git_portable\git-bash.exe" -c "git pull https://github.com/ShalltearFR/TwitchBot-3.0.git"
    pause
    REM Démarrer le serveur Node.js
    node.exe server.js
)


pause

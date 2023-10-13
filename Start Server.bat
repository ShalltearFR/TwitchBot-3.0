@echo off
title KaoBot

echo "Recherche de mise a jour"
"git_portable\git-bash.exe" -c "git pull https://github.com/ShalltearFR/TwitchBot-3.0.git"

echo "Demarrage du bot"
node.exe server.js

pause
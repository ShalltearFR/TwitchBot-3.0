@echo off
title KaoBot

"git_portable\git-bash.exe" -c --hide "git pull https://github.com/ShalltearFR/TwitchBot-3.0.git" main

node.exe server.js

pause
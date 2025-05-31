@echo off
cd /d %~dp0\..
echo Starting OpenCode...
go run main.go %*

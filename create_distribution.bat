@echo off
echo Creating OpenCode Distribution Package...

REM Create distribution directory structure
if not exist distribution\bin mkdir distribution\bin
if not exist distribution\config mkdir distribution\config
if not exist distribution\docs mkdir distribution\docs

REM Copy files to distribution
echo Copying configuration files...
copy requirements.txt distribution\config\
copy .opencode.json distribution\config\

echo Copying documentation files...
copy README.md distribution\docs\

echo Creating distribution package...
powershell -Command "Compress-Archive -Path distribution\* -DestinationPath OpenCode-distribution.zip -Force"

echo Distribution package created: OpenCode-distribution.zip

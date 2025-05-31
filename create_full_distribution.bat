@echo off
echo Creating Full OpenCode Distribution Package...

REM Create distribution directory structure if it doesn't exist
if not exist distribution\bin mkdir distribution\bin
if not exist distribution\config mkdir distribution\config
if not exist distribution\docs mkdir distribution\docs
if not exist distribution\src mkdir distribution\src
if not exist distribution\logs mkdir distribution\logs

REM Copy core files
echo Copying main application files...
copy main.go distribution\src\
copy go.mod distribution\src\
copy go.sum distribution\src\
copy .gitignore distribution\src\

REM Copy config files
echo Copying configuration files...
copy requirements.txt distribution\config\
if exist .env copy .env distribution\config\
if exist .opencode.json copy .opencode.json distribution\config\

REM Copy documentation
echo Copying documentation...
copy README.md distribution\docs\
copy LICENSE distribution\

REM Create source code directories
mkdir distribution\src\cmd
mkdir distribution\src\internal

REM Copy essential source code 
echo Copying source code...
xcopy /E /I /Y cmd distribution\src\cmd
xcopy /E /I /Y internal distribution\src\internal

REM Create the zip package
echo Creating distribution package...
powershell -Command "Compress-Archive -Path distribution\* -DestinationPath OpenCode-full-distribution.zip -Force"

echo Distribution package created: OpenCode-full-distribution.zip
echo.
echo This package contains:
echo - Application source code
echo - Configuration files
echo - Documentation
echo - Installation and setup scripts
echo.
echo To use the distribution:
echo 1. Extract the zip file
echo 2. Run install.bat to set up dependencies
echo 3. Run OpenCode.bat to start the application

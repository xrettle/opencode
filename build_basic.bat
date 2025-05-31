@echo off
echo Basic OpenCode Build Script
echo =========================
echo.

REM Set variables
set OUTPUT_DIR=.
set EXE_NAME=opencode.exe

REM Clean previous build
if exist %EXE_NAME% del /f %EXE_NAME%

REM Build the executable
echo Building OpenCode executable...
go build -o %EXE_NAME% .

REM Check if build was successful
if exist %EXE_NAME% (
    echo.
    echo Build successful!
    echo Executable created: %EXE_NAME%
    
    REM Create distribution directory structure
    echo.
    echo Creating distribution structure...
    if not exist dist mkdir dist
    if not exist dist\bin mkdir dist\bin
    if not exist dist\config mkdir dist\config
    if not exist dist\docs mkdir dist\docs
    
    REM Copy executable to distribution
    copy %EXE_NAME% dist\bin\
    
    REM Copy config files
    if exist requirements.txt copy requirements.txt dist\config\
    if exist config.json copy config.json dist\config\
    
    REM Copy documentation
    if exist README.md copy README.md dist\docs\
    if exist LICENSE copy LICENSE dist\
    
    echo.
    echo Distribution package created in 'dist' directory
) else (
    echo.
    echo Build failed. No executable was created.
    exit /b 1
)

echo.
echo To run the application:
echo %EXE_NAME%

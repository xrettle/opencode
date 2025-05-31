@echo off
echo Building OpenCode Executable
echo =========================
echo.

REM Build the executable with optimizations
echo Building executable...
go build -ldflags="-s -w" -o opencode.exe .

REM Check if build was successful
if exist opencode.exe (
    echo.
    echo Build successful!
    echo Executable created: opencode.exe
    
    REM Get file size
    for %%A in (opencode.exe) do set size=%%~zA
    echo Size: %size% bytes
    
    REM Create distribution structure
    echo.
    echo Creating distribution structure...
    if not exist dist mkdir dist
    if not exist dist\bin mkdir dist\bin
    if not exist dist\config mkdir dist\config
    if not exist dist\docs mkdir dist\docs
    
    REM Copy executable and configuration files
    copy opencode.exe dist\bin\
    if exist requirements.txt copy requirements.txt dist\config\
    if exist README.md copy README.md dist\docs\
    
    echo.
    echo Distribution package created in 'dist' directory
) else (
    echo.
    echo Build failed. No executable was created.
    exit /b 1
)

echo.
echo To run the application:
echo dist\bin\opencode.exe

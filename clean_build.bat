@echo off
echo Clean OpenCode Build Script
echo =========================
echo.

REM Clean any previous build artifacts
if exist opencode.exe del /f opencode.exe

REM Build the executable with detailed output
echo Building OpenCode executable...
go build -v -o opencode.exe .
if %ERRORLEVEL% NEQ 0 (
    echo Build failed with error code %ERRORLEVEL%
    exit /b 1
)

REM Check if executable was created
if exist opencode.exe (
    echo.
    echo Build successful!
    echo Executable created: opencode.exe
    
    REM Get file size
    for %%A in (opencode.exe) do set size=%%~zA
    echo Size: !size! bytes
    
    REM Create dist directory
    if not exist dist mkdir dist
    if not exist dist\bin mkdir dist\bin
    
    REM Copy executable to dist
    copy opencode.exe dist\bin\
    echo Executable copied to dist\bin\opencode.exe
) else (
    echo.
    echo Build completed but executable was not found.
    exit /b 1
)

echo.
echo To run the application:
echo opencode.exe

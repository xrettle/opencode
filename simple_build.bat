@echo off
echo Simple OpenCode Build Script
echo ==========================
echo.

REM Create build directory if it doesn't exist
if not exist build mkdir build

REM Generate resource file if manifest exists
if exist opencode.manifest (
    echo Generating resource file...
    where rsrc >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        rsrc -manifest opencode.manifest -o rsrc.syso
        echo - Resource file generated
    ) else (
        echo - rsrc tool not found, skipping resource generation
    )
)

REM Build the executable
echo Building executable...
go build -ldflags="-s -w" -o build\opencode.exe .
if %ERRORLEVEL% NEQ 0 (
    echo Error: Build failed.
    exit /b 1
)

REM Check if build was successful
if exist build\opencode.exe (
    echo Build successful!
    echo Executable created at: build\opencode.exe
    
    REM Get file size
    for %%A in (build\opencode.exe) do set size=%%~zA
    echo Size: %size% bytes
) else (
    echo Error: Build failed to create executable.
    exit /b 1
)

echo.
echo To run the application:
echo build\opencode.exe

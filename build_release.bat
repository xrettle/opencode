@echo off
echo OpenCode Release Builder
echo ======================
echo.

setlocal enabledelayedexpansion

REM Set version
set VERSION=1.0.0

REM Check for required tools
echo Checking for required tools...

REM Check Go
where go >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Go not found in PATH.
    exit /b 1
)
echo - Go: Found

REM Check if rsrc is installed (for resource embedding)
where rsrc >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo - rsrc: Not found, installing...
    go install github.com/akavel/rsrc@latest
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install rsrc.
        exit /b 1
    )
    echo - rsrc: Installed
) else (
    echo - rsrc: Found
)

REM Create build directory
if not exist build mkdir build
echo.

REM Generate version resource
echo Generating resource file...
if exist icon.ico (
    rsrc -manifest opencode.manifest -ico icon.ico -o rsrc.syso
) else (
    echo - Warning: icon.ico not found, building without icon
    rsrc -manifest opencode.manifest -o rsrc.syso
)
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to generate resource file.
    exit /b 1
)
echo - Resource file generated successfully

REM Build executable
echo.
echo Building OpenCode executable...
go build -ldflags="-s -w -H=windowsgui" -o build\opencode.exe .
if %ERRORLEVEL% NEQ 0 (
    echo Error: Build failed.
    exit /b 1
)
echo - Executable built successfully

REM Check if UPX is available for compression
where upx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Compressing executable with UPX...
    upx -9 build\opencode.exe
    echo - Executable compressed
) else (
    echo - UPX not found, skipping compression
)

REM Create distribution package
echo.
echo Creating distribution package...
call create_full_distribution.bat
echo - Distribution package created

REM Check if Inno Setup is available
where iscc >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Creating installer with Inno Setup...
    
    REM Copy the executable to the correct location for Inno Setup
    copy build\opencode.exe .
    
    REM Run Inno Setup Compiler
    iscc opencode_installer.iss
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Installer creation failed.
        exit /b 1
    )
    echo - Installer created successfully in Output directory
) else (
    echo - Inno Setup not found, skipping installer creation
    echo - To create an installer, install Inno Setup from https://jrsoftware.org/isinfo.php
)

echo.
echo Build process completed successfully!
echo.
echo Release artifacts:
echo - Executable: build\opencode.exe
echo - Distribution Package: OpenCode-full-distribution.zip
if %ERRORLEVEL% EQU 0 (
    echo - Installer: Output\OpenCode_Setup.exe
)
echo.
echo Next steps:
echo 1. Test the application thoroughly
echo 2. Sign the executable and installer if distributing publicly
echo 3. Create release notes documenting changes and features

endlocal

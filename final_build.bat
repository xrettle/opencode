@echo off
setlocal enabledelayedexpansion

echo OpenCode Final Build Script
echo =========================
echo.

REM Set variables
set OUTPUT_DIR=dist\bin
set EXE_NAME=opencode.exe
set FULL_PATH=%OUTPUT_DIR%\%EXE_NAME%

REM Create output directory
if not exist %OUTPUT_DIR% mkdir %OUTPUT_DIR%

REM Build the executable with optimizations
echo Building OpenCode executable...
go build -ldflags="-s -w" -o %FULL_PATH% .
set BUILD_EXIT=%ERRORLEVEL%

REM Check build result
if %BUILD_EXIT% NEQ 0 (
    echo Build failed with error code %BUILD_EXIT%
    exit /b 1
)

REM Verify the executable exists
if exist %FULL_PATH% (
    echo.
    echo Build successful!
    echo Executable created at: %FULL_PATH%
    
    REM Get file size
    for %%A in (%FULL_PATH%) do set size=%%~zA
    echo Size: !size! bytes
    
    REM Create additional distribution directories
    if not exist dist\config mkdir dist\config
    if not exist dist\docs mkdir dist\docs
    if not exist dist\logs mkdir dist\logs
    
    REM Copy configuration files
    echo.
    echo Copying configuration files...
    if exist requirements.txt (
        copy requirements.txt dist\config\
        echo - requirements.txt copied
    )
    if exist config.json (
        copy config.json dist\config\
        echo - config.json copied
    )
    
    REM Copy documentation
    echo.
    echo Copying documentation...
    if exist README.md (
        copy README.md dist\docs\
        echo - README.md copied
    )
    if exist LICENSE (
        copy LICENSE dist\
        echo - LICENSE copied
    )
    
    REM Create launcher script
    echo.
    echo Creating launcher script...
    echo @echo off > dist\OpenCode.bat
    echo start "" "%%~dp0bin\%EXE_NAME%" %%* >> dist\OpenCode.bat
    echo - Launcher script created at dist\OpenCode.bat
    
    echo.
    echo Build and distribution process completed successfully!
    echo.
    echo To run the application:
    echo dist\OpenCode.bat
) else (
    echo.
    echo Build completed but executable was not found at %FULL_PATH%
    echo This might indicate a permissions issue or another process is locking the file.
    exit /b 1
)

endlocal

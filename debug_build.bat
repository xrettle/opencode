@echo off
echo OpenCode Debug Build Script
echo =========================
echo.

REM Set output paths
set OUTPUT_DIR=build
set EXE_NAME=opencode.exe
set FULL_PATH=%OUTPUT_DIR%\%EXE_NAME%

REM Create build directory if it doesn't exist
if not exist %OUTPUT_DIR% (
    mkdir %OUTPUT_DIR%
    echo Created output directory: %OUTPUT_DIR%
)

REM Clean any previous build artifacts
if exist %FULL_PATH% (
    del /f %FULL_PATH%
    echo Cleaned previous build artifacts
)

REM Check Go version
echo Checking Go installation...
go version
if %ERRORLEVEL% NEQ 0 (
    echo Error: Go is not installed or not in PATH
    exit /b 1
)

REM Check module dependencies
echo Checking module dependencies...
go mod tidy
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to tidy module dependencies
    exit /b 1
)

REM Build with verbose output and error reporting
echo Building OpenCode executable...
echo Command: go build -v -o %FULL_PATH% .
go build -v -o %FULL_PATH% . 2> build_errors.txt
if %ERRORLEVEL% NEQ 0 (
    echo Build failed with errors:
    type build_errors.txt
    exit /b 1
)

REM Check if executable was created
if exist %FULL_PATH% (
    echo.
    echo Build successful!
    echo Executable created at: %FULL_PATH%
    
    REM Get file size
    for %%A in (%FULL_PATH%) do set size=%%~zA
    echo Size: !size! bytes
) else (
    echo.
    echo Error: Build completed but executable was not created.
    echo This might indicate a configuration issue.
    exit /b 1
)

echo.
echo To run the application:
echo %FULL_PATH%

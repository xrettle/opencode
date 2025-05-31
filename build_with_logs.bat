@echo off
setlocal enabledelayedexpansion

echo OpenCode Build With Detailed Logging
echo ==================================
echo.

REM Set log file
set LOG_FILE=build_detailed.log

REM Clean previous log
if exist %LOG_FILE% del /f %LOG_FILE%

REM Log system information
echo === System Information === > %LOG_FILE%
echo Date and Time: %date% %time% >> %LOG_FILE%
echo Working Directory: %cd% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Check Go version
echo Checking Go installation...
go version
echo === Go Version === >> %LOG_FILE%
go version >> %LOG_FILE% 2>&1
echo. >> %LOG_FILE%

REM Check module dependencies
echo Checking module dependencies...
echo === Go Module Information === >> %LOG_FILE%
go mod tidy >> %LOG_FILE% 2>&1
echo Module: >> %LOG_FILE%
go list -m >> %LOG_FILE% 2>&1
echo. >> %LOG_FILE%

REM List Go files in current directory
echo === Go Files in Current Directory === >> %LOG_FILE%
dir *.go /b >> %LOG_FILE% 2>&1
echo. >> %LOG_FILE%

REM Check main package files
echo === Main Package Files === >> %LOG_FILE%
findstr /s /m "package main" *.go >> %LOG_FILE% 2>&1
echo. >> %LOG_FILE%

REM Build with verbose output
echo Building OpenCode executable...
echo === Building OpenCode (Verbose) === >> %LOG_FILE%
echo Command: go build -v -o opencode_build.exe . >> %LOG_FILE%
go build -v -o opencode_build.exe . >> %LOG_FILE% 2>&1
set BUILD_EXIT_CODE=%ERRORLEVEL%
echo Exit Code: %BUILD_EXIT_CODE% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Check if executable was created
echo === Checking for Executable === >> %LOG_FILE%
if exist opencode_build.exe (
    echo Executable found: opencode_build.exe >> %LOG_FILE%
    echo Size: >> %LOG_FILE%
    dir opencode_build.exe >> %LOG_FILE% 2>&1
    
    echo.
    echo Build successful!
    echo Executable created: opencode_build.exe
    
    REM Create dist directory
    if not exist dist mkdir dist
    if not exist dist\bin mkdir dist\bin
    
    REM Copy executable to dist
    copy opencode_build.exe dist\bin\opencode.exe
    echo Executable copied to dist\bin\opencode.exe
) else (
    echo No executable found >> %LOG_FILE%
    
    echo.
    echo Build failed to create executable.
    echo See %LOG_FILE% for details.
    exit /b 1
)

echo.
echo Build process completed. See %LOG_FILE% for detailed logs.
echo To run the application: dist\bin\opencode.exe

@echo off
echo Debugging OpenCode Build Process
echo ==============================
echo.

REM Set log file
set LOG_FILE=build_debug.log

REM Clear previous log
if exist %LOG_FILE% del /f %LOG_FILE%

REM Log system information
echo === System Information === > %LOG_FILE%
echo Date and Time: %date% %time% >> %LOG_FILE%
echo Working Directory: %cd% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Check Go version
echo === Go Version === >> %LOG_FILE%
go version >> %LOG_FILE% 2>&1
echo. >> %LOG_FILE%

REM Check module dependencies
echo === Go Module Information === >> %LOG_FILE%
go mod tidy >> %LOG_FILE% 2>&1
go list -m >> %LOG_FILE% 2>&1
echo. >> %LOG_FILE%

REM Build with verbose output
echo === Building OpenCode (Verbose) === >> %LOG_FILE%
echo Command: go build -v -x -o opencode_debug.exe . >> %LOG_FILE%
go build -v -x -o opencode_debug.exe . >> %LOG_FILE% 2>&1
echo Exit Code: %ERRORLEVEL% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Check if executable was created
echo === Checking for Executable === >> %LOG_FILE%
if exist opencode_debug.exe (
    echo Executable found: opencode_debug.exe >> %LOG_FILE%
    echo Size: >> %LOG_FILE%
    dir opencode_debug.exe >> %LOG_FILE% 2>&1
) else (
    echo No executable found >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM List files in current directory
echo === Files in Current Directory === >> %LOG_FILE%
dir >> %LOG_FILE% 2>&1
echo. >> %LOG_FILE%

echo Debug information has been written to %LOG_FILE%
echo Please check this file for detailed build process information.

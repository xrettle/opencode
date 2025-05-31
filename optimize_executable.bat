@echo off
echo OpenCode Executable Optimizer
echo ============================
echo.

REM Check if UPX is installed
where upx >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo UPX is not installed or not in PATH.
    echo Please install UPX from https://upx.github.io/ and add it to your PATH.
    echo.
    echo You can download UPX and extract it to a directory in your PATH,
    echo or place the upx.exe in the same directory as this script.
    exit /b 1
)

REM Check if executable exists
if not exist opencode.exe (
    echo Error: opencode.exe not found.
    echo Please build the executable first using:
    echo   go build -o opencode.exe .
    exit /b 1
)

REM Create backup
echo Creating backup of original executable...
copy opencode.exe opencode.exe.bak
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to create backup.
    exit /b 1
)

echo.
echo Original executable size:
for %%F in (opencode.exe) do echo %%~zF bytes

REM Compress with UPX
echo.
echo Compressing executable with UPX...
upx -9 opencode.exe

echo.
echo Optimized executable size:
for %%F in (opencode.exe) do echo %%~zF bytes

echo.
echo Optimization complete. A backup of the original executable has been saved as opencode.exe.bak

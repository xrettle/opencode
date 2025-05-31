@echo off
echo Installing OpenCode...

REM Check if Go is installed
where go >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Go is not installed or not in PATH.
    echo Please install Go 1.21.0 or later from https://golang.org/dl/
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH.
    echo Please install Python 3.9 or later from https://www.python.org/downloads/
    exit /b 1
)

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r config\requirements.txt

echo OpenCode installation complete!
echo You can now run the application using: bin\opencode.bat

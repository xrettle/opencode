@echo off
echo Setting up environment for OpenCode...

REM Check for Go installation
where go >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Go is not installed or not in PATH.
    echo Please install Go 1.21.0 or later from https://golang.org/dl/
    exit /b 1
)

REM Check Go version
for /f "tokens=3" %%g in ('go version') do set GOVERSION=%%g
echo Detected Go version: %GOVERSION%

REM Check for Python installation
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH.
    echo Please install Python 3.9 or later from https://www.python.org/downloads/
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%g in ('python --version 2^>^&1') do set PYVERSION=%%g
echo Detected Python version: %PYVERSION%

REM Create virtual environment (optional)
echo Creating Python virtual environment...
python -m venv env
call env\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r config\requirements.txt

REM Set up Go environment
echo Setting up Go environment...
go mod download

echo Environment setup complete!
echo You can now run OpenCode using the bin\opencode.bat script.

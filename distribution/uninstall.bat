@echo off
echo OpenCode Uninstaller
echo ===================
echo.

set INSTALL_DIR=%~dp0
echo Current installation directory: %INSTALL_DIR%
echo.

echo This will uninstall OpenCode from your system.
echo It will remove all application files but preserve your user data.
echo.
set /p CONFIRM=Are you sure you want to continue? (Y/N): 

if /i "%CONFIRM%" NEQ "Y" (
    echo.
    echo Uninstallation cancelled.
    exit /b 0
)

echo.
echo Uninstalling OpenCode...
echo.

REM Stop any running instances
taskkill /f /im opencode.exe >nul 2>&1

REM Remove executables and scripts
echo Removing application files...
if exist "%INSTALL_DIR%bin\opencode.exe" del /q "%INSTALL_DIR%bin\opencode.exe"
if exist "%INSTALL_DIR%OpenCode.bat" del /q "%INSTALL_DIR%OpenCode.bat"
if exist "%INSTALL_DIR%bin\opencode.bat" del /q "%INSTALL_DIR%bin\opencode.bat"

REM Remove directories but preserve user data
echo Removing application directories...
if exist "%INSTALL_DIR%bin" rd /s /q "%INSTALL_DIR%bin"
if exist "%INSTALL_DIR%docs" rd /s /q "%INSTALL_DIR%docs"
if exist "%INSTALL_DIR%src" rd /s /q "%INSTALL_DIR%src"

REM Optional: Clean up environment
echo Cleaning up environment...
REM Remove Python virtual environment if it exists
if exist "%INSTALL_DIR%env" (
    echo Removing virtual environment...
    rd /s /q "%INSTALL_DIR%env"
)

echo.
echo OpenCode has been uninstalled.
echo.
echo Your user data and configuration files have been preserved.
echo They can be found in the config directory if you wish to remove them manually.
echo.
echo Thank you for using OpenCode!
echo.

pause

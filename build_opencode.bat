@echo off
echo OpenCode Build and Distribution Script
echo ====================================
echo.

REM Set variables
set OUTPUT_DIR=dist\bin
set EXE_NAME=opencode.exe
set FULL_PATH=%OUTPUT_DIR%\%EXE_NAME%

REM Create distribution directory structure
echo Creating distribution structure...
if not exist dist mkdir dist
if not exist dist\bin mkdir dist\bin
if not exist dist\config mkdir dist\config
if not exist dist\docs mkdir dist\docs
if not exist dist\logs mkdir dist\logs
echo - Distribution directories created

REM Build the executable
echo.
echo Building OpenCode executable...
go build -o %FULL_PATH% .
if %ERRORLEVEL% NEQ 0 (
    echo - Build failed with error code %ERRORLEVEL%
    exit /b 1
)

REM Check if build was successful
if exist %FULL_PATH% (
    echo - Build successful!
    echo - Executable created at: %FULL_PATH%
    
    REM Get file size
    for %%A in (%FULL_PATH%) do set size=%%~zA
    echo - Size: %size% bytes
) else (
    echo - Build completed but executable was not found at %FULL_PATH%
    echo - This might indicate a permissions issue
    exit /b 1
)

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
if exist .env (
    copy .env dist\config\
    echo - .env copied
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
echo start "OpenCode" "%%~dp0bin\%EXE_NAME%" %%* >> dist\OpenCode.bat
echo - Launcher script created at dist\OpenCode.bat

REM Create installation script
echo.
echo Creating installation script...
echo @echo off > dist\install.bat
echo echo Setting up OpenCode environment... >> dist\install.bat
echo echo. >> dist\install.bat
echo if exist config\requirements.txt ( >> dist\install.bat
echo     echo Installing Python dependencies... >> dist\install.bat
echo     pip install -r config\requirements.txt >> dist\install.bat
echo     if %%ERRORLEVEL%% NEQ 0 ( >> dist\install.bat
echo         echo Error: Failed to install Python dependencies. >> dist\install.bat
echo         exit /b 1 >> dist\install.bat
echo     ) >> dist\install.bat
echo     echo - Python dependencies installed >> dist\install.bat
echo ) >> dist\install.bat
echo echo. >> dist\install.bat
echo echo OpenCode has been successfully installed! >> dist\install.bat
echo echo To start the application, run OpenCode.bat >> dist\install.bat
echo - Installation script created at dist\install.bat

echo.
echo Build and distribution process completed successfully!
echo.
echo Distribution package is available in the 'dist' directory:
echo - Executable: %FULL_PATH%
echo - Launcher: dist\OpenCode.bat
echo - Installer: dist\install.bat
echo.
echo To run the application:
echo dist\OpenCode.bat

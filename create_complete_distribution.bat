@echo off
echo OpenCode Complete Distribution Package Creator
echo ==========================================
echo.

REM Set variables
set DIST_DIR=OpenCode-distribution
set ZIP_NAME=OpenCode-complete-distribution.zip

REM Create distribution directory structure
echo Creating distribution directory structure...
if exist %DIST_DIR% rd /s /q %DIST_DIR%
mkdir %DIST_DIR%
mkdir %DIST_DIR%\bin
mkdir %DIST_DIR%\config
mkdir %DIST_DIR%\docs
mkdir %DIST_DIR%\logs
mkdir %DIST_DIR%\src
echo - Directory structure created

REM Copy source files
echo.
echo Copying source files...
xcopy /E /I /Y internal %DIST_DIR%\src\internal
xcopy /E /I /Y cmd %DIST_DIR%\src\cmd
copy main.go %DIST_DIR%\src\
copy go.mod %DIST_DIR%\src\
copy go.sum %DIST_DIR%\src\
echo - Source files copied

REM Copy configuration files
echo.
echo Copying configuration files...
copy requirements.txt %DIST_DIR%\config\
if exist .opencode.json copy .opencode.json %DIST_DIR%\config\
if exist config.json copy config.json %DIST_DIR%\config\
echo - Configuration files copied

REM Copy API and launcher files
echo.
echo Copying API and launcher files...
copy api.py %DIST_DIR%\bin\
echo - API files copied

REM Copy documentation
echo.
echo Copying documentation...
copy README.md %DIST_DIR%\docs\
if exist LICENSE copy LICENSE %DIST_DIR%\
echo - Documentation copied

REM Create launcher script
echo.
echo Creating launcher scripts...
echo @echo off > %DIST_DIR%\OpenCode.bat
echo echo OpenCode Launcher >> %DIST_DIR%\OpenCode.bat
echo echo ================ >> %DIST_DIR%\OpenCode.bat
echo echo. >> %DIST_DIR%\OpenCode.bat
echo cd %%~dp0 >> %DIST_DIR%\OpenCode.bat
echo python bin\api.py %%* >> %DIST_DIR%\OpenCode.bat
echo - Launcher script created

REM Create installation script
echo.
echo Creating installation script...
echo @echo off > %DIST_DIR%\install.bat
echo echo OpenCode Installation >> %DIST_DIR%\install.bat
echo echo =================== >> %DIST_DIR%\install.bat
echo echo. >> %DIST_DIR%\install.bat
echo echo Checking Python installation... >> %DIST_DIR%\install.bat
echo python --version >> %DIST_DIR%\install.bat
echo if %%ERRORLEVEL%% NEQ 0 ( >> %DIST_DIR%\install.bat
echo     echo Error: Python not found. Please install Python 3.9 or later. >> %DIST_DIR%\install.bat
echo     exit /b 1 >> %DIST_DIR%\install.bat
echo ) >> %DIST_DIR%\install.bat
echo echo. >> %DIST_DIR%\install.bat
echo echo Installing Python dependencies... >> %DIST_DIR%\install.bat
echo pip install -r config\requirements.txt >> %DIST_DIR%\install.bat
echo if %%ERRORLEVEL%% NEQ 0 ( >> %DIST_DIR%\install.bat
echo     echo Error: Failed to install dependencies. >> %DIST_DIR%\install.bat
echo     exit /b 1 >> %DIST_DIR%\install.bat
echo ) >> %DIST_DIR%\install.bat
echo echo. >> %DIST_DIR%\install.bat
echo echo OpenCode has been successfully installed! >> %DIST_DIR%\install.bat
echo echo To start the application, run OpenCode.bat >> %DIST_DIR%\install.bat
echo - Installation script created

REM Create ZIP package
echo.
echo Creating ZIP package...
powershell -Command "Compress-Archive -Path %DIST_DIR%\* -DestinationPath %ZIP_NAME% -Force"
echo - ZIP package created: %ZIP_NAME%

echo.
echo Distribution package creation completed!
echo.
echo The distribution package includes:
echo - Source code files
echo - Configuration files
echo - Documentation
echo - Installation and launcher scripts
echo.
echo To use the distribution:
echo 1. Extract %ZIP_NAME%
echo 2. Run install.bat to set up dependencies
echo 3. Run OpenCode.bat to start the application

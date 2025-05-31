@echo off
echo OpenCode Build Verification
echo =========================
echo.

setlocal

REM Check if the executable exists
if not exist build\opencode.exe (
    echo Error: Executable not found.
    echo Please run build_release.bat first.
    exit /b 1
)

echo Step 1: Verifying executable integrity...
REM Check file size and timestamp
for %%F in (build\opencode.exe) do (
    echo - File size: %%~zF bytes
    echo - Last modified: %%~tF
)

REM Generate file hash for verification
echo - Generating SHA-256 hash...
certutil -hashfile build\opencode.exe SHA256 | findstr /v "hash" > build\opencode.exe.sha256
type build\opencode.exe.sha256
echo.

echo Step 2: Running dependency check...
REM Create a temporary script to check dependencies
echo Go dependencies: > build\dependencies.txt
go list -m all >> build\dependencies.txt
echo Python dependencies: >> build\dependencies.txt
pip freeze >> build\dependencies.txt
echo - Dependencies saved to build\dependencies.txt
echo.

echo Step 3: Basic functionality test...
echo - Attempting to run the application with --version flag...
build\opencode.exe --version
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Version check failed with exit code %ERRORLEVEL%
) else (
    echo - Version check successful
)
echo.

echo Step 4: Testing distribution package...
if exist OpenCode-full-distribution.zip (
    echo - Distribution package exists: OpenCode-full-distribution.zip
    
    REM Extract a subset of files for verification
    echo - Extracting sample files for verification...
    powershell -Command "Expand-Archive -Path OpenCode-full-distribution.zip -DestinationPath build\test-extract -Force -ErrorAction SilentlyContinue"
    
    if exist build\test-extract\GETTING_STARTED.md (
        echo - Sample extraction successful
    ) else (
        echo Warning: Sample extraction failed or key files missing
    )
) else (
    echo Warning: Distribution package not found
)
echo.

echo Step 5: Environment compatibility check...
echo - Go version:
go version
echo - Python version:
python --version
echo.

echo Step 6: Generating test report...
(
    echo OpenCode Build Test Report
    echo =========================
    echo.
    echo Date: %DATE% %TIME%
    echo.
    echo 1. Executable Information
    echo ------------------------
    echo Location: build\opencode.exe
    for %%F in (build\opencode.exe) do (
        echo Size: %%~zF bytes
        echo Last modified: %%~tF
    )
    type build\opencode.exe.sha256
    echo.
    echo 2. Environment
    echo ------------
    echo Go version:
    go version
    echo Python version:
    python --version
    echo OS: Windows
    echo Architecture: %PROCESSOR_ARCHITECTURE%
    echo.
    echo 3. Test Results
    echo -------------
    echo Basic functionality test: %ERRORLEVEL%
    echo.
    echo 4. Notes
    echo -------
    echo This is an automated test report. Please verify the application manually as well.
) > build\test-report.txt

echo Test report generated: build\test-report.txt
echo.

echo Build verification complete!
echo Please review the test report and perform additional manual testing.

endlocal

# PowerShell script to build OpenCode with detailed error reporting
Write-Host "OpenCode PowerShell Build Script" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Set output paths
$outputDir = "build"
$exeName = "opencode.exe"
$fullPath = Join-Path $outputDir $exeName

# Create build directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Created output directory: $outputDir" -ForegroundColor Green
}

# Clean any previous build artifacts
if (Test-Path $fullPath) {
    Remove-Item -Path $fullPath -Force
    Write-Host "Cleaned previous build artifacts" -ForegroundColor Yellow
}

# Check Go version
Write-Host "Checking Go installation..." -ForegroundColor Cyan
try {
    $goVersion = & go version
    Write-Host $goVersion -ForegroundColor Green
}
catch {
    Write-Host "Error: Go is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check module dependencies
Write-Host "Checking module dependencies..." -ForegroundColor Cyan
try {
    & go mod tidy
    Write-Host "Module dependencies are up to date" -ForegroundColor Green
}
catch {
    Write-Host "Error: Failed to tidy module dependencies" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Build with verbose output and error reporting
Write-Host "Building OpenCode executable..." -ForegroundColor Cyan
Write-Host "Command: go build -v -o $fullPath ." -ForegroundColor Yellow

try {
    $buildOutput = & go build -v -o $fullPath . 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed with errors:" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Build process threw an exception:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Check if executable was created
if (Test-Path $fullPath) {
    Write-Host ""
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "Executable created at: $fullPath" -ForegroundColor Green
    
    # Get file size
    $fileInfo = Get-Item $fullPath
    $size = $fileInfo.Length
    Write-Host "Size: $size bytes" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "Error: Build completed but executable was not created." -ForegroundColor Red
    Write-Host "This might indicate a configuration issue." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "To run the application:" -ForegroundColor Cyan
Write-Host "$fullPath" -ForegroundColor Yellow

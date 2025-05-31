# Getting Started with OpenCode

Thank you for using OpenCode! This guide will help you get up and running quickly.

## Quick Start

1. **Setup Environment**: Run `setup_environment.bat` to install all necessary dependencies
2. **Start Application**: Run `OpenCode.bat` to launch the application

## Distribution Contents

This distribution package contains:

- `/bin`: Application executables and run scripts
- `/config`: Configuration files and settings
- `/docs`: Documentation and guides
- `/src`: Source code (if included in distribution)
- `/logs`: Log files (created when the application runs)

## Installation Options

### Option 1: Simple Installation
Run `install.bat` for a basic installation that checks for prerequisites and installs Python dependencies.

### Option 2: Comprehensive Setup
Run `setup_environment.bat` for a more thorough setup that:
- Verifies Go and Python installations
- Creates a Python virtual environment
- Installs all dependencies
- Sets up the Go environment

## Configuration

The application is configured using the `config.json` file in the `config` directory. You can modify this file to change:
- API endpoints
- Model settings
- UI preferences
- Logging options

See the `docs/usage_guide.md` file for detailed configuration information.

## Building from Source

If you want to build the application as a standalone executable:

1. Navigate to the `/src` directory
2. Run `go build -o ../bin/opencode.exe .`

For more detailed build instructions, see `docs/building_executable.md`.

## Documentation

For more information, please refer to:
- `docs/usage_guide.md`: Detailed usage instructions
- `docs/building_executable.md`: Instructions for building the executable

## Troubleshooting

If you encounter any issues:
1. Check the log files in the `/logs` directory
2. Verify your configuration settings
3. Ensure all dependencies are properly installed
4. Refer to the troubleshooting section in `docs/usage_guide.md`

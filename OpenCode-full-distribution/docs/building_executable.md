# Building OpenCode as an Executable

This guide provides instructions for building the OpenCode application as a standalone executable.

## Prerequisites
- Go 1.21.0 or later
- Windows operating system (for .exe builds)

## Building Steps

### Standard Build
To build a standard executable:

```bash
go build -o opencode.exe .
```

### Optimized Build
To build a smaller, optimized executable:

```bash
go build -ldflags="-s -w" -o opencode.exe .
```

The `-s -w` flags strip debugging information and reduce the executable size.

### Building with Version Information

If you want to add version information to your executable:

1. Install the rsrc tool:
```bash
go install github.com/akavel/rsrc@latest
```

2. Create a versioninfo.json file:
```json
{
    "FixedFileInfo": {
        "FileVersion": {
            "Major": 1,
            "Minor": 0,
            "Patch": 0,
            "Build": 0
        },
        "ProductVersion": {
            "Major": 1,
            "Minor": 0,
            "Patch": 0,
            "Build": 0
        }
    },
    "StringFileInfo": {
        "CompanyName": "OpenCode",
        "FileDescription": "OpenCode AI Coding Assistant",
        "FileVersion": "1.0.0",
        "ProductName": "OpenCode",
        "ProductVersion": "1.0.0"
    }
}
```

3. Generate the resource file:
```bash
rsrc -manifest opencode.manifest -o rsrc.syso
```

4. Build with the resource file:
```bash
go build -o opencode.exe .
```

## Troubleshooting

If you encounter issues during the build process:

1. Ensure all syntax errors are fixed in the codebase
2. Check that you have the correct Go version installed
3. Verify all dependencies are properly installed
4. Check the build output for specific error messages

## Distribution

When distributing the executable, include:

1. The opencode.exe file
2. Any configuration files needed
3. The requirements.txt file for Python dependencies
4. A README with installation and usage instructions

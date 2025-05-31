# OpenCode Security Guide

## Overview

This guide outlines security best practices for using and distributing the OpenCode application.

## User Security Measures

### API Keys and Credentials

- **Never hardcode API keys** in your code or configuration files
- Use environment variables or a secure vault for storing sensitive credentials
- Consider using the `.env` file (which is git-ignored) for local development
- For production, use a secure credential management system

### File Permissions

- Restrict access to the OpenCode installation directory to authorized users only
- Ensure log files are stored in a location with appropriate permissions
- On Linux/macOS systems, consider using `chmod` to set restrictive permissions

### Network Security

- If using the API features, ensure you're connecting over HTTPS
- Consider implementing network request throttling to prevent abuse
- Use a firewall to restrict incoming/outgoing connections if deploying as a service

## Distribution Security

### Code Signing

For a trusted distribution, consider code signing your executable:

1. Obtain a code signing certificate from a trusted Certificate Authority
2. Sign the executable using a tool like SignTool (Windows) or codesign (macOS)
3. Verify the signature before distributing

Example Windows command:
```
signtool sign /tr http://timestamp.digicert.com /td sha256 /fd sha256 /a opencode.exe
```

### Integrity Verification

Include hash values with your distribution to allow users to verify file integrity:

```
# Generate SHA-256 hash (Windows)
certutil -hashfile opencode.exe SHA256

# Generate SHA-256 hash (Linux/macOS)
shasum -a 256 opencode.exe
```

### Antivirus Considerations

- Some antivirus software may flag Go executables as suspicious
- Consider submitting your application to major antivirus vendors for whitelisting
- Document any known false positives and resolution steps for users

## Application Security Features

### Secure Communication

- All external API calls should use HTTPS
- Implement TLS certificate validation
- Consider adding certificate pinning for critical connections

### Input Validation

- Validate all user input before processing
- Implement proper error handling to prevent information disclosure
- Sanitize any data displayed back to users

### Updates and Patching

- Implement a secure update mechanism
- Regularly check for security vulnerabilities in dependencies
- Document the update process for users

## Security Compliance

If your application processes sensitive data, consider compliance with:

- GDPR (for European users)
- CCPA (for California users)
- Other relevant data protection regulations

Always prioritize user privacy and data security in all aspects of the application.

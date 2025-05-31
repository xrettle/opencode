# OpenCode Deployment Checklist

Use this checklist to ensure all necessary steps are completed before releasing the OpenCode application.

## Pre-Build Checks

- [ ] All syntax errors are fixed and code compiles successfully
- [ ] Unit tests are passing
- [ ] Integration tests are passing
- [ ] Go dependencies are up to date (`go mod tidy`)
- [ ] Python dependencies are up to date
- [ ] Version numbers are updated in all relevant files
- [ ] Release notes are prepared
- [ ] Documentation is updated

## Build Process

- [ ] Run `build_release.bat` to create the executable
- [ ] Verify the executable size and hash
- [ ] Run `optimize_executable.bat` if size optimization is needed
- [ ] Test the executable on a clean system
- [ ] Create distribution package using `create_full_distribution.bat`
- [ ] Create installer using Inno Setup

## Testing

- [ ] Run `test_build.bat` to perform automated testing
- [ ] Manually test core functionality
- [ ] Test on multiple Windows versions (10, 11)
- [ ] Test with different Go versions
- [ ] Test with different Python versions
- [ ] Verify all documentation links work
- [ ] Check all included scripts run correctly

## Security

- [ ] Review code for security vulnerabilities
- [ ] Scan executable with antivirus software
- [ ] Sign the executable with a code signing certificate
- [ ] Generate and publish file hashes
- [ ] Verify proper handling of API keys and credentials
- [ ] Ensure no sensitive data is included in the distribution

## Distribution

- [ ] Upload releases to distribution platform
- [ ] Update download links on website
- [ ] Publish release notes
- [ ] Notify users of the new release
- [ ] Create a tagged release in version control
- [ ] Archive build artifacts

## Post-Release

- [ ] Monitor for user-reported issues
- [ ] Collect user feedback
- [ ] Prepare for hotfix releases if necessary
- [ ] Update documentation based on common questions
- [ ] Plan for next version improvements

## Final Approval

- [ ] Product owner approval
- [ ] Technical lead approval
- [ ] Security team approval (if applicable)
- [ ] Legal approval (if applicable)

## Release Completion

- [ ] Date of release: ____________________
- [ ] Version released: ___________________
- [ ] Release manager: ____________________

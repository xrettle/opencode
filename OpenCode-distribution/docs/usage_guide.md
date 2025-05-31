# OpenCode Usage Guide

## Getting Started

### Installation
1. Run the `install.bat` script to set up all dependencies
2. Alternatively, run `setup_environment.bat` for a more comprehensive setup

### Running the Application
1. Start the application by running `OpenCode.bat` in the root directory
2. Alternatively, navigate to the `bin` directory and run `opencode.bat`

## Configuration

### Basic Configuration
The application can be configured using the `config.json` file in the `config` directory. Here are the key settings:

- **app**: General application settings
  - `name`: Application name
  - `version`: Application version

- **api**: API connection settings
  - `endpoint`: API endpoint URL
  - `timeout_seconds`: Request timeout in seconds

- **model**: Model settings
  - `default`: Default model to use
  - `alternatives`: List of alternative models available

- **logging**: Logging configuration
  - `level`: Logging level (info, debug, error)
  - `file`: Log file location
  - `max_size_mb`: Maximum log file size
  - `max_backups`: Number of log backups to keep

- **ui**: User interface settings
  - `theme`: UI theme (dark, light)
  - `font_size`: Font size
  - `show_line_numbers`: Whether to show line numbers

### Advanced Configuration
For advanced configuration options, please refer to the API documentation.

## Common Tasks

### Setting Up a New Project
1. Start the application
2. Select "New Project" from the menu
3. Enter the project details and select a template
4. Click "Create Project"

### Working with Existing Code
1. Start the application
2. Select "Open Project" from the menu
3. Navigate to the project directory
4. Select the main file to open

### Using AI Assistance
1. Open a code file
2. Position your cursor where you need assistance
3. Press Ctrl+Space to trigger AI suggestions
4. Select the suggestion to insert it into your code

## Troubleshooting

### Common Issues

#### Application Won't Start
- Ensure all dependencies are installed
- Check the log files for specific error messages
- Verify your configuration settings

#### AI Suggestions Not Working
- Check your internet connection
- Verify your API key configuration
- Ensure the selected model is available

#### Performance Issues
- Try using a lighter-weight model
- Close unnecessary applications to free up system resources
- Check for large files that might be slowing down processing

### Getting Help
If you encounter issues not covered in this guide, please:
1. Check the logs in the `logs` directory
2. Refer to the online documentation
3. Contact support with details about your issue

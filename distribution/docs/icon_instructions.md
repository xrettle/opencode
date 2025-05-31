# Creating an Icon for OpenCode

To create a proper icon for the OpenCode application, follow these steps:

## Option 1: Using an Existing Icon

1. Save an icon file (`.ico` format) as `icon.ico` in the root directory of the project
2. Use this icon when building the executable with the resource compiler

## Option 2: Creating a New Icon

1. Use an image editor like GIMP, Photoshop, or online tools like https://convertio.co/png-ico/
2. Create a square image with the OpenCode logo or symbol
3. Export the image in multiple sizes (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
4. Combine these images into a single `.ico` file
5. Save the file as `icon.ico` in the root directory

## Icon Design Suggestions

For a coding assistant application like OpenCode, consider:

- A code symbol (e.g., brackets, tags, or braces)
- A simple, recognizable shape
- Color scheme that matches your application theme
- High contrast for visibility in taskbars and file browsers

## Using the Icon in the Build Process

Once you have created the icon.ico file, it will be automatically included in the build process when using the rsrc tool:

```
rsrc -manifest opencode.manifest -ico icon.ico -o rsrc.syso
go build -o opencode.exe .
```

This will embed the icon into your executable, making it appear in Windows Explorer, the taskbar, and other places.

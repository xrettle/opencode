package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	fmt.Println("OpenCode Launcher")
	fmt.Println("================")
	fmt.Println()

	// Get the directory where the launcher is located
	exePath, err := os.Executable()
	if err != nil {
		fmt.Printf("Error getting executable path: %v\n", err)
		os.Exit(1)
	}
	exeDir := filepath.Dir(exePath)

	// Set up the environment
	fmt.Println("Setting up environment...")
	
	// Check if Python is installed
	pythonCmd := exec.Command("python", "--version")
	pythonOutput, err := pythonCmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Python not found: %v\n", err)
		fmt.Println("Please install Python 3.9 or later to run OpenCode")
		os.Exit(1)
	}
	fmt.Printf("Detected: %s", pythonOutput)

	// Check for requirements.txt and install dependencies if needed
	reqPath := filepath.Join(exeDir, "config", "requirements.txt")
	if _, err := os.Stat(reqPath); err == nil {
		fmt.Println("Installing Python dependencies...")
		pipCmd := exec.Command("pip", "install", "-r", reqPath)
		pipCmd.Stdout = os.Stdout
		pipCmd.Stderr = os.Stderr
		if err := pipCmd.Run(); err != nil {
			fmt.Printf("Error installing dependencies: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("Dependencies installed successfully")
	}

	// Launch the main OpenCode application
	fmt.Println("Launching OpenCode...")
	
	// Prepare command arguments
	args := os.Args[1:]
	
	// Run the OpenCode application
	cmd := exec.Command("python", append([]string{filepath.Join(exeDir, "api.py")}, args...)...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	
	if err := cmd.Run(); err != nil {
		fmt.Printf("Error running OpenCode: %v\n", err)
		os.Exit(1)
	}
}

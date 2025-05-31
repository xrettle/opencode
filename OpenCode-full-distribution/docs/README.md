# 🧑‍💻 OpenCode: Your Friendly AI Coding Helper

## What is OpenCode?
OpenCode is a magic helper for your computer. It lives in your terminal (the black box where you type commands) and helps you write code, fix problems, and answer questions. It's like having a super-smart friend who knows a lot about computers!

---

## How to Install OpenCode (Step by Step)

### 1. What You Need First
- A computer with **Linux** or **macOS** (Apple) or **Windows** (with a tool called WSL or Git Bash)
- An internet connection
- A terminal (the place where you type commands)

### 2. The Easiest Way: Use the Magic Install Script

#### For Linux or macOS
1. Open your terminal.
2. Copy and paste this line, then press **Enter**:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/opencode-ai/opencode/refs/heads/main/install | bash
   ```
   - This line tells your computer to download and run a script that does all the hard work for you.

#### For Windows
- You need to use **WSL** (Windows Subsystem for Linux) or **Git Bash**. If you don't have these, search for "How to install WSL" or "How to install Git Bash" and follow those steps first.
- Then, open your WSL or Git Bash terminal and use the same command as above.

#### To Install a Specific Version
- If you want a certain version (not the newest), use this:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/opencode-ai/opencode/refs/heads/main/install | VERSION=0.1.0 bash
  ```
  - Change `0.1.0` to the version you want.

### 3. What Does the Install Script Do?
- It checks what kind of computer you have (Mac, Linux, or Windows with WSL).
- It finds the right OpenCode for your computer.
- It downloads OpenCode and puts it in a safe place (`~/.opencode/bin`).
- It tries to add OpenCode to your PATH (so you can run it from anywhere).
- If it can't add to PATH, it tells you what to do.

### 4. How to Check if It Worked
- Close your terminal and open it again.
- Type:
  ```bash
  opencode --help
  ```
- If you see a list of commands, it worked! 🎉
- If you see "command not found", see the Troubleshooting section below.

---

## Other Ways to Install (If You Want)

### Homebrew (for Mac and Linux)
```bash
brew install opencode-ai/tap/opencode
```

### Arch Linux (AUR)
```bash
yay -S opencode-ai-bin
# or
paru -S opencode-ai-bin
```

### Go (if you have Go installed)
```bash
go install github.com/opencode-ai/opencode@latest
```

### Build from Source (for advanced users)
```bash
git clone https://github.com/opencode-ai/opencode.git
cd opencode
go build -o opencode
./opencode
```

---

## How to Set Up OpenCode (Make It Ready)

### 1. Configuration File (The Settings File)
OpenCode looks for a file called `.opencode.json` to know your settings. It checks these places:
- In your home folder: `~/.opencode.json`
- In your config folder: `~/.config/opencode/.opencode.json`
- In your project folder: `./.opencode.json`

If you don't have this file, OpenCode will make one for you the first time you run it.

### 2. Add Your AI Keys (So OpenCode Can Talk to AI)
To use smart AI helpers, you need API keys. These are like secret passwords. You get them from places like OpenAI, Anthropic, Google, etc.

- **OpenAI**: Set `OPENAI_API_KEY`
- **Anthropic**: Set `ANTHROPIC_API_KEY`
- **Google Gemini**: Set `GEMINI_API_KEY`
- **Groq**: Set `GROQ_API_KEY`

#### How to Set an API Key
1. Open your terminal.
2. Type this (replace `your-key-here` with your real key):
   ```bash
   export OPENAI_API_KEY=your-key-here
   ```
3. Do this for each key you have.

### 3. Example Settings File
Here's what a simple `.opencode.json` might look like:
```json
{
  "providers": {
    "openai": { "apiKey": "your-openai-key" },
    "anthropic": { "apiKey": "your-anthropic-key" }
  },
  "autoCompact": true
}
```

---

## How to Use OpenCode (Your First Time!)

### 1. Start OpenCode
- In your terminal, type:
  ```bash
  opencode
  ```
- You'll see a cool screen with boxes and menus. This is the TUI (Terminal User Interface).

### 2. Ask a Question
- Type your question or code problem in the box at the bottom.
- Press **Enter**.
- Wait a few seconds. OpenCode will think and give you an answer!

### 3. Try Some Fun Things
- Ask it to write code for you.
- Ask it to explain something.
- Ask it to fix an error.

---

## What If Something Goes Wrong? (Troubleshooting)

### Problem: "command not found: opencode"
- This means your computer doesn't know where OpenCode is.
- Try closing your terminal and opening it again.
- If it still doesn't work, add this line to your `~/.bashrc` or `~/.zshrc` file:
  ```bash
  export PATH="$HOME/.opencode/bin:$PATH"
  ```
- Then run:
  ```bash
  source ~/.bashrc
  # or
  source ~/.zshrc
  ```

### Problem: "Permission denied"
- Try running:
  ```bash
  chmod +x ~/.opencode/bin/opencode
  ```

### Problem: "No API key" or "Missing key"
- Make sure you set your API key (see above).
- Double-check for typos.

### Problem: "It says unsupported OS/arch"
- Your computer might not be supported yet. Ask for help on the OpenCode GitHub page.

---

## Extra Tips
- You can use keyboard shortcuts! (Like pressing `Ctrl+C` to quit)
- You can make custom commands (see the OpenCode website for more info)
- You can use OpenCode with lots of different AI helpers (OpenAI, Anthropic, Google, and more)

---

## Want to Help or Learn More?
- Visit the [OpenCode GitHub page](https://github.com/opencode-ai/opencode)
- Read the code, make changes, and share your ideas!

---

## License
OpenCode is free for everyone! (MIT License)

# vLLM API

REST API for interacting with language models using vLLM.

## Requirements

- Python 3.8+
- CUDA compatible GPU (recommended)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <directory-name>
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Start the server:
```bash
python api.py
```

The server will start at `http://localhost:8000`

2. API Documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints

### POST /generate

Generate text using the vLLM model.

**Request Body:**
```json
{
    "prompt": "Your prompt here",
    "max_tokens": 2048,
    "temperature": 0.7,
    "top_p": 0.95,
    "stream": false
}
```

**Response:**
```json
{
    "text": "Generated text",
    "usage": {
        "prompt_tokens": 10,
        "completion_tokens": 20,
        "total_tokens": 30
    }
}
```

### GET /health

Server health check endpoint.

**Response:**
```json
{
    "status": "healthy"
}
```

## Configuration

The default model is "meta-llama/Llama-3-8B-Instruct". To change the model, modify the corresponding line in `api.py`.

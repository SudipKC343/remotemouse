# Mac Remote Controller 🖱️⌨️

A premium, low-latency remote mouse and keyboard controller for macOS. Control your Mac from your phone through a sleek, mobile-optimized web interface. Just run one command and scan a QR code—you're ready to go!

## ✨ Features

- **QR Code Quick Access**: Scan a QR code to instantly access the controller from your phone—no typing URLs!
- **Responsive Touchpad**: Low-latency cursor movement with adjustable sensitivity.
- **Native Keyboard Integration**: Use your phone's native keyboard to type directly into any app on your Mac.
- **System Controls**: Dedicated buttons for Left/Right click, Space, Backspace, and Enter.
- **Modern UI**: Dark-themed, glassmorphic design built with React and Tailwind-inspired CSS.
- **One-Command Setup**: Everything (backend + frontend) starts with a single `python3 app.py`.

## 🛠 Tech Stack

- **Backend**: Python (Flask-SocketIO), PyAutoGUI (for system-level control).
- **Frontend**: React, TypeScript, Vite, Socket.io-client.
- **Styling**: Vanilla CSS with modern premium aesthetics (Glassmorphism, Outfit font).

## 🚀 Quick Start

### 1. Prerequisites
- macOS (tested on macOS Sequoia/Sonoma)
- Python 3.x
- Node.js & pnpm

### 2. Install Dependencies
```bash
# Navigate to the project directory
cd remotemouse

# Install Python dependencies
pip install pyautogui flask flask-socketio python-socketio python-engineio qrcode[pil]

# Install frontend dependencies
cd frontend && pnpm install && cd ..
```

### 3. Run the Application
Simply run:
```bash
python3 app.py
```

This will:
- ✅ Start the backend (Flask-SocketIO) on port 5001
- ✅ Start the frontend (Vite) on port 5173 automatically
- ✅ Display a **QR code** in your terminal

### 4. Connect from Your Phone
1. **Scan the QR code** displayed in your terminal using your phone's camera
2. Or manually open the URL shown (usually `http://192.168.x.x:5173`)
3. You're ready to control your Mac!

## 🔐 Grant macOS Permissions

macOS requires explicit permissions for apps to control the system.

1. Go to **System Settings > Privacy & Security**
2. Under **Accessibility**, add/enable your Terminal app (e.g., iTerm, Terminal, or VS Code)
3. Under **Input Monitoring**, ensure your Terminal is allowed

This allows PyAutoGUI to control your mouse and keyboard.

## ⚙️ Configuration

- **Sensitivity**: Adjust the mouse movement speed via the settings gear icon in the app
- **Allowed Hosts**: If needed, modify `frontend/.env`:
  ```
  VITE_ALLOWED_HOST=your-mac.local
  ```

## 📱 How It Works

1. **Backend (Python Flask-SocketIO)** - Runs on port 5001
   - Receives commands via WebSocket from your phone
   - Uses PyAutoGUI to control your Mac's mouse and keyboard
   - Handles mouse movement, clicks, scrolling, and text input

2. **Frontend (React + Vite)** - Runs on port 5173
   - Beautiful, responsive touch interface
   - Real-time communication with the backend via WebSocket
   - Works on any device with a modern web browser

## 🛠 Tech Stack

- **Backend**: Python, Flask, Flask-SocketIO, PyAutoGUI
- **Frontend**: React, TypeScript, Vite, Socket.io-client
- **Styling**: Vanilla CSS with Glassmorphism design
- **QR Code**: python-qrcode for easy mobile access

## 🐛 Troubleshooting

### QR Code not displaying?
- Make sure `qrcode[pil]` is installed: `pip install qrcode[pil]`

### Mouse/Keyboard not working?
- Grant the required macOS permissions (see above)
- Ensure your phone and Mac are on the same network

### Frontend not starting?
- Make sure pnpm is installed: `npm install -g pnpm`
- Check that Node.js and npm are available

### Port already in use?
- If ports 5001 or 5173 are already in use, modify the code:
  - Backend port: Change `port=5001` in the last line of `app.py`
  - Frontend port: Change `--port 5173` in the `subprocess.Popen` call

## 📝 License
MIT

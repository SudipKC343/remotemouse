import os
import sys
import subprocess
import time
import pyautogui
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

try:
    import qrcode
except ImportError:
    qrcode = None

# Disable PyAutoGUI fail-safe to avoid it stopping on corner move (optional, but better for remote control)
pyautogui.FAILSAFE = False

app = Flask(__name__)
# Change secret_key for production
app.config['SECRET_KEY'] = 'mouse_controller_secret'
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('mouse_move')
def handle_mouse_move(data):
    # data: { dx: float, dy: float }
    try:
        dx = data.get('dx', 0)
        dy = data.get('dy', 0)
        pyautogui.moveRel(dx, dy, _pause=False)
    except (KeyError, Exception) as e:
        # Silently handle PyAutoGUI errors (common with Python 3.13 on macOS)
        pass

@socketio.on('mouse_click')
def handle_mouse_click(data):
    # data: { button: 'left' | 'right' | 'middle' }
    try:
        button = data.get('button', 'left')
        pyautogui.click(button=button, _pause=False)
    except (KeyError, Exception) as e:
        # Silently handle PyAutoGUI errors (common with Python 3.13 on macOS)
        pass

@socketio.on('mouse_scroll')
def handle_mouse_scroll(data):
    # data: { dy: float }
    # PyAutoGUI scroll is platform dependent, scroll(10) is up, scroll(-10) is down
    try:
        dy = data.get('dy', 0)
        pyautogui.scroll(int(dy), _pause=False)
    except (KeyError, Exception) as e:
        # Silently handle PyAutoGUI errors (common with Python 3.13 on macOS)
        pass

@socketio.on('key_press')
def handle_key_press(data):
    # data: { key: string }
    try:
        key = data.get('key')
        if key:
            pyautogui.press(key, _pause=False)
    except (KeyError, Exception) as e:
        # Silently handle PyAutoGUI errors (common with Python 3.13 on macOS)
        pass

@socketio.on('keyboard_text')
def handle_keyboard_text(data):
    # data: { text: string }
    try:
        text = data.get('text')
        if text:
            pyautogui.write(text, interval=0.01, _pause=False)
    except (KeyError, Exception) as e:
        # Silently handle PyAutoGUI errors (common with Python 3.13 on macOS)
        pass

if __name__ == '__main__':
    # Start the frontend (Vite) in a separate process
    import socket
    
    print("🚀 Starting Remote Mouse Controller...")
    
    # Get local IP (proper method for finding the actual network IP)
    def get_local_ip():
        try:
            # Connect to a public DNS server (doesn't actually send data)
            # This finds the local IP that would be used to reach external networks
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            # Fallback methods
            try:
                hostname = socket.gethostname()
                local_ip = socket.gethostbyname(hostname)
                if local_ip != '127.0.0.1':
                    return local_ip
            except Exception:
                pass
            return "127.0.0.1"
    
    local_ip = get_local_ip()
    frontend_url = f"http://{local_ip}:5173"
    
    # Start frontend in background
    print("🌐 Starting Frontend (Vite)...")
    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')
    
    # Check if we're in the right directory and pnpm is available
    if os.path.exists(frontend_dir):
        try:
            # Start Vite dev server in background
            subprocess.Popen(
                ['pnpm', 'dev', '--host', '--port', '5173'],
                cwd=frontend_dir,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                preexec_fn=os.setsid if sys.platform != 'win32' else None
            )
            time.sleep(2)  # Wait for frontend to start
            print(f"✅ Frontend running at {frontend_url}")
        except Exception as e:
            print(f"⚠️  Could not start frontend: {e}")
            print("   You can manually run: cd frontend && pnpm dev --host --port 5173")
    
    print(f"\n📦 Backend running at http://{local_ip}:5001")
    
    # Generate and display QR code
    if qrcode:
        try:
            print(f"\n📱 QR CODE (Scan with your phone):")
            print("=" * 50)
            qr = qrcode.QRCode(version=1, box_size=10, border=2)
            qr.add_data(frontend_url)
            qr.make(fit=True)
            qr.print_ascii(invert=True)
            print("=" * 50)
        except Exception as e:
            print(f"Could not generate QR code: {e}")
    else:
        print("\n⚠️  Install qrcode for QR code display: pip install qrcode[pil]")
    
    print(f"\n📱 Or open this URL on your phone:")
    print(f"   {frontend_url}")
    print()
    
    socketio.run(app, host='0.0.0.0', port=5001, allow_unsafe_werkzeug=True)

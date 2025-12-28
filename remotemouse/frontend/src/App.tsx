import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Type,
  MousePointer2,
  Settings,
  ChevronUp,
  ChevronDown,
  CornerDownLeft,
  Delete,
  Space
} from 'lucide-react';
import { throttle } from 'lodash';

// Determine the backend URL. In production, this should be the IP of the Mac.
// We'll use a dynamic approach or let the user input it if localhost fails.
const BACKEND_URL = `http://${window.location.hostname}:5001`;

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [sensitivity, setSensitivity] = useState(1.5);
  const [showSettings, setShowSettings] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to backend');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from backend');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMouseMove = useCallback(
    throttle((dx: number, dy: number) => {
      if (socket) {
        socket.emit('mouse_move', { dx: dx * sensitivity, dy: dy * sensitivity });
      }
    }, 16), // ~60fps
    [socket, sensitivity]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    sendMouseMove(dx, dy);

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const handleClick = (button: 'left' | 'right' | 'middle') => {
    if (socket) socket.emit('mouse_click', { button });
  };

  const handleKeyPress = (key: string) => {
    if (socket) socket.emit('key_press', { key });
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val && socket) {
      socket.emit('keyboard_text', { text: val });
      e.target.value = ''; // Clear after sending
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      handleKeyPress('backspace');
    } else if (e.key === 'Enter') {
      handleKeyPress('enter');
    }
  };

  const toggleKeyboard = () => {
    setShowKeyboard(!showKeyboard);
    if (!showKeyboard && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full select-none overflow-hidden touch-none p-4 box-border">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
          <h1 className="text-lg font-bold tracking-tight text-white/90">MacController</h1>
        </div>
        <button
          className={`p-2 rounded-full glass glow-btn transition-colors ${showSettings ? 'bg-white/20 text-white' : 'text-white/60'}`}
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="glass rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-white/60">Sensitivity</span>
            <span className="text-sm font-bold text-white/90">{sensitivity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full accent-white/50 bg-white/10 rounded-lg appearance-none h-2"
          />
        </div>
      )}

      {/* Touchpad Area */}
      <div
        className="flex-1 glass rounded-3xl relative mb-4 flex flex-col items-center justify-center border-white/10 overflow-hidden active:border-white/20 transition-colors"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => handleClick('left')}
      >
        <MousePointer2 size={48} className="text-white/10" />
        <p className="text-white/20 text-sm mt-2 font-medium">Touchpad</p>

        {/* Scroll Indicator Side (Optional logic could go here) */}
        <div className="absolute right-0 top-0 bottom-0 w-8 flex flex-col items-center justify-between py-8 text-white/10 pointer-events-none">
          <ChevronUp size={20} />
          <ChevronDown size={20} />
        </div>
      </div>

      {/* Keyboard Input (Hidden) */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        onChange={handleTextInput}
        onKeyDown={handleKeyDown}
        autoCapitalize="none"
        autoCorrect="off"
      />

      {/* Controls Bar */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          className="glass py-6 rounded-2xl flex items-center justify-center font-bold text-white/80 active:bg-white/10 transition-all border-b-2 border-white/5 active:border-b-0 active:translate-y-0.5"
          onTouchStart={(e) => { e.stopPropagation(); handleClick('left'); }}
        >
          L-Click
        </button>
        <button
          className="glass py-6 rounded-2xl flex items-center justify-center font-bold text-white/80 active:bg-white/10 transition-all border-b-2 border-white/5 active:border-b-0 active:translate-y-0.5"
          onTouchStart={(e) => { e.stopPropagation(); handleClick('right'); }}
        >
          R-Click
        </button>
      </div>

      {/* Utility Bar */}
      <div className="flex justify-between items-stretch gap-4">
        <button
          className={`flex-1 glass py-4 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all ${showKeyboard ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]' : 'text-white/60'}`}
          onClick={toggleKeyboard}
        >
          <Type size={20} />
          {showKeyboard ? 'On' : 'Keys'}
        </button>

        <div className="flex-[2] flex gap-2">
          <button
            className="flex-1 glass rounded-2xl flex items-center justify-center text-white/60 transition-all active:bg-white/10"
            onClick={() => handleKeyPress('space')}
          >
            <Space size={20} />
          </button>
          <button
            className="flex-1 glass rounded-2xl flex items-center justify-center text-white/60 transition-all active:bg-white/10"
            onClick={() => handleKeyPress('backspace')}
          >
            <Delete size={20} />
          </button>
          <button
            className="flex-1 glass rounded-2xl flex items-center justify-center text-white/60 transition-all active:bg-white/10"
            onClick={() => handleKeyPress('enter')}
          >
            <CornerDownLeft size={20} />
          </button>
        </div>
      </div>

      {/* Style overrides for Tailwind-like utility classes since I'm using vanilla CSS for the most part but used some class names from memory */}
      <style>{`
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .h-screen { height: 100svh; }
        .w-full { width: 100%; max-width: 100vw; }
        .box-border { box-sizing: border-box; }
        .flex-1 { flex: 1; min-height: 0; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-4 { gap: 1rem; }
        .gap-2 { gap: 0.5rem; }
        .p-4 { padding: 1rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-2 { margin-top: 0.5rem; }
        .rounded-full { border-radius: 9999px; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-3xl { border-radius: 1.5rem; }
        .items-center { align-items: center; }
        .items-stretch { align-items: stretch; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .text-lg { font-size: 1.125rem; }
        .text-sm { font-size: 0.875rem; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .tracking-tight { letter-spacing: -0.025em; }
        .text-white\\/90 { color: rgba(255, 255, 255, 0.9); }
        .text-white\\/80 { color: rgba(255, 255, 255, 0.8); }
        .text-white\\/60 { color: rgba(255, 255, 255, 0.6); }
        .text-white\\/20 { color: rgba(255, 255, 255, 0.2); }
        .text-white\\/10 { color: rgba(255, 255, 255, 0.1); }
        .bg-white\\/10 { background-color: rgba(255, 255, 255, 0.1); }
        .bg-green-500 { background-color: #22c55e; }
        .bg-red-500 { background-color: #ef4444; }
        .border-white\\/10 { border: 1px solid rgba(255, 255, 255, 0.1); }
        .border-white\\/5 { border: 1px solid rgba(255, 255, 255, 0.05); }
        .border-b-2 { border-bottom-width: 2px; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .right-0 { right: 0; }
        .top-0 { top: 0; }
        .bottom-0 { bottom: 0; }
        .overflow-hidden { overflow: hidden; }
        .pointer-events-none { pointer-events: none; }
        .select-none { user-select: none; }
        .touch-none { touch-action: none; }
        .opacity-0 { opacity: 0; }
        .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .active\\:border-white\\/20:active { border-color: rgba(255, 255, 255, 0.2); }
        .active\\:translate-y-0\\.5:active { transform: translateY(2px); }
        .active\\:border-b-0:active { border-bottom-width: 0; }
        .flex-\\[2\\] { flex: 2; }
      `}</style>
    </div>
  );
};

export default App;

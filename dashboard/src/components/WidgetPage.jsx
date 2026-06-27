import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";

const SERVER_HOST = import.meta.env.VITE_API_HOST || window.location.host;
const WS_URL = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${SERVER_HOST}/widget`;

function getSessionId() {
  let id = sessionStorage.getItem("chat_widget_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("chat_widget_session", id);
  }
  return id;
}

export default function WidgetPage() {
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [started, setStarted] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const sessionId = useRef(getSessionId());
  const typingTimeouts = useRef({});
  const typingRef = useRef(false);
  const typingTimer = useRef(null);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function connect() {
    const ws = new WebSocket(`${WS_URL}?sessionId=${sessionId.current}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      sendAutoMetadata(ws);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      switch (data.type) {
        case "message":
          setMessages((prev) => {
            if (data.id && prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
          break;
        case "history":
          setMessages(data.messages || []);
          break;
        case "typing":
          handleTypingIndicator(data);
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
  }

  function sendAutoMetadata(ws) {
    // Auto-detected metadata
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = navigator.language || "en";
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const referrer = document.referrer || "direct";
    const currentPage = window.location.href;

    ws.send(JSON.stringify({
      type: "set_metadata",
      timezone,
      language: locale,
      screenResolution,
      referrer,
      currentPage,
    }));

    ws.send(JSON.stringify({
      type: "page_view",
      url: currentPage,
      title: document.title,
    }));
  }

  function sendUserInfo() {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;

    // Send name
    if (name.trim()) {
      wsRef.current.send(JSON.stringify({ type: "set_name", name: name.trim() }));
    }

    // Send email/phone as metadata
    const meta = {};
    if (email.trim()) meta.email = email.trim();
    if (phone.trim()) meta.phone = phone.trim();

    if (Object.keys(meta).length > 0) {
      wsRef.current.send(JSON.stringify({ type: "set_metadata", ...meta }));
    }
  }

  function handleTypingIndicator(data) {
    if (data.isTyping) {
      setTypingUsers((prev) => (prev.includes(data.sender) ? prev : [...prev, data.sender]));
      if (typingTimeouts.current[data.sender]) clearTimeout(typingTimeouts.current[data.sender]);
      typingTimeouts.current[data.sender] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== data.sender));
      }, 3000);
    } else {
      setTypingUsers((prev) => prev.filter((u) => u !== data.sender));
    }
  }

  function handleSend(e) {
    e.preventDefault();
    if (!value.trim() || !connected) return;
    wsRef.current?.send(JSON.stringify({ type: "message", content: value, name: name || undefined }));
    setValue("");
    typingRef.current = false;
    clearTimeout(typingTimer.current);
    wsRef.current?.send(JSON.stringify({ type: "typing", isTyping: false }));
  }

  function handleInputChange(e) {
    setValue(e.target.value);
    if (!typingRef.current && wsRef.current?.readyState === 1) {
      typingRef.current = true;
      wsRef.current.send(JSON.stringify({ type: "typing", isTyping: true }));
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      typingRef.current = false;
      wsRef.current?.send(JSON.stringify({ type: "typing", isTyping: false }));
    }, 2000);
  }

  function handleStart(e) {
    e.preventDefault();
    if (!name.trim()) return;
    sendUserInfo();
    setStarted(true);
  }

  // Intro form
  if (!started) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-sm overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Chat with us</h1>
                <p className="text-xs text-orange-100">We typically reply within minutes</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <p className="text-sm text-neutral-600 mb-4">Please fill in your details to start a conversation.</p>
            <form onSubmit={handleStart} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors text-sm mt-1"
              >
                Start Chat
              </button>
            </form>
            <p className="text-[10px] text-neutral-400 mt-3 text-center">
              Session: {sessionId.current.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-neutral-100 p-4">
      <div className="w-full max-w-md h-full max-h-[700px] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Live Support</p>
            <p className="text-xs text-orange-100">
              {connected ? "Online" : "Connecting..."}
            </p>
          </div>
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-300" : "bg-red-300"}`}></span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-neutral-400">Send a message to start the conversation</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isOwn = msg.senderId === sessionId.current;
            return (
              <div key={msg.id || i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%]">
                  {!isOwn && (
                    <p className="text-[11px] text-neutral-400 mb-0.5 ml-1">{msg.sender}</p>
                  )}
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-sm ${
                      isOwn
                        ? "bg-orange-500 text-white rounded-br-md"
                        : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-neutral-400 mt-0.5 ${isOwn ? "text-right mr-1" : "ml-1"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}

          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-white border border-neutral-200 px-3.5 py-2 rounded-2xl rounded-bl-md">
                <p className="text-xs text-neutral-400 animate-pulse">
                  {typingUsers.join(", ")} is typing...
                </p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-neutral-200 bg-white">
          <div className="flex gap-2">
            <input
              value={value}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={!connected}
              className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!connected || !value.trim()}
              className="w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-200 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 text-center mt-2">
            Powered by LiveChat &middot; Session {sessionId.current.slice(0, 8)}
          </p>
        </form>
      </div>
    </div>
  );
}

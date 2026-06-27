import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ConversationList from "./components/ConversationList";
import ChatPanel from "./components/ChatPanel";
import AuthScreen from "./components/AuthScreen";
import ConnectionWidget from "./components/ConnectionWidget";
import VisitorPanel from "./components/VisitorPanel";
import AgenticSettings from "./components/AgenticSettings";
import ArticlesPage from "./components/ArticlesPage";
import VisitorsPage from "./components/VisitorsPage";
import EmailSettings from "./components/EmailSettings";
import WidgetInstall from "./components/WidgetInstall";

const SERVER_HOST = window.location.host;
const API_URL = `${window.location.protocol}//${SERVER_HOST}`;
const WS_URL = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${SERVER_HOST}`;

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("chat_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("chat_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ online: 0, totalMessages: 0, rooms: [], visitors: 0 });
  const [typingUsers, setTypingUsers] = useState([]);
  const [showWidget, setShowWidget] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [visitorInfo, setVisitorInfo] = useState(null);
  const [otherConversations, setOtherConversations] = useState([]);
  const [sharedImages, setSharedImages] = useState([]);
  const [activeView, setActiveView] = useState("inbox");
  const [typingPreview, setTypingPreview] = useState(null); // { content, sender }
  const [emailPrompt, setEmailPrompt] = useState(null); // { sessionId, email, visitorName, messageContent } or { sessionId, noEmail: true }
  const [emailStatus, setEmailStatus] = useState(null); // { type, text }
  const wsRef = useRef(null);
  const typingTimeouts = useRef({});

  const connect = useCallback(() => {
    if (!token) return;
    const socket = new WebSocket(`${WS_URL}?token=${token}`);

    socket.onopen = () => {
      setConnected(true);
      wsRef.current = socket;
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "message":
        case "system":
          setMessages((prev) => {
            // Deduplicate by id
            if (data.id && prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
          // Clear typing preview when actual message arrives from visitor
          if (data.fromVisitor) {
            setTypingPreview(null);
          }
          break;
        case "history":
          setMessages(data.messages || []);
          break;
        case "stats":
          setStats(data);
          break;
        case "typing":
          handleTypingIndicator(data);
          break;
        case "typing_preview":
          // Live typing content from visitor — replaces "is typing..."
          if (data.content) {
            setTypingPreview({ content: data.content, sender: data.sender });
            // Clear the "is typing" indicator since preview replaces it
            setTypingUsers([]);
          } else {
            setTypingPreview(null);
          }
          break;
        case "message_deleted":
          setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
          break;
        case "message_edited":
          setMessages((prev) =>
            prev.map((m) =>
              m.id === data.messageId ? { ...m, content: data.content, editedAt: data.editedAt } : m
            )
          );
          break;
        case "conversations":
          setConversations(data.conversations || []);
          break;
        case "visitor_info":
          setVisitorInfo(data.visitor || null);
          break;
        case "other_conversations":
          setOtherConversations(data.conversations || []);
          break;
        case "shared_images":
          setSharedImages(data.images || []);
          break;
        case "conversation_resolved":
          if (activeConversation?.sessionId === data.sessionId) {
            setActiveConversation((prev) => prev ? { ...prev, status: data.status } : prev);
          }
          break;
        case "error":
          if (data.message === "Unauthorized") handleLogout();
          break;
        case "visitor_offline_prompt":
          // Server says visitor is offline but has email — prompt agent
          setEmailPrompt({
            sessionId: data.sessionId,
            email: data.email,
            visitorName: data.visitorName,
            messageContent: data.messageContent,
          });
          break;
        case "visitor_offline_no_email":
          // Visitor offline, no email — just show a subtle note
          setEmailPrompt({ sessionId: data.sessionId, noEmail: true });
          break;
        case "email_sent":
          setEmailPrompt(null);
          setEmailStatus({ type: "success", text: `Email sent to ${data.sentTo}` });
          setTimeout(() => setEmailStatus(null), 4000);
          break;
        case "email_failed":
          setEmailStatus({ type: "error", text: `Email failed: ${data.error}` });
          setTimeout(() => setEmailStatus(null), 5000);
          break;
      }
    };

    socket.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      setTimeout(() => connect(), 3000);
    };

    socket.onerror = () => socket.close();
  }, [token]);

  useEffect(() => {
    if (token) connect();
    return () => wsRef.current?.close();
  }, [token, connect]);

  const handleTypingIndicator = (data) => {
    // If we already have a live preview, don't show "is typing..." — preview takes priority
    if (data.isTyping) {
      setTypingUsers((prev) => (prev.includes(data.sender) ? prev : [...prev, data.sender]));
      if (typingTimeouts.current[data.sender]) clearTimeout(typingTimeouts.current[data.sender]);
      typingTimeouts.current[data.sender] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== data.sender));
      }, 3000);
    } else {
      setTypingUsers((prev) => prev.filter((u) => u !== data.sender));
    }
  };

  const handleLogin = async (email, password) => {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("chat_token", data.token);
    localStorage.setItem("chat_user", JSON.stringify(data.user));
  };

  const handleRegister = async (email, password, name) => {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await handleLogin(email, password);
  };

  const handleLogout = () => {
    wsRef.current?.close();
    setToken(null);
    setUser(null);
    setMessages([]);
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_user");
  };

  const handleOpenConversation = (conv) => {
    setActiveConversation(conv);
    setMessages([]);
    setTypingUsers([]);
    setTypingPreview(null);
    setEmailPrompt(null);
    setEmailStatus(null);
    setVisitorInfo(null);
    setOtherConversations([]);
    setSharedImages([]);
    if (conv) {
      wsRef.current?.send(JSON.stringify({ type: "open_conversation", sessionId: conv.sessionId }));
      // Fallback: fetch visitor info via REST if WS doesn't deliver it quickly
      fetchVisitorInfo(conv.sessionId);
    }
  };

  const handleResolve = (resolved) => {
    if (!activeConversation) return;
    wsRef.current?.send(JSON.stringify({ type: "resolve_conversation", sessionId: activeConversation.sessionId, resolved }));
  };

  const handleMarkRead = (unread) => {
    if (!activeConversation) return;
    wsRef.current?.send(JSON.stringify({ type: "mark_conversation", sessionId: activeConversation.sessionId, unread }));
  };

  const fetchVisitorInfo = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/api/visitors/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.visitor) {
          setVisitorInfo((prev) => prev || data.visitor);
        }
      }
    } catch {
      // ignore, WS will handle it
    }
  };

  const handleReply = (content, file) => {
    if (!content.trim() && !file) return;
    if (!activeConversation) return;
    const payload = { type: "reply_visitor", sessionId: activeConversation.sessionId, content };
    if (file) {
      payload.file = { url: file.url, name: file.name, size: file.size, type: file.type };
    }
    wsRef.current?.send(JSON.stringify(payload));
  };

  const handleSaveNotes = (sessionId, notes) => {
    wsRef.current?.send(JSON.stringify({ type: "save_notes", sessionId, notes }));
  };

  const handleConversationAction = (action, sessionId) => {
    switch (action) {
      case "mark_resolved":
        wsRef.current?.send(JSON.stringify({ type: "update_conversation", sessionId, status: "resolved" }));
        break;
      case "mark_open":
        wsRef.current?.send(JSON.stringify({ type: "update_conversation", sessionId, status: "open" }));
        break;
      case "mark_unread":
        wsRef.current?.send(JSON.stringify({ type: "update_conversation", sessionId, unread: true }));
        break;
      case "mark_read":
        wsRef.current?.send(JSON.stringify({ type: "update_conversation", sessionId, unread: false }));
        break;
      case "delete":
        if (confirm("Delete this conversation and all messages? This cannot be undone.")) {
          wsRef.current?.send(JSON.stringify({ type: "delete_conversation", sessionId }));
          if (activeConversation?.sessionId === sessionId) {
            setActiveConversation(null);
            setMessages([]);
          }
        }
        break;
    }
  };

  const handleTyping = (isTyping) => {
    wsRef.current?.send(JSON.stringify({ type: "typing", isTyping }));
  };

  const handleSendEmail = () => {
    if (!emailPrompt || !emailPrompt.sessionId || !emailPrompt.messageContent) return;
    wsRef.current?.send(JSON.stringify({
      type: "email_visitor",
      sessionId: emailPrompt.sessionId,
      content: emailPrompt.messageContent,
    }));
    setEmailPrompt(null);
  };

  const handleDismissEmailPrompt = () => {
    setEmailPrompt(null);
  };

  if (!token || !user) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Slim sidebar */}
      <Sidebar
        stats={stats}
        connected={connected}
        username={user.name}
        onLogout={handleLogout}
        onToggleWidget={() => setShowWidget(!showWidget)}
        inboxCount={conversations.length}
        activeView={activeView}
        onSetView={setActiveView}
      />

      {/* Main content based on view */}
      {activeView === "agentic" ? (
        <AgenticSettings token={token} />
      ) : activeView === "articles" ? (
        <ArticlesPage token={token} />
      ) : activeView === "email" ? (
        <EmailSettings token={token} />
      ) : activeView === "install" ? (
        <WidgetInstall />
      ) : activeView === "visitors" ? (
        <VisitorsPage
          token={token}
          onOpenConversation={(sessionId) => {
            const conv = conversations.find((c) => c.sessionId === sessionId);
            if (conv) {
              setActiveView("inbox");
              handleOpenConversation(conv);
            }
          }}
        />
      ) : (
        <>
          {/* Conversation list (middle panel) */}
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelect={handleOpenConversation}
            onAction={handleConversationAction}
            stats={stats}
          />

          {/* Chat panel (main area) */}
          <ChatPanel
            activeConversation={activeConversation}
            messages={messages}
            typingUsers={typingUsers}
            typingPreview={typingPreview}
            username={user.name}
            onReply={handleReply}
            onTyping={handleTyping}
            connected={connected}
            emailPrompt={emailPrompt}
            emailStatus={emailStatus}
            onSendEmail={handleSendEmail}
            onDismissEmailPrompt={handleDismissEmailPrompt}
          />

          {/* Visitor detail panel (right side) */}
          {activeConversation && (
            <VisitorPanel
              visitor={visitorInfo}
              onSaveNotes={handleSaveNotes}
              otherConversations={otherConversations}
              sharedImages={sharedImages}
            />
          )}
        </>
      )}

      {/* Connection Widget Panel */}
      {showWidget && (
        <div className="w-72 border-l border-neutral-200 p-4 overflow-y-auto bg-neutral-50">
          <ConnectionWidget connected={connected} wsUrl={WS_URL} />
        </div>
      )}
    </div>
  );
}

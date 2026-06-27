import { useState, useRef, useEffect } from "react";
import { MessageSquare, Filter, Plus, CheckCircle, Circle, MoreHorizontal, Check, Eye, Trash2 } from "lucide-react";
import { getAvatarByRole } from "../avatars";

export default function ConversationList({ conversations, activeConversation, onSelect, onAction, stats }) {
  const [menuOpen, setMenuOpen] = useState(null); // sessionId of open menu
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getInitials = (name) => {
    return (name || "V")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-orange-100 text-orange-600",
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
      "bg-teal-100 text-teal-600",
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  };

  function openMenu(e, sessionId) {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
    setMenuOpen(sessionId);
  }

  function handleAction(action, sessionId) {
    setMenuOpen(null);
    if (onAction) onAction(action, sessionId);
  }

  return (
    <div className="w-80 border-r border-neutral-200 flex flex-col bg-white h-full relative">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
        <button className="px-3 py-1.5 text-sm font-medium bg-neutral-100 rounded-md text-neutral-700">
          All &#9662;
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100 rounded-md">
          <Filter className="w-3.5 h-3.5" />
          Filters
        </button>
        <div className="flex-1" />
        <button className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-orange-500 hover:bg-orange-50 rounded-md">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 p-6">
            <MessageSquare className="w-10 h-10 text-neutral-200 mb-3" />
            <p className="text-sm font-medium text-neutral-500">No conversations</p>
            <p className="text-xs text-neutral-400 mt-1 text-center">
              Open <span className="font-mono text-orange-500">/widget</span> in another tab to test
            </p>
          </div>
        )}

        {conversations.map((conv) => {
          const isActive = activeConversation?.sessionId === conv.sessionId;
          const isResolved = conv.status === "resolved";
          const isUnread = conv.unread;

          return (
            <div
              key={conv.sessionId}
              className={`relative px-4 py-3 flex items-start gap-3 border-b border-neutral-100 transition-colors cursor-pointer group ${
                isActive ? "bg-orange-50" : isUnread ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-neutral-50"
              }`}
              onClick={() => onSelect(conv)}
              onContextMenu={(e) => { e.preventDefault(); openMenu(e, conv.sessionId); }}
            >
              {/* Status bar (left edge) */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r ${
                isResolved ? "bg-green-400" : isUnread ? "bg-orange-400" : "bg-transparent"
              }`} />

              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={getAvatarByRole("visitor")}
                  alt={conv.visitorName || "Visitor"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {/* Status icon on avatar */}
                {isResolved ? (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                ) : isUnread ? (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white"></span>
                ) : (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-neutral-300 rounded-full border-2 border-white"></span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {conv.flag && <span className="text-sm shrink-0">{conv.flag}</span>}
                    <p className={`text-sm truncate ${isUnread ? "font-bold" : "font-semibold"} ${isActive ? "text-orange-600" : "text-neutral-900"}`}>
                      {conv.visitorName || "Visitor"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {/* Status badge */}
                    {isResolved && (
                      <span className="text-[9px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Resolved</span>
                    )}
                    {isUnread && !isResolved && (
                      <span className="text-[9px] font-semibold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">New</span>
                    )}
                    <span className="text-xs text-neutral-400">
                      {formatTime(conv.createdAt)}
                    </span>
                    {/* More button */}
                    <button
                      onClick={(e) => openMenu(e, conv.sessionId)}
                      className="w-6 h-6 items-center justify-center text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded hidden group-hover:flex"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {conv.email && (
                  <p className="text-[11px] text-blue-500 truncate">{conv.email}</p>
                )}
                <p className={`text-sm truncate mt-0.5 ${isUnread ? "text-neutral-700 font-medium" : "text-neutral-500"}`}>
                  {conv.lastMessage || "No messages yet"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 w-52 animate-in fade-in"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          {conversations.find((c) => c.sessionId === menuOpen)?.status === "resolved" ? (
            <MenuItem
              icon={<Circle className="w-4 h-4" />}
              label="Unresolve"
              onClick={() => handleAction("mark_open", menuOpen)}
            />
          ) : (
            <MenuItem
              icon={<CheckCircle className="w-4 h-4" />}
              label="Resolve"
              onClick={() => handleAction("mark_resolved", menuOpen)}
            />
          )}
          {conversations.find((c) => c.sessionId === menuOpen)?.unread ? (
            <MenuItem
              icon={<Eye className="w-4 h-4" />}
              label="Mark as read"
              onClick={() => handleAction("mark_read", menuOpen)}
            />
          ) : (
            <MenuItem
              icon={<Circle className="w-4 h-4" />}
              label="Mark as unread"
              onClick={() => handleAction("mark_unread", menuOpen)}
            />
          )}
          <div className="my-1 border-t border-neutral-100" />
          <MenuItem
            icon={<Trash2 className="w-4 h-4 text-red-500" />}
            label="Delete conversation"
            className="text-red-500 hover:bg-red-50"
            onClick={() => handleAction("delete", menuOpen)}
          />
        </div>
      )}

      {/* Footer stats */}
      <div className="px-4 py-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
        <span>{stats.online || 0} agents online</span>
        <span>{stats.visitors || 0} visitors</span>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

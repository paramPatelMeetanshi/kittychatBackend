import { useState, useRef, useEffect } from "react";
import { MessageSquare, Filter, Plus, CheckCircle, Circle, MoreHorizontal, Check, Eye, Trash2, Search, X } from "lucide-react";
import { getAvatarByRole, getAvatarUrl, getAvatarFromSeed } from "../avatars";

export default function ConversationList({ conversations, activeConversation, onSelect, onAction, stats, filter, onFilterChange, search, onSearchChange, pagination, onPageChange, loading }) {
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const menuRef = useRef(null);
  const filterRef = useRef(null);
  const searchTimeout = useRef(null);
  const [localSearch, setLocalSearch] = useState(search || "");

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterMenu(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounce search input
  const handleSearchInput = (val) => {
    setLocalSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      onSearchChange(val);
    }, 400);
  };

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(search || "");
  }, [search]);

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

  const filterLabel = {
    all: "All",
    unread: "Unread",
    read: "Read",
    resolved: "Resolved",
    unresolved: "Unresolved",
  };

  return (
    <div className="w-96 border-r border-warm flex flex-col bg-cream h-full relative">
      {/* Header with filter and search */}
      <div className="px-3 py-3 border-b border-warm space-y-2.5">
        {/* Filter row */}
        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filter !== "all" ? "bg-brand-100 text-brand-700" : "bg-sand text-dark-600 hover:bg-warm"
              }`}
            >
              {filterLabel[filter]} <span className="text-[10px]">▾</span>
            </button>
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-warm rounded-xl shadow-card z-50 py-1">
                {Object.entries(filterLabel).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { onFilterChange(key); setShowFilterMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      filter === key ? "bg-brand-50 text-brand-700 font-medium" : "text-dark-600 hover:bg-sand"
                    }`}
                  >
                    {label}
                    {filter === key && <Check className="w-3.5 h-3.5 inline ml-2 text-brand" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Count badge */}
          <span className="text-xs text-dark-400 font-medium">{pagination?.total || conversations.length} chats</span>

          <div className="flex-1" />
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            value={localSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-8 py-2 bg-sand border border-warm rounded-xl text-sm text-dark-800 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand-300 transition-all"
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(""); onSearchChange(""); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-dark-400 p-6">
            <MessageSquare className="w-10 h-10 text-dark-200 mb-3" />
            <p className="text-sm font-medium text-dark-500">
              {search ? "No matches found" : filter !== "all" ? "No conversations match this filter" : "No conversations"}
            </p>
            <p className="text-xs text-dark-400 mt-1 text-center">
              {search ? "Try a different search term" : "Conversations will appear here"}
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
              className={`relative px-4 py-4 flex items-start gap-3.5 border-b border-warm transition-all cursor-pointer group ${
                isActive ? "bg-brand-50" : isUnread ? "bg-orange-50/40 hover:bg-orange-50/70" : "hover:bg-sand"
              }`}
              onClick={() => onSelect(conv)}
              onContextMenu={(e) => { e.preventDefault(); openMenu(e, conv.sessionId); }}
            >
              {/* Status bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r transition-colors ${
                isActive ? "bg-brand" : isResolved ? "bg-green-400" : isUnread ? "bg-brand-400" : "bg-transparent"
              }`} />

              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={conv.avatar ? getAvatarUrl(conv.avatar) : getAvatarFromSeed(conv.sessionId)}
                  alt={conv.visitorName || "Visitor"}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-warm"
                />
                {isResolved ? (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-cream flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                ) : isUnread ? (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-brand rounded-full border-2 border-cream"></span>
                ) : (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-dark-200 rounded-full border-2 border-cream"></span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {conv.flag && <span className="text-sm shrink-0">{conv.flag}</span>}
                    <p className={`text-base truncate ${isUnread ? "font-bold" : "font-semibold"} ${isActive ? "text-brand-700" : "text-dark-900"}`}>
                      {conv.visitorName || "Visitor"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="text-xs text-dark-400">{formatTime(conv.lastMessageAt)}</span>
                    <button
                      onClick={(e) => openMenu(e, conv.sessionId)}
                      className="w-6 h-6 items-center justify-center text-dark-300 hover:text-dark-600 hover:bg-warm rounded hidden group-hover:flex"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {conv.email && (
                  <p className="text-[11px] text-brand-600 truncate font-medium">{conv.email}</p>
                )}
                <p className={`text-sm truncate mt-0.5 ${isUnread ? "text-dark-700 font-medium" : "text-dark-400"}`}>
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
          className="fixed z-50 bg-white rounded-xl shadow-lifted border border-warm py-1.5 w-52"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          {conversations.find((c) => c.sessionId === menuOpen)?.status === "resolved" ? (
            <MenuItem icon={<Circle className="w-4 h-4" />} label="Unresolve" onClick={() => handleAction("mark_open", menuOpen)} />
          ) : (
            <MenuItem icon={<CheckCircle className="w-4 h-4" />} label="Resolve" onClick={() => handleAction("mark_resolved", menuOpen)} />
          )}
          {conversations.find((c) => c.sessionId === menuOpen)?.unread ? (
            <MenuItem icon={<Eye className="w-4 h-4" />} label="Mark as read" onClick={() => handleAction("mark_read", menuOpen)} />
          ) : (
            <MenuItem icon={<Circle className="w-4 h-4" />} label="Mark as unread" onClick={() => handleAction("mark_unread", menuOpen)} />
          )}
          <div className="my-1 border-t border-warm" />
          <MenuItem
            icon={<Trash2 className="w-4 h-4 text-red-500" />}
            label="Delete conversation"
            className="text-red-500 hover:bg-red-50"
            onClick={() => handleAction("delete", menuOpen)}
          />
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-3 py-2 border-t border-warm flex items-center justify-between">
          <button
            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
            className="px-2.5 py-1 text-xs font-medium text-dark-500 bg-sand rounded-lg hover:bg-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-[11px] text-dark-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
            disabled={pagination.page >= pagination.totalPages}
            className="px-2.5 py-1 text-xs font-medium text-dark-500 bg-sand rounded-lg hover:bg-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-warm flex items-center justify-between text-xs text-dark-400 bg-sand">
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
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-dark-700 hover:bg-sand transition-colors ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

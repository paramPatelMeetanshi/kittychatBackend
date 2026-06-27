import { useState, useEffect } from "react";
import { Users, Globe, Monitor, Clock, MapPin, Search, RefreshCw, MessageSquare, Eye } from "lucide-react";
import { getAvatarByRole } from "../avatars";
import MagicBrowser from "./MagicBrowser";

const SERVER_HOST = window.location.host;
const API_URL = `${window.location.protocol}//${SERVER_HOST}`;

export default function VisitorsPage({ token, onOpenConversation }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | online | browsing | chatting
  const [magicSession, setMagicSession] = useState(null); // { sessionId, name }

  const fetchVisitors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/visitors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.visitors || []);
      }
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const onlineCount = visitors.filter((v) => v.online).length;
  const browsingCount = visitors.filter((v) => v.online && !v.hasConversation).length;
  const chattingCount = visitors.filter((v) => v.online && v.hasConversation).length;

  const filtered = visitors.filter((v) => {
    if (filter === "online") return v.online;
    if (filter === "browsing") return v.online && !v.hasConversation;
    if (filter === "chatting") return v.online && v.hasConversation;
    return true;
  }).filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (v.name || "").toLowerCase().includes(q) ||
      (v.email || "").toLowerCase().includes(q) ||
      (v.city || "").toLowerCase().includes(q) ||
      (v.country || "").toLowerCase().includes(q)
    );
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  };

  // If magic browser is open, show it fullscreen
  if (magicSession) {
    return (
      <MagicBrowser
        sessionId={magicSession.sessionId}
        visitorName={magicSession.name}
        onClose={() => setMagicSession(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-neutral-900">Visitors</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              {onlineCount} online
            </span>
          </div>
          <button
            onClick={fetchVisitors}
            className="p-2 text-neutral-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-3">
          <StatBadge
            label="Online"
            count={onlineCount}
            color="green"
            active={filter === "online"}
            onClick={() => setFilter(filter === "online" ? "all" : "online")}
          />
          <StatBadge
            label="Browsing"
            count={browsingCount}
            color="blue"
            active={filter === "browsing"}
            onClick={() => setFilter(filter === "browsing" ? "all" : "browsing")}
          />
          <StatBadge
            label="Chatting"
            count={chattingCount}
            color="orange"
            active={filter === "chatting"}
            onClick={() => setFilter(filter === "chatting" ? "all" : "chatting")}
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, email, city..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
          />
        </div>
      </div>

      {/* Visitor List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-neutral-400">Loading visitors...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 p-6">
            <Users className="w-10 h-10 text-neutral-200 mb-3" />
            <p className="text-sm font-medium text-neutral-500">No visitors found</p>
            <p className="text-xs text-neutral-400 mt-1">
              {filter !== "all" ? "Try changing the filter" : "Visitors will appear here when they connect"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((visitor) => (
              <VisitorRow
                key={visitor.sessionId}
                visitor={visitor}
                formatTime={formatTime}
                onOpenConversation={onOpenConversation}
                onMagicBrowse={(v) => setMagicSession({ sessionId: v.sessionId, name: v.name })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBadge({ label, count, color, active, onClick }) {
  const colors = {
    green: active ? "bg-green-100 text-green-700 border-green-300" : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-green-300",
    blue: active ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-blue-300",
    orange: active ? "bg-orange-100 text-orange-700 border-orange-300" : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-orange-300",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${colors[color]}`}
    >
      {label}: {count}
    </button>
  );
}

function VisitorRow({ visitor, formatTime, onOpenConversation, onMagicBrowse }) {
  return (
    <div className="px-6 py-3 flex items-center gap-4 hover:bg-white transition-colors">
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={getAvatarByRole("visitor")}
          alt={visitor.name || "Visitor"}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            visitor.online ? "bg-green-500" : "bg-neutral-300"
          }`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-neutral-900 truncate">
            {visitor.flag && <span className="mr-1">{visitor.flag}</span>}
            {visitor.name || "Anonymous"}
          </p>
          {visitor.online && (
            <span className="text-[9px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full shrink-0">
              Live
            </span>
          )}
          {visitor.hasConversation && (
            <span className="text-[9px] font-semibold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full shrink-0">
              Chatting
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500">
          {visitor.email && <span className="text-blue-500 truncate">{visitor.email}</span>}
          {visitor.city && (
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" /> {visitor.city}
            </span>
          )}
          {visitor.browser && (
            <span className="flex items-center gap-0.5">
              <Monitor className="w-3 h-3" /> {visitor.browser}
            </span>
          )}
        </div>
        {visitor.currentPage && (
          <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
            <Globe className="w-3 h-3 inline mr-0.5" />
            {visitor.currentPage}
          </p>
        )}
      </div>

      {/* Time & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-neutral-400">
          {formatTime(visitor.online ? visitor.lastSeenAt : visitor.lastSeenAt)}
        </span>
        {visitor.online && onMagicBrowse && (
          <button
            onClick={() => onMagicBrowse(visitor)}
            title="Magic Browse - Watch live"
            className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        {visitor.hasConversation && onOpenConversation && (
          <button
            onClick={() => onOpenConversation(visitor.sessionId)}
            title="Open conversation"
            className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

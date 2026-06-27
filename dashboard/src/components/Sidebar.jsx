import {
  Inbox,
  Users,
  MessageSquare,
  Search,
  Settings,
  HelpCircle,
  BarChart3,
  BookOpen,
  Megaphone,
  Contact,
  Bot,
  User,
  LogOut,
  Activity,
  ExternalLink,
  Mail,
  Code,
  Plug,
  Sparkles,
} from "lucide-react";
import { getAvatarByRole, getAvatarUrl } from "../avatars";

export default function Sidebar({ stats, connected, username, userAvatar, onLogout, onToggleWidget, inboxCount, activeView, onSetView }) {
  return (
    <div className="flex h-full">
      <aside className="w-[230px] bg-sand grain flex flex-col h-full border-r border-warm overflow-hidden">
        {/* Workspace header */}
        <div className="px-4 py-5 border-b border-warm relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-cozy flex items-center justify-center shadow-brand">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-base font-bold text-dark-900 truncate">KittyChat</p>
              <p className="text-xs text-dark-400 truncate">{username}</p>
            </div>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${connected ? "bg-green-500" : "bg-red-400"}`}></span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 relative z-10">
          {/* Conversations */}
          <div>
            <SectionLabel>Conversations</SectionLabel>
            <NavItem icon={Inbox} label="Inbox" badge={inboxCount} active={activeView === "inbox"} onClick={() => onSetView("inbox")} anim="bounce" />
            <NavItem icon={Users} label="Visitors" badge={stats.visitors} active={activeView === "visitors"} onClick={() => onSetView("visitors")} anim="swing" />
          </div>

          {/* Engage */}
          <div>
            <SectionLabel>Engage</SectionLabel>
            <NavItem icon={BookOpen} label="Knowledge Base" active={activeView === "articles"} onClick={() => onSetView("articles")} anim="flip" />
          </div>

          {/* Configure */}
          <div>
            <SectionLabel>Configure</SectionLabel>
            <NavItem icon={Bot} label="AI Agent" active={activeView === "agentic"} onClick={() => onSetView("agentic")} anim="pulse" />
            <NavItem icon={Mail} label="Email" active={activeView === "email"} onClick={() => onSetView("email")} anim="wiggle" />
            <NavItem icon={Code} label="Install Widget" active={activeView === "install"} onClick={() => onSetView("install")} anim="bounce" />
            <NavItem icon={Activity} label="Test Widget" active={activeView === "test"} onClick={() => onSetView("test")} anim="pulse" />
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-warm space-y-0.5 relative z-10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium group"
          >
            <LogOut className="w-4 h-4 group-hover:animate-icon-wiggle" />
            <span>Sign out</span>
          </button>
        </div>

        {/* User profile */}
        <div className="px-4 py-3 border-t border-warm flex items-center gap-3 relative z-10">
          <img
            src={getAvatarUrl(userAvatar)}
            alt={username}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-warm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-dark-900 truncate">{username}</p>
            <p className="text-xs text-dark-400">Online</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

// Animation class map
const ANIM_MAP = {
  bounce: "group-hover:animate-icon-bounce",
  wiggle: "group-hover:animate-icon-wiggle",
  swing: "group-hover:animate-icon-swing",
  pulse: "group-hover:animate-icon-pulse",
  flip: "group-hover:animate-icon-flip",
};

function NavItem({ icon: Icon, label, badge, active, onClick, anim = "bounce" }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
        active
          ? "bg-brand-100 text-brand-700 font-semibold"
          : "text-dark-500 hover:bg-warm hover:text-dark-800"
      }`}
    >
      <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform ${active ? "text-brand-600" : ""} ${ANIM_MAP[anim] || ""}`} />
      <span className="text-sm flex-1 truncate">{label}</span>
      {badge > 0 && (
        <span className={`text-[11px] font-bold min-w-[22px] h-[22px] flex items-center justify-center rounded-full px-1.5 ${
          active ? "bg-brand text-white" : "bg-warm text-dark-500"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-dark-300">
      {children}
    </p>
  );
}

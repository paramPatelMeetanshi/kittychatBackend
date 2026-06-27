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
} from "lucide-react";
import { getAvatarByRole } from "../avatars";

export default function Sidebar({ stats, connected, username, onLogout, onToggleWidget, inboxCount, activeView, onSetView }) {
  return (
    <aside className="w-16 bg-white border-r border-neutral-200 flex flex-col items-center py-3 h-full">
      {/* Logo */}
      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
        <MessageSquare className="w-5 h-5 text-white" />
      </div>

      {/* Status dot */}
      <div className="mb-4">
        <span className={`w-2.5 h-2.5 rounded-full block ${connected ? "bg-green-500" : "bg-red-500"}`}></span>
      </div>

      {/* Nav icons */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        <NavBtn icon={Inbox} label="Inbox" badge={inboxCount} active={activeView === "inbox"} onClick={() => onSetView("inbox")} />
        <NavBtn icon={Bot} label="Agentic Settings" active={activeView === "agentic"} onClick={() => onSetView("agentic")} />
        <NavBtn icon={Mail} label="Email Settings" active={activeView === "email"} onClick={() => onSetView("email")} />
        <NavBtn icon={BookOpen} label="Articles" active={activeView === "articles"} onClick={() => onSetView("articles")} />
        <NavBtn icon={Users} label="Visitors" badge={stats.visitors} active={activeView === "visitors"} onClick={() => onSetView("visitors")} />
        <NavBtn icon={Code} label="Install Widget" active={activeView === "install"} onClick={() => onSetView("install")} />
        <NavBtn icon={Contact} label="Contacts" />
        <NavBtn icon={Megaphone} label="Campaigns" />
        <NavBtn icon={BarChart3} label="Analytics" />
      </nav>

      {/* Bottom icons */}
      <div className="flex flex-col items-center gap-1 mt-auto">
        <a
          href="/widget"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Chat Widget"
          className="w-10 h-10 flex items-center justify-center text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
        <button
          onClick={onToggleWidget}
          title="WS Health"
          className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:bg-neutral-100 rounded-xl transition-colors"
        >
          <Activity className="w-5 h-5" />
        </button>
        <button
          title="Settings"
          className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:bg-neutral-100 rounded-xl transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={onLogout}
          title="Sign out"
          className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <img
          src={getAvatarByRole("profile")}
          alt={username}
          className="w-9 h-9 rounded-full object-cover mt-2"
          title={username}
        />
      </div>
    </aside>
  );
}

function NavBtn({ icon: Icon, label, badge, active, onClick }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors relative ${
        active ? "bg-orange-50 text-orange-500" : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
      }`}
    >
      <Icon className="w-5 h-5" />
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
          {badge}
        </span>
      )}
    </button>
  );
}

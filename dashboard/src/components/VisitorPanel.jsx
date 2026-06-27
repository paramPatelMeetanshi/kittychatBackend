import { useState, useEffect } from "react";
import {
  User, Globe, Clock, Monitor, MapPin, Mail, Phone, Eye,
  ChevronDown, ChevronRight, Save, ExternalLink, Flag, FileText,
  Image, MessageSquare, BookOpen,
} from "lucide-react";
import { getAvatarByRole, getAvatarUrl, getAvatarFromSeed } from "../avatars";

export default function VisitorPanel({ visitor, onSaveNotes, otherConversations, sharedImages }) {
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    pages: false,
    images: false,
    otherConvs: false,
    data: false,
    notes: true,
  });

  useEffect(() => {
    setNotes(visitor?.agentNotes || "");
    setNotesSaved(false);
  }, [visitor?.sessionId, visitor?.agentNotes]);

  if (!visitor) {
    return (
      <div className="w-80 border-l border-warm bg-sand flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 bg-warm rounded-full flex items-center justify-center mb-3">
          <User className="w-6 h-6 text-dark-300" />
        </div>
        <p className="text-sm text-dark-400 text-center">Select a conversation to see visitor details</p>
      </div>
    );
  }

  const toggle = (s) => setExpandedSections((p) => ({ ...p, [s]: !p[s] }));
  const handleSave = () => { onSaveNotes(visitor.sessionId, notes); setNotesSaved(true); setTimeout(() => setNotesSaved(false), 2000); };

  const localTime = visitor.timezone
    ? new Date().toLocaleTimeString("en-US", { timeZone: visitor.timezone, hour: "2-digit", minute: "2-digit", hour12: true })
    : null;
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-80 border-l border-warm bg-cream flex flex-col overflow-hidden">
      {/* Visitor identity card */}
      <div className="p-5 bg-sand border-b border-warm text-center">
        <div className="relative inline-block mb-3">
          <img
            src={visitor.avatar ? getAvatarUrl(visitor.avatar) : getAvatarFromSeed(visitor.sessionId)}
            alt={visitor.name || "Visitor"}
            className="w-16 h-16 rounded-full object-cover ring-3 ring-warm"
          />
          <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-sand ${visitor.online ? "bg-green-500" : "bg-dark-300"}`}></span>
        </div>
        <p className="font-heading text-base font-bold text-dark-900">{visitor.name || "Guest Visitor"}</p>
        {visitor.email && (
          <p className="text-xs text-brand-600 mt-1 font-medium">{visitor.email}</p>
        )}
        {visitor.phone && (
          <p className="text-xs text-dark-400 mt-0.5">{visitor.phone}</p>
        )}
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream rounded-full">
          <span className={`w-2 h-2 rounded-full ${visitor.online ? "bg-green-500 animate-pulse" : "bg-dark-300"}`}></span>
          <span className="text-[11px] font-medium text-dark-500">{visitor.online ? "Active now" : "Offline"}</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* Quick info cards */}
        <div className="p-4 space-y-2.5">
          {/* Location */}
          <InfoCard
            icon={MapPin}
            iconBg="bg-brand-50"
            iconColor="text-brand-600"
            title={visitor.country ? `${visitor.flag || ""} ${visitor.city || ""}, ${visitor.country}` : "Location unknown"}
            subtitle={visitor.timezone ? `${visitor.timezone}${localTime ? ` • ${localTime}` : ""}` : "Timezone not detected"}
          />

          {/* Current page */}
          {visitor.currentPage && (
            <InfoCard
              icon={Globe}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              title="Current Page"
              subtitle={visitor.currentPage}
              link={visitor.currentPage}
            />
          )}

          {/* Device */}
          <InfoCard
            icon={Monitor}
            iconBg="bg-dark-50"
            iconColor="text-dark-600"
            title={`${visitor.browser || "Unknown"} • ${visitor.os || "Unknown"}`}
            subtitle={`${visitor.device || "Desktop"}${visitor.screenResolution ? ` • ${visitor.screenResolution}` : ""}`}
          />

          {/* First seen */}
          <InfoCard
            icon={Clock}
            iconBg="bg-dark-50"
            iconColor="text-dark-600"
            title={`Chat started ${formatDate(visitor.createdAt)}`}
            subtitle={visitor.ip ? `IP: ${visitor.ip}` : null}
          />
        </div>

        {/* Collapsible sections */}
        <div className="border-t border-warm">
          {/* Shared Images */}
          <SectionToggle
            label="Shared Images"
            count={sharedImages?.length || 0}
            expanded={expandedSections.images}
            onToggle={() => toggle("images")}
          />
          {expandedSections.images && (
            <div className="px-4 pb-3">
              {sharedImages && sharedImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {sharedImages.map((img, i) => (
                    <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={img.url} alt={img.name} className="w-full h-16 object-cover rounded-lg border border-warm hover:border-brand transition-colors" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-dark-400">No images shared yet</p>
              )}
            </div>
          )}

          {/* Other Conversations */}
          <SectionToggle
            label="Other Conversations"
            count={otherConversations?.length || 0}
            expanded={expandedSections.otherConvs}
            onToggle={() => toggle("otherConvs")}
          />
          {expandedSections.otherConvs && (
            <div className="px-4 pb-3">
              {otherConversations && otherConversations.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {otherConversations.map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 bg-sand rounded-xl">
                      <MessageSquare className="w-3.5 h-3.5 text-dark-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-dark-700 font-medium truncate">{c.visitorName}</p>
                        <p className="text-[10px] text-dark-400 truncate">{c.lastMessage || "No messages"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-dark-400">No other conversations</p>
              )}
            </div>
          )}

          {/* Pages Visited */}
          <SectionToggle
            label="Pages Visited"
            count={visitor.pageViews?.length || 0}
            expanded={expandedSections.pages}
            onToggle={() => toggle("pages")}
          />
          {expandedSections.pages && (
            <div className="px-4 pb-3">
              {visitor.pageViews && visitor.pageViews.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {visitor.pageViews.slice().reverse().map((pv, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 bg-sand rounded-lg">
                      <FileText className="w-3.5 h-3.5 text-dark-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-dark-800 font-medium truncate">{pv.title || "Untitled"}</p>
                        <p className="text-[10px] text-dark-400 truncate">{pv.url}</p>
                        <p className="text-[9px] text-dark-300 mt-0.5">{formatDate(pv.at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-dark-400">No pages tracked</p>
              )}
            </div>
          )}

          {/* Custom Data */}
          <SectionToggle
            label="Custom Data"
            expanded={expandedSections.data}
            onToggle={() => toggle("data")}
          />
          {expandedSections.data && (
            <div className="px-4 pb-3">
              {visitor.customData && Object.keys(visitor.customData).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(visitor.customData).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-dark-400 font-medium">{k}</span>
                      <span className="text-dark-700 font-mono text-right truncate max-w-[120px]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-dark-400">No custom data</p>}
            </div>
          )}

          {/* Private Notepad */}
          <SectionToggle
            label="Private Notepad"
            expanded={expandedSections.notes}
            onToggle={() => toggle("notes")}
          />
          {expandedSections.notes && (
            <div className="px-4 pb-4">
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
                placeholder="Write private notes about this visitor..."
                className="w-full h-24 px-3 py-2.5 text-sm bg-sand border border-warm rounded-xl resize-none text-dark-700 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand-300 transition-all"
              />
              <button
                onClick={handleSave}
                className={`mt-2.5 flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  notesSaved
                    ? "bg-green-100 text-green-700"
                    : "bg-brand-100 text-brand-700 hover:bg-brand-200"
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                {notesSaved ? "Saved!" : "Save Notes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Session ID footer */}
      <div className="px-4 py-2.5 border-t border-warm bg-sand">
        <p className="text-[10px] text-dark-300 font-mono truncate text-center">{visitor.sessionId}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, iconBg, iconColor, title, subtitle, link }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-sand rounded-xl">
      <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark-800 leading-tight">{title}</p>
        {subtitle && (
          link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-brand-600 hover:underline break-all leading-tight mt-0.5 block">{subtitle}</a>
          ) : (
            <p className="text-[11px] text-dark-400 mt-0.5 break-all leading-tight">{subtitle}</p>
          )
        )}
      </div>
    </div>
  );
}

function SectionToggle({ label, count, expanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-dark-500 uppercase tracking-wider hover:bg-sand transition-colors border-b border-warm"
    >
      <span>{label}{count > 0 ? ` (${count})` : ""}</span>
      {expanded ? <ChevronDown className="w-4 h-4 text-dark-400" /> : <ChevronRight className="w-4 h-4 text-dark-400" />}
    </button>
  );
}

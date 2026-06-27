import { useState, useEffect } from "react";
import {
  User, Globe, Clock, Monitor, MapPin, Mail, Phone, Eye,
  ChevronDown, ChevronRight, Save, ExternalLink, Flag, FileText,
  Image, MessageSquare, BookOpen,
} from "lucide-react";
import { getAvatarByRole } from "../avatars";

export default function VisitorPanel({ visitor, onSaveNotes, otherConversations, sharedImages }) {
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    pages: true,
    main: false,
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
      <div className="w-72 border-l border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
          <User className="w-6 h-6 text-neutral-300" />
        </div>
        <p className="text-xs text-neutral-400 text-center">Visitor details will appear here</p>
      </div>
    );
  }

  const toggle = (s) => setExpandedSections((p) => ({ ...p, [s]: !p[s] }));
  const handleSave = () => { onSaveNotes(visitor.sessionId, notes); setNotesSaved(true); setTimeout(() => setNotesSaved(false), 2000); };

  const SectionHeader = ({ id, label, count }) => (
    <button
      onClick={() => toggle(id)}
      className="w-full flex items-center justify-between px-4 py-2 bg-neutral-50 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider hover:bg-neutral-100 transition-colors border-b border-neutral-100"
    >
      <span>{label}{count > 0 ? ` (${count})` : ""}</span>
      {expandedSections[id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
    </button>
  );

  const localTime = visitor.timezone
    ? new Date().toLocaleTimeString("en-US", { timeZone: visitor.timezone, hour: "2-digit", minute: "2-digit", hour12: true })
    : null;
  const utcTime = new Date().toLocaleTimeString("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false });
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-72 border-l border-neutral-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 text-center">
        <div className="relative inline-block">
          <img
            src={getAvatarByRole("visitor")}
            alt={visitor.name || "Visitor"}
            className="w-14 h-14 rounded-full object-cover mx-auto mb-2"
          />
          {/* Online indicator */}
          <span className={`absolute bottom-2 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${visitor.online ? "bg-green-500" : "bg-neutral-300"}`}></span>
        </div>
        <p className="text-sm font-semibold text-neutral-900">{visitor.name || "Guest Visitor"}</p>
        {visitor.email && <p className="text-xs text-blue-500 mt-0.5">{visitor.email}</p>}
        {visitor.phone && <p className="text-xs text-neutral-500 mt-0.5">{visitor.phone}</p>}
        <p className="text-[10px] text-neutral-400 mt-1">{visitor.online ? "● Active now" : "○ Offline"}</p>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto">

        {/* Time & Location */}
        <div className="px-4 py-3 border-b border-neutral-100 bg-orange-50/50">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900">
                Chat started: {formatDate(visitor.createdAt)}
              </p>
              <p className="text-[10px] text-neutral-400">
                {visitor.timezone || ""}{localTime ? ` (${localTime})` : ""} · UTC: {utcTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              {visitor.flag ? <span className="text-lg">{visitor.flag}</span> : <Flag className="w-4 h-4 text-orange-600" />}
            </div>
            <div>
              {visitor.country && <p className="text-xs font-semibold text-neutral-900">{visitor.flag} {visitor.country}</p>}
              <p className="text-[10px] text-neutral-500">
                {visitor.city ? <span><MapPin className="w-3 h-3 inline" /> {visitor.city}{visitor.region ? `, ${visitor.region}` : ""}</span> : <span className="text-neutral-400">Location not detected</span>}
              </p>
            </div>
          </div>

          {visitor.currentPage && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-neutral-400 mb-0.5">Current Page</p>
                <a href={visitor.currentPage} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all leading-tight">{visitor.currentPage}</a>
              </div>
            </div>
          )}
        </div>

        {/* Browser & IP */}
        <div className="px-4 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center"><Monitor className="w-4 h-4 text-neutral-600" /></div>
            <div>
              <p className="text-xs font-medium text-neutral-900">{visitor.browser || "Unknown"} on {visitor.os || "Unknown"}</p>
              <p className="text-[10px] text-neutral-400">{visitor.device || "Desktop"} · {visitor.screenResolution || "—"}</p>
            </div>
          </div>
          {visitor.ip && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center"><Globe className="w-4 h-4 text-neutral-600" /></div>
              <div><p className="text-xs font-mono text-neutral-700">{visitor.ip}</p><p className="text-[10px] text-neutral-400">IP Address</p></div>
            </div>
          )}
        </div>

        {/* Shared Images */}
        <SectionHeader id="images" label="Shared Images" count={sharedImages?.length || 0} />
        {expandedSections.images && (
          <div className="px-4 py-3 border-b border-neutral-100">
            {sharedImages && sharedImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5">
                {sharedImages.map((img, i) => (
                  <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={img.url} alt={img.name} className="w-full h-16 object-cover rounded-md border border-neutral-200 hover:border-orange-400 transition-colors" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No images shared</p>
            )}
          </div>
        )}

        {/* Other Conversations */}
        <SectionHeader id="otherConvs" label="Other Conversations" count={otherConversations?.length || 0} />
        {expandedSections.otherConvs && (
          <div className="px-4 py-3 border-b border-neutral-100">
            {otherConversations && otherConversations.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {otherConversations.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-2 bg-neutral-50 rounded-lg">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-neutral-700 font-medium truncate">{c.visitorName}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{c.lastMessage || "No messages"}</p>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0">{formatDate(c.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No other conversations from this email</p>
            )}
          </div>
        )}

        {/* Pages Visited */}
        <SectionHeader id="pages" label="Pages Visited" count={visitor.pageViews?.length || 0} />
        {expandedSections.pages && (
          <div className="px-4 py-3 border-b border-neutral-100">
            {visitor.pageViews && visitor.pageViews.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {visitor.pageViews.slice().reverse().map((pv, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-neutral-100 rounded flex items-center justify-center shrink-0 mt-0.5"><FileText className="w-3 h-3 text-neutral-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-800 font-medium truncate">{pv.title || "Untitled"}</p>
                      <a href={pv.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline break-all">{pv.url}</a>
                      <p className="text-[9px] text-neutral-400 mt-0.5">{formatDate(pv.at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No pages tracked</p>
            )}
          </div>
        )}

        {/* Details */}
        <SectionHeader id="main" label="Details" />
        {expandedSections.main && (
          <div className="px-4 py-3 space-y-2.5 border-b border-neutral-100">
            {visitor.email && <InfoRow icon={Mail} label="Email" value={visitor.email} />}
            {visitor.phone && <InfoRow icon={Phone} label="Phone" value={visitor.phone} />}
            <InfoRow icon={Globe} label="Language" value={visitor.language || "Unknown"} />
            <InfoRow icon={Eye} label="Total visits" value={visitor.visitCount || 1} />
            <InfoRow icon={Clock} label="First seen" value={formatDate(visitor.createdAt)} />
            <InfoRow icon={Clock} label="Last active" value={formatDate(visitor.lastSeenAt)} />
            {visitor.referrer && visitor.referrer !== "direct" && <InfoRow icon={ExternalLink} label="Referrer" value={visitor.referrer} />}
          </div>
        )}

        {/* Custom Data */}
        <SectionHeader id="data" label="Custom Data" />
        {expandedSections.data && (
          <div className="px-4 py-3 border-b border-neutral-100">
            {visitor.customData && Object.keys(visitor.customData).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(visitor.customData).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-2 text-xs">
                    <span className="text-neutral-400">{k}</span>
                    <span className="text-neutral-700 font-medium text-right truncate">{String(v)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-neutral-400">No custom data</p>}
          </div>
        )}

        {/* Notepad */}
        <SectionHeader id="notes" label="Private Notepad" />
        {expandedSections.notes && (
          <div className="px-4 py-3">
            <textarea value={notes} onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }} placeholder="Private notes..." className="w-full h-20 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg resize-none text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-orange-400" />
            <button onClick={handleSave} className={`mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${notesSaved ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}>
              <Save className="w-3 h-3" />{notesSaved ? "Saved!" : "Save Notes"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50">
        <p className="text-[10px] text-neutral-400 font-mono truncate">{visitor.sessionId}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-neutral-400 leading-none">{label}</p>
        <p className="text-xs text-neutral-700 mt-0.5 break-all">{value || "—"}</p>
      </div>
    </div>
  );
}

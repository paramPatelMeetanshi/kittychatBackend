import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, User, Paperclip, FileText, Image, Download, X } from "lucide-react";
import { getAvatarByRole, getMessageAvatar } from "../avatars";

const SERVER_HOST = window.location.hostname + ":3001";
const API_URL = `http://${SERVER_HOST}`;

export default function ChatPanel({ activeConversation, messages, typingUsers, username, onReply, onTyping, connected }) {
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingRef = useRef(false);
  const typingTimeout = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!value.trim() && !pendingFile) || !connected || !activeConversation) return;
    onReply(value, pendingFile);
    setValue("");
    setPendingFile(null);
    typingRef.current = false;
    clearTimeout(typingTimeout.current);
    onTyping(false);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      onTyping(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      typingRef.current = false;
      onTyping(false);
    }, 2000);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setPendingFile(data.file);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Empty state
  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-orange-400" />
        </div>
        <p className="text-neutral-500 text-sm font-medium">Select a conversation</p>
        <p className="text-neutral-400 text-xs mt-1">Choose from the list to start replying</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="px-5 py-3 border-b border-neutral-200 flex items-center gap-3 bg-white">
        <img
          src={getAvatarByRole("visitor")}
          alt={activeConversation.visitorName || "Visitor"}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {activeConversation.visitorName || "Visitor"}
          </p>
          <p className="text-xs text-neutral-400">
            Session: {activeConversation.sessionId?.slice(0, 8)}...
          </p>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-neutral-400">
          {connected ? "Connected" : "Reconnecting..."}
        </span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-neutral-50">
        {messages.length === 0 && (
          <p className="text-center text-sm text-neutral-400 py-8">No messages yet</p>
        )}

        {messages.map((msg, i) => {
          if (msg.type === "system") {
            return (
              <div key={i} className="flex justify-center">
                <span className="text-xs text-neutral-400 bg-white px-3 py-1 rounded-full border border-neutral-100">
                  {msg.content}
                </span>
              </div>
            );
          }

          const isAgent = msg.fromAgent || msg.sender === username;
          const avatarSrc = getMessageAvatar(msg, username);

          return (
            <div key={msg.id || msg._id || i} className={`flex items-end gap-2 ${isAgent ? "justify-end" : "justify-start"}`}>
              {/* Avatar on left for visitor messages */}
              {!isAgent && (
                <img src={avatarSrc} alt={msg.sender} className="w-7 h-7 rounded-full object-cover shrink-0 mb-5" />
              )}
              <div className="max-w-[70%]">
                <p className={`text-[11px] mb-0.5 ${isAgent ? "text-right text-orange-500" : "text-neutral-400"}`}>
                  {msg.sender}
                  {msg.fromAI && (
                    <span className="ml-1.5 text-[9px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">AI</span>
                  )}
                  {isAgent && !msg.fromAI && (
                    <span className="ml-1.5 text-[9px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Human</span>
                  )}
                </p>

                {/* File attachment */}
                {msg.file && (
                  <FileAttachment file={msg.file} isAgent={isAgent} />
                )}

                {/* Text content */}
                {msg.content && (
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isAgent
                        ? "bg-orange-500 text-white rounded-br-md"
                        : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-md shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                )}

                <p className={`text-[10px] text-neutral-400 mt-1 ${isAgent ? "text-right mr-1" : "ml-1"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {/* Avatar on right for agent/AI messages */}
              {isAgent && (
                <img src={avatarSrc} alt={msg.sender} className="w-7 h-7 rounded-full object-cover shrink-0 mb-5" />
              )}
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="flex items-end gap-2 justify-start">
            <img src={getAvatarByRole("visitor")} alt="typing" className="w-7 h-7 rounded-full object-cover shrink-0" />
            <div className="bg-white border border-neutral-200 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
              <span className="text-xs text-neutral-400 animate-pulse">
                {typingUsers.join(", ")} is typing...
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Pending file preview */}
      {pendingFile && (
        <div className="px-4 py-2 border-t border-neutral-100 bg-orange-50 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-orange-500" />
          <span className="text-xs text-orange-700 flex-1 truncate">{pendingFile.name}</span>
          <span className="text-[10px] text-orange-500">{formatSize(pendingFile.size)}</span>
          <button onClick={() => setPendingFile(null)} className="p-0.5 hover:bg-orange-100 rounded">
            <X className="w-3.5 h-3.5 text-orange-600" />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200 bg-white">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !connected}
            className="p-2.5 text-neutral-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.mp4,.webm,.mp3"
          />
          <input
            value={value}
            onChange={handleChange}
            placeholder={uploading ? "Uploading file..." : `Reply to ${activeConversation.visitorName || "visitor"}...`}
            disabled={!connected || uploading}
            className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!connected || (!value.trim() && !pendingFile)}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-medium rounded-lg transition-colors flex items-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function FileAttachment({ file, isAgent }) {
  const isImage = file.type?.startsWith("image/");

  if (isImage) {
    return (
      <a href={file.url} target="_blank" rel="noopener noreferrer" className="block mb-1">
        <img
          src={file.url}
          alt={file.name}
          className={`max-w-full max-h-48 rounded-xl border border-neutral-200 object-cover ${
            isAgent ? "ml-auto" : ""
          }`}
        />
      </a>
    );
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-1 text-xs transition-colors ${
        isAgent
          ? "bg-orange-400 text-white hover:bg-orange-600"
          : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      <FileText className="w-4 h-4 shrink-0" />
      <span className="flex-1 truncate">{file.name}</span>
      <span className="shrink-0 opacity-70">{formatSize(file.size)}</span>
      <Download className="w-3.5 h-3.5 shrink-0" />
    </a>
  );
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

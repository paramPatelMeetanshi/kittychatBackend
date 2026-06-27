import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, User, Paperclip, FileText, Image, Download, X, Languages, ChevronDown } from "lucide-react";
import { getAvatarByRole, getMessageAvatar, getAvatarUrl, getAvatarFromSeed } from "../avatars";

const SERVER_HOST = import.meta.env.VITE_API_HOST || window.location.host;
const API_URL = `${window.location.protocol}//${SERVER_HOST}`;

const LANGUAGES = [
  { code: "english", label: "English" },
  { code: "hindi", label: "Hindi" },
  { code: "spanish", label: "Spanish" },
  { code: "french", label: "French" },
  { code: "german", label: "German" },
  { code: "portuguese", label: "Portuguese" },
  { code: "arabic", label: "Arabic" },
  { code: "chinese", label: "Chinese" },
  { code: "japanese", label: "Japanese" },
  { code: "korean", label: "Korean" },
  { code: "russian", label: "Russian" },
  { code: "italian", label: "Italian" },
  { code: "dutch", label: "Dutch" },
  { code: "turkish", label: "Turkish" },
  { code: "thai", label: "Thai" },
  { code: "vietnamese", label: "Vietnamese" },
  { code: "indonesian", label: "Indonesian" },
  { code: "malay", label: "Malay" },
  { code: "bengali", label: "Bengali" },
  { code: "tamil", label: "Tamil" },
  { code: "telugu", label: "Telugu" },
  { code: "gujarati", label: "Gujarati" },
  { code: "marathi", label: "Marathi" },
  { code: "urdu", label: "Urdu" },
];

export default function ChatPanel({ activeConversation, visitorInfo, messages, typingUsers, typingPreview, username, userAvatar, onReply, onTyping, connected, emailPrompt, emailStatus, onSendEmail, onDismissEmailPrompt }) {
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [translations, setTranslations] = useState({}); // { messageId: { translatedText, detectedLanguage, meaning } }
  const [translatingId, setTranslatingId] = useState(null);
  const [outboundTranslation, setOutboundTranslation] = useState(null); // { translatedText, targetLanguage }
  const [translatingOutbound, setTranslatingOutbound] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { msgId, content, x, y }
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingRef = useRef(false);
  const typingTimeout = useRef(null);
  const langPickerRef = useRef(null);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close language picker and context menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target)) {
        setShowLangPicker(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!value.trim() && !pendingFile) || !connected || !activeConversation) return;
    // If there's an outbound translation, send the translated text
    const textToSend = outboundTranslation ? outboundTranslation.translatedText : value;
    onReply(textToSend, pendingFile);
    setValue("");
    setPendingFile(null);
    setOutboundTranslation(null);
    typingRef.current = false;
    clearTimeout(typingTimeout.current);
    onTyping(false);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    setOutboundTranslation(null); // Clear translation when typing new text
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

  // Translate incoming message to English (click on visitor message)
  const handleTranslateMessage = async (msgId, content) => {
    if (translations[msgId] || translatingId === msgId) return;
    setTranslatingId(msgId);
    try {
      const token = localStorage.getItem("chat_token");
      const res = await fetch(`${API_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: content, targetLang: "english" }),
      });
      const data = await res.json();
      if (res.ok) {
        setTranslations((prev) => ({ ...prev, [msgId]: data }));
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setTranslatingId(null);
    }
  };

  // Translate outbound message to a target language
  const handleTranslateOutbound = async (targetLang) => {
    if (!value.trim() || translatingOutbound) return;
    setShowLangPicker(false);
    setTranslatingOutbound(true);
    try {
      const token = localStorage.getItem("chat_token");
      const res = await fetch(`${API_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: value.trim(), targetLang }),
      });
      const data = await res.json();
      if (res.ok) {
        setOutboundTranslation({ translatedText: data.translatedText, targetLanguage: data.targetLanguage });
      }
    } catch (err) {
      console.error("Outbound translation failed:", err);
    } finally {
      setTranslatingOutbound(false);
    }
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
          src={visitorInfo?.avatar ? getAvatarUrl(visitorInfo.avatar) : (activeConversation.avatar ? getAvatarUrl(activeConversation.avatar) : getAvatarFromSeed(activeConversation.sessionId))}
          alt={activeConversation.visitorName || "Visitor"}
          className="w-11 h-11 rounded-full object-cover ring-2 ring-warm"
        />
        <div>
          <p className="text-base font-bold text-dark-900">
            {activeConversation.visitorName || "Visitor"}
          </p>
          <p className="text-sm text-dark-400">
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
          const visitorAvatar = msg.senderAvatar || visitorInfo?.avatar || null;
          const avatarSrc = isAgent
            ? (msg.fromAI ? getAvatarUrl("aicat") : getAvatarUrl(msg.senderAvatar || userAvatar))
            : (visitorAvatar ? getAvatarUrl(visitorAvatar) : getAvatarFromSeed(activeConversation.sessionId));

          return (
            <div key={msg.id || msg._id || i} className={`flex items-end gap-2 ${isAgent ? "justify-end" : "justify-start"}`}>
              {/* Avatar on left for visitor messages */}
              {!isAgent && (
                <img src={avatarSrc} alt={msg.sender} className="w-9 h-9 rounded-full object-cover shrink-0 mb-5" />
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
                  <div className="relative">
                    <div
                      onClick={(e) => {
                        if (!isAgent && msg.content) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setContextMenu({
                            msgId: msg.id || msg._id || i,
                            content: msg.content,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          });
                        }
                      }}
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isAgent
                          ? "bg-orange-500 text-white rounded-br-md"
                          : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-md shadow-sm cursor-pointer hover:border-neutral-300 hover:shadow-md transition-all"
                      }`}
                    >
                      {msg.content}
                      {/* Translating indicator */}
                      {translatingId === (msg.id || msg._id || i) && (
                        <p className="text-[10px] text-blue-400 mt-1 animate-pulse">Translating...</p>
                      )}
                    </div>

                    {/* Context menu */}
                    {contextMenu && contextMenu.msgId === (msg.id || msg._id || i) && (
                      <div
                        ref={contextMenuRef}
                        className="absolute z-50 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 min-w-[160px]"
                        style={{ top: contextMenu.y + 8, left: Math.min(contextMenu.x, 100) }}
                      >
                        <button
                          onClick={() => {
                            handleTranslateMessage(contextMenu.msgId, contextMenu.content);
                            setContextMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                        >
                          <Languages className="w-3.5 h-3.5" />
                          Translate to English
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(contextMenu.content);
                            setContextMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                          Copy message
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Translation result */}
                {translations[msg.id || msg._id || i] && (
                  <div className="mt-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                    <p className="text-blue-700 font-medium">{translations[msg.id || msg._id || i].translatedText}</p>
                    {translations[msg.id || msg._id || i].meaning && (
                      <p className="text-blue-500 mt-0.5 italic">{translations[msg.id || msg._id || i].meaning}</p>
                    )}
                    <p className="text-blue-400 mt-0.5 text-[10px]">
                      Detected: {translations[msg.id || msg._id || i].detectedLanguage}
                    </p>
                  </div>
                )}

                <p className={`text-[10px] text-neutral-400 mt-1 ${isAgent ? "text-right mr-1" : "ml-1"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {/* Avatar on right for agent/AI messages */}
              {isAgent && (
                <img src={avatarSrc} alt={msg.sender} className="w-9 h-9 rounded-full object-cover shrink-0 mb-5" />
              )}
            </div>
          );
        })}

        {/* Live typing preview — shows actual text visitor is typing */}
        {typingPreview && typingPreview.content && (
          <div className="flex items-end gap-2 justify-start">
            <img src={getAvatarByRole("visitor")} alt="typing" className="w-9 h-9 rounded-full object-cover shrink-0" />
            <div className="bg-white border border-dashed border-orange-300 px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[70%]">
              <p className="text-sm text-neutral-500 italic leading-relaxed break-words">{typingPreview.content}</p>
              <p className="text-[10px] text-orange-400 mt-0.5">{typingPreview.sender} is typing</p>
            </div>
          </div>
        )}

        {/* Fallback: show "is typing..." when no preview content */}
        {!typingPreview && typingUsers.length > 0 && (
          <div className="flex items-end gap-2 justify-start">
            <img src={getAvatarByRole("visitor")} alt="typing" className="w-9 h-9 rounded-full object-cover shrink-0" />
            <div className="bg-white border border-neutral-200 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
              <span className="text-xs text-neutral-400 animate-pulse">
                {typingUsers.join(", ")} is typing...
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Email prompt - shown when visitor is offline */}
      {emailPrompt && !emailPrompt.noEmail && (
        <div className="px-4 py-3 border-t border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">Visitor is offline</p>
              <p className="text-xs text-orange-700 mt-0.5">
                {emailPrompt.visitorName} has an email on file ({emailPrompt.email}). Send this message via email?
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={onSendEmail}
                  className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Send Email
                </button>
                <button
                  onClick={onDismissEmailPrompt}
                  className="px-3 py-1.5 bg-white text-orange-700 text-xs font-medium rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline notice without email */}
      {emailPrompt && emailPrompt.noEmail && (
        <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50">
          <p className="text-xs text-neutral-500 text-center">Visitor is offline. No email on file — message will be delivered when they return.</p>
        </div>
      )}

      {/* Email status */}
      {emailStatus && (
        <div className={`px-4 py-2 border-t text-xs text-center ${emailStatus.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {emailStatus.text}
        </div>
      )}

      {/* Outbound translation preview */}
      {outboundTranslation && (
        <div className="px-4 py-2 border-t border-blue-100 bg-blue-50 flex items-center gap-2">
          <Languages className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-700 font-medium truncate">{outboundTranslation.translatedText}</p>
            <p className="text-[10px] text-blue-400">Translated to {outboundTranslation.targetLanguage}</p>
          </div>
          <button onClick={() => setOutboundTranslation(null)} className="p-0.5 hover:bg-blue-100 rounded">
            <X className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>
      )}

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
          {/* Translate button with language picker */}
          <div className="relative" ref={langPickerRef}>
            <button
              type="button"
              onClick={() => value.trim() && setShowLangPicker(!showLangPicker)}
              disabled={!value.trim() || translatingOutbound}
              className="p-2.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Translate before sending"
            >
              {translatingOutbound ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Languages className="w-4 h-4" />
              )}
            </button>
            {/* Language dropdown */}
            {showLangPicker && (
              <div className="absolute bottom-12 right-0 w-48 max-h-64 overflow-y-auto bg-white border border-neutral-200 rounded-xl shadow-lg z-50">
                <div className="p-2">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase px-2 py-1">Translate to</p>
                  {LANGUAGES.filter(l => l.code !== "english").map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleTranslateOutbound(lang.code)}
                      className="w-full text-left px-3 py-1.5 text-sm text-neutral-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!connected || (!value.trim() && !pendingFile && !outboundTranslation)}
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

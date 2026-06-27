import { useState, useEffect } from "react";
import { Bot, Zap, ToggleLeft, ToggleRight, AlertCircle, Clock, Timer, MessageSquare, Save } from "lucide-react";

const SERVER_HOST = window.location.hostname + ":3001";
const API_URL = `http://${SERVER_HOST}`;

export default function AgenticSettings({ token }) {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [fallbackMinutes, setFallbackMinutes] = useState(0);
  const [fallbackEnabled, setFallbackEnabled] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState("");
  const [personality, setPersonality] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fallbackSaved, setFallbackSaved] = useState(false);
  const [promptsSaved, setPromptsSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchPrompts();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch(`${API_URL}/api/settings/ai`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAiEnabled(data.enabled);
        setAiConfigured(data.aiConfigured);
        setFallbackMinutes(data.fallbackMinutes || 5);
        setFallbackEnabled(data.fallbackEnabled || false);
      }
    } catch (err) {
      console.error("Failed to fetch AI settings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPrompts() {
    try {
      const res = await fetch(`${API_URL}/api/settings/ai-prompts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSystemInstruction(data.systemInstruction || "");
        setPersonality(data.personality || "");
      }
    } catch (err) {
      console.error("Failed to fetch prompts:", err);
    }
  }

  async function toggleAI() {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/settings/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: !aiEnabled }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiEnabled(data.enabled);
      }
    } catch (err) {
      console.error("Failed to toggle AI:", err);
    } finally {
      setSaving(false);
    }
  }

  async function saveFallback() {
    try {
      const res = await fetch(`${API_URL}/api/settings/ai-fallback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fallbackEnabled, fallbackMinutes: Number(fallbackMinutes) }),
      });
      if (res.ok) {
        setFallbackSaved(true);
        setTimeout(() => setFallbackSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save fallback:", err);
    }
  }

  async function savePrompts() {
    try {
      const res = await fetch(`${API_URL}/api/settings/ai-prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ systemInstruction, personality }),
      });
      if (res.ok) {
        setPromptsSaved(true);
        setTimeout(() => setPromptsSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save prompts:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-neutral-50 overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Agentic Settings</h1>
            <p className="text-xs text-neutral-500">Configure AI auto-reply and fallback behavior</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-xl">
        {/* AI Toggle Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${aiEnabled ? "bg-green-100" : "bg-neutral-100"}`}>
                <Zap className={`w-4 h-4 ${aiEnabled ? "text-green-600" : "text-neutral-400"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">AI Auto-Reply</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Gemini AI replies instantly to every visitor message.
                </p>
              </div>
            </div>
            <button onClick={toggleAI} disabled={saving || !aiConfigured} className="shrink-0">
              {aiEnabled ? (
                <ToggleRight className="w-10 h-10 text-orange-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-neutral-300" />
              )}
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${aiEnabled ? "bg-green-500" : "bg-neutral-300"}`}></span>
              <span className="text-xs font-medium text-neutral-700">
                {aiEnabled ? "AI is active — responding to all visitors instantly" : "AI instant-reply is off"}
              </span>
            </div>
          </div>
        </div>

        {/* AI Fallback Timer Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${fallbackEnabled ? "bg-orange-100" : "bg-neutral-100"}`}>
                <Timer className={`w-4 h-4 ${fallbackEnabled ? "text-orange-600" : "text-neutral-400"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">AI Fallback Timer</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  If a human agent doesn't reply within the set time, AI will respond automatically. Works even when AI Auto-Reply is OFF.
                </p>
              </div>
            </div>
            <button onClick={() => setFallbackEnabled(!fallbackEnabled)} disabled={!aiConfigured} className="shrink-0">
              {fallbackEnabled ? (
                <ToggleRight className="w-10 h-10 text-orange-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-neutral-300" />
              )}
            </button>
          </div>

          {/* Timer input */}
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-600">Reply after</span>
              <input
                type="number"
                min="1"
                max="60"
                value={fallbackMinutes}
                onChange={(e) => setFallbackMinutes(e.target.value)}
                className="w-16 px-2 py-1.5 text-sm text-center border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              />
              <span className="text-xs text-neutral-600">minutes of no human reply</span>
            </div>
            <button
              onClick={saveFallback}
              className={`mt-3 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                fallbackSaved
                  ? "bg-green-50 text-green-600"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {fallbackSaved ? "Saved!" : "Save Fallback Settings"}
            </button>
          </div>

          {/* Explanation */}
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Example: Set to 3 minutes. Visitor sends "Hi" → Agent has 3 minutes to reply → If no reply, AI sends an automatic response to keep the visitor engaged.
            </p>
          </div>
        </div>

        {/* AI Personality & Prompts */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">AI Personality & Instructions</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Customize how the AI responds. These apply to both instant and fallback replies.
              </p>
            </div>
          </div>

          {/* System Instruction */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">System Instruction</label>
            <p className="text-[11px] text-neutral-400 mb-2">
              Define the AI's role, what it should/shouldn't do, knowledge boundaries, and escalation rules.
            </p>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              placeholder="You are a customer support agent for [Company Name]. You help users with billing, account issues, and product questions. If you don't know something, offer to connect them with a human agent. Never share pricing — direct them to the pricing page instead."
              className="w-full h-32 px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg resize-y text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            />
          </div>

          {/* Personality / Tone */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">Personality & Tone</label>
            <p className="text-[11px] text-neutral-400 mb-2">
              How should the AI sound? Define tone, length, style, and any formatting preferences.
            </p>
            <textarea
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="Tone: Friendly and professional. Keep replies concise (1-3 sentences). Use the visitor's name when known. Don't use excessive emojis. If the user seems frustrated, be empathetic. End with a question to keep the conversation going."
              className="w-full h-28 px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg resize-y text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            />
          </div>

          <button
            onClick={savePrompts}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              promptsSaved
                ? "bg-green-50 text-green-600"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              {promptsSaved ? "Saved!" : "Save Prompts"}
            </span>
          </button>

          {/* Context info */}
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              The AI receives the <strong>full chat history</strong> of the conversation before generating each reply, plus visitor metadata (name, email, location, current page). This ensures context-aware, non-repetitive responses.
            </p>
          </div>
        </div>

        {/* API Key Status */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${aiConfigured ? "bg-green-100" : "bg-red-50"}`}>
              {aiConfigured ? (
                <Bot className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Gemini API</p>
              {aiConfigured ? (
                <p className="text-xs text-green-600 mt-0.5">Connected — API key configured</p>
              ) : (
                <div>
                  <p className="text-xs text-red-500 mt-0.5">Not configured</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Add <code className="bg-neutral-100 px-1 rounded">GEMINI_API_KEY</code> to <code className="bg-neutral-100 px-1 rounded">server/.env</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <p className="text-sm font-semibold text-neutral-900 mb-3">How it works</p>
          <div className="space-y-2 text-xs text-neutral-600">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <p><strong>AI Auto-Reply ON:</strong> AI responds instantly to every visitor message</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <p><strong>AI Fallback Timer ON:</strong> If human doesn't reply within X minutes, AI steps in (even if Auto-Reply is OFF)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <p><strong>Both OFF:</strong> Purely human-operated chat, no AI involvement</p>
            </div>
          </div>
        </div>

        {/* Message labels */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <p className="text-sm font-semibold text-neutral-900 mb-3">Message Labels</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">AI</span>
              <span className="text-xs text-neutral-600">Replied by Gemini AI (instant or fallback)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Human</span>
              <span className="text-xs text-neutral-600">Replied by a human agent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

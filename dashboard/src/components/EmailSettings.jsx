import { useState, useEffect } from "react";
import { Mail, Server, Save, Send, RefreshCw } from "lucide-react";

const SERVER_HOST = window.location.host;
const API_URL = `${window.location.protocol}//${SERVER_HOST}`;

export default function EmailSettings({ token }) {
  const [settings, setSettings] = useState({
    enabled: false,
    host: "",
    port: 587,
    secure: false,
    user: "",
    pass: "",
    fromEmail: "",
    fromName: "Support Team",
    companyName: "Support",
    siteUrl: "",
    cc: "",
    template: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings/email`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch email settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/settings/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail.trim()) return;
    setTesting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/settings/email/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toEmail: testEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Test email sent to ${testEmail}` });
      } else {
        setMessage({ type: "error", text: data.error || "Test failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Email Settings</h1>
            <p className="text-sm text-neutral-500">Configure SMTP to email visitors when they're offline</p>
          </div>
        </div>

        {/* Status message */}
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        {/* Enable toggle */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="w-4 h-4 accent-orange-500"
            />
            <div>
              <p className="text-sm font-medium text-neutral-900">Enable email notifications</p>
              <p className="text-xs text-neutral-500">Send messages via email when visitors are offline</p>
            </div>
          </label>
        </div>

        {/* SMTP Config */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-900">SMTP Configuration</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">SMTP Host</label>
              <input
                value={settings.host}
                onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Port</label>
              <input
                type="number"
                value={settings.port}
                onChange={(e) => setSettings({ ...settings, port: Number(e.target.value) })}
                placeholder="587"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Username / Email</label>
              <input
                value={settings.user}
                onChange={(e) => setSettings({ ...settings, user: e.target.value })}
                placeholder="you@gmail.com"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Password / App Password</label>
              <input
                type="password"
                value={settings.pass}
                onChange={(e) => setSettings({ ...settings, pass: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.secure}
              onChange={(e) => setSettings({ ...settings, secure: e.target.checked })}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-sm text-neutral-700">Use SSL/TLS (port 465)</span>
          </label>
        </div>

        {/* Sender Info */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Sender Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">From Name</label>
              <input
                value={settings.fromName}
                onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                placeholder="Support Team"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">From Email</label>
              <input
                value={settings.fromEmail}
                onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                placeholder="support@company.com"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Company Name</label>
              <input
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                placeholder="My Company"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Site URL</label>
              <input
                value={settings.siteUrl}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                placeholder="https://yoursite.com"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">CC (comma-separated emails)</label>
            <input
              value={settings.cc}
              onChange={(e) => setSettings({ ...settings, cc: e.target.value })}
              placeholder="manager@company.com, team@company.com"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            />
            <p className="text-[11px] text-neutral-400 mt-1">These addresses will receive a copy of every email sent to visitors</p>
          </div>
        </div>

        {/* Email Template */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Email Template (HTML)</h2>
          <p className="text-xs text-neutral-500">
            Use placeholders: <code className="bg-neutral-100 px-1 rounded">{"{{MESSAGE}}"}</code>, <code className="bg-neutral-100 px-1 rounded">{"{{COMPANY_NAME}}"}</code>, <code className="bg-neutral-100 px-1 rounded">{"{{SITE_URL}}"}</code>, <code className="bg-neutral-100 px-1 rounded">{"{{VISITOR_NAME}}"}</code>
          </p>
          <textarea
            value={settings.template}
            onChange={(e) => setSettings({ ...settings, template: e.target.value })}
            rows={12}
            placeholder="Leave empty to use default template"
            className="w-full px-3 py-2 text-xs font-mono border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-y"
          />
        </div>

        {/* Test Email */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Send Test Email</h2>
          <div className="flex gap-2">
            <input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            />
            <button
              onClick={handleTest}
              disabled={testing || !testEmail.trim()}
              className="px-4 py-2 bg-neutral-800 text-white text-sm font-medium rounded-lg hover:bg-neutral-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {testing ? "Sending..." : "Test"}
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Email Settings"}
        </button>
      </div>
    </div>
  );
}

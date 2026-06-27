import { useState } from "react";
import { Code, Copy, Check, ExternalLink } from "lucide-react";

const SERVER_HOST = import.meta.env.VITE_API_HOST || window.location.host;

export default function WidgetInstall() {
  const [copied, setCopied] = useState(null); // "script" | "full" | null

  const widgetUrl = `${window.location.protocol}//${SERVER_HOST}`;

  const scriptTag = `<!-- KittyChat Widget -->
<script>
  (function() {
    var s = document.createElement('script');
    s.type = 'module';
    s.crossOrigin = 'anonymous';
    s.src = '${widgetUrl}/widget/loader.js';
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`;

  const fullSnippet = `<!-- KittyChat Widget + Session Replay -->
<script>
  (function() {
    var s = document.createElement('script');
    s.type = 'module';
    s.crossOrigin = 'anonymous';
    s.src = '${widgetUrl}/widget/loader.js';
    s.async = true;
    document.head.appendChild(s);

    var t = document.createElement('script');
    t.src = '${widgetUrl}/widget/magic-tracker.js';
    t.async = true;
    document.head.appendChild(t);
  })();
</script>`;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Code className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Install Widget</h1>
            <p className="text-sm text-neutral-500">Add the chat widget to any website with a single script tag</p>
          </div>
        </div>

        {/* Basic Script Tag */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-900">Chat Widget Only</h2>
            <button
              onClick={() => handleCopy(scriptTag, "script")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
            >
              {copied === "script" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === "script" ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mb-3">
            Paste this before the closing <code className="bg-neutral-100 px-1 rounded">&lt;/body&gt;</code> tag on your website.
          </p>
          <pre className="bg-neutral-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
            {scriptTag}
          </pre>
        </div>

        {/* Full Snippet (with session replay) */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-900">Chat + Session Replay (Magic Browser)</h2>
            <button
              onClick={() => handleCopy(fullSnippet, "full")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
            >
              {copied === "full" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === "full" ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mb-3">
            Includes live session replay tracking so you can watch visitor sessions from the dashboard.
          </p>
          <pre className="bg-neutral-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
            {fullSnippet}
          </pre>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">How it works</h2>
          <div className="space-y-2 text-xs text-neutral-600">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <p>The script loads asynchronously — no impact on page speed</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <p>Widget appears as a floating button in the bottom-right corner</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <p>Uses Shadow DOM — won't conflict with your site's styles</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
              <p>Connects to your server at <code className="bg-neutral-100 px-1 rounded">{SERVER_HOST}</code> automatically</p>
            </div>
          </div>
        </div>

        {/* Server URL note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Note:</span> The script URLs point to your current server ({SERVER_HOST}). If your server runs on a different domain or port in production, update the URL in the script tag accordingly.
          </p>
        </div>
      </div>
    </div>
  );
}

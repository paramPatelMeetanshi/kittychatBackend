import { useState } from "react";
import { Play, RefreshCw, ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";

const SERVER_HOST = import.meta.env.VITE_API_HOST || window.location.host;

export default function WidgetTest() {
  const [device, setDevice] = useState("desktop");
  const [key, setKey] = useState(0);

  const widgetUrl = `${window.location.protocol}//${SERVER_HOST}`;

  const testPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KittyChat Widget Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Poppins', -apple-system, sans-serif; background: #FAF8F5; min-height: 100vh; }
    .page { max-width: 800px; margin: 0 auto; padding: 60px 24px; }
    h1 { font-size: 28px; color: #222; margin-bottom: 8px; }
    p { color: #615A52; font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .card { background: white; border: 1px solid #EDE8E0; border-radius: 14px; padding: 24px; margin-top: 24px; }
    .card h2 { font-size: 18px; color: #222; margin-bottom: 8px; }
    .card p { font-size: 14px; }
    .badge { display: inline-block; background: #FFF8F0; color: #FA8112; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="page">
    <span class="badge">Test Page</span>
    <h1>Welcome to our website</h1>
    <p>This is a sample page to test the KittyChat widget. The widget should appear in the bottom-right corner. Click the cat to open it!</p>
    <div class="card">
      <h2>About Us</h2>
      <p>We build amazing products that help businesses connect with their customers through real-time chat support.</p>
    </div>
    <div class="card">
      <h2>Our Services</h2>
      <p>Live chat support, AI-powered responses, knowledge base articles, and session replay — all in one platform.</p>
    </div>
  </div>
  <script>
    (function() {
      var s = document.createElement('script');
      s.type = 'module';
      s.crossOrigin = 'anonymous';
      s.src = '${widgetUrl}/widget/loader.js';
      s.async = true;
      document.head.appendChild(s);
    })();
  </script>
</body>
</html>`;

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-6 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">Test Widget</h1>
              <p className="text-sm text-neutral-500">Preview the widget as your visitors see it</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Device toggle */}
            <div className="flex bg-white border border-neutral-200 rounded-lg p-1 gap-1">
              <button
                onClick={() => setDevice("desktop")}
                className={`p-2 rounded-md transition-colors ${device === "desktop" ? "bg-orange-100 text-orange-600" : "text-neutral-400 hover:text-neutral-600"}`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice("tablet")}
                className={`p-2 rounded-md transition-colors ${device === "tablet" ? "bg-orange-100 text-orange-600" : "text-neutral-400 hover:text-neutral-600"}`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={`p-2 rounded-md transition-colors ${device === "mobile" ? "bg-orange-100 text-orange-600" : "text-neutral-400 hover:text-neutral-600"}`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            {/* Reload */}
            <button
              onClick={() => setKey((k) => k + 1)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload
            </button>
            {/* Open in new tab */}
            <button
              onClick={() => {
                const blob = new Blob([testPageHtml], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                window.open(url, "_blank");
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              New Tab
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 flex items-start justify-center">
          <div
            className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden transition-all duration-300"
            style={{ width: deviceWidths[device], maxWidth: "100%", height: "calc(100vh - 200px)" }}
          >
            <iframe
              key={key}
              srcDoc={testPageHtml}
              className="w-full h-full border-0"
              title="Widget Test Preview"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

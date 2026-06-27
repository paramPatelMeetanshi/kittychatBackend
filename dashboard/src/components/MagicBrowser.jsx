import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Monitor, Globe, Clock, Maximize2, Minimize2, Radio } from "lucide-react";
import { getAvatarByRole } from "../avatars";
import "rrweb/dist/style.css";

const SERVER_HOST = window.location.hostname + ":3001";
const MAGIC_WS_URL = `ws://${SERVER_HOST}/magic?role=dashboard`;

export default function MagicBrowser({ sessionId, visitorName, onClose }) {
  const [status, setStatus] = useState("connecting");
  const [meta, setMeta] = useState(null);
  const [evCount, setEvCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wsRef = useRef(null);
  const containerRef = useRef(null);
  const wrapRef = useRef(null);
  const replayerRef = useRef(null);
  const eventsRef = useRef([]);
  const builtRef = useRef(false);
  const statusRef = useRef("connecting");
  const metaRef = useRef(null);

  useEffect(() => {
    let ws;
    let closed = false;

    function connect() {
      ws = new WebSocket(MAGIC_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (closed) return;
        ws.send(JSON.stringify({ type: "watch", sessionId }));
      };

      ws.onmessage = (e) => {
        if (closed) return;
        let msg;
        try { msg = JSON.parse(e.data); } catch { return; }

        switch (msg.type) {
          case "watch_ack":
            metaRef.current = msg.meta || null;
            setMeta(msg.meta || null);
            statusRef.current = "live";
            setStatus("live");
            break;

          case "session_ended":
            if (msg.sessionId === sessionId) {
              statusRef.current = "ended";
              setStatus("ended");
            }
            break;

          case "url_change":
            if (msg.sessionId === sessionId) {
              setMeta((prev) => prev ? { ...prev, url: msg.url } : prev);
            }
            break;

          case "error":
            statusRef.current = "error";
            setStatus("error");
            break;

          case "replay_events":
            if (msg.sessionId === sessionId) {
              const evs = msg.events || [];
              eventsRef.current = evs;
              setEvCount(evs.length);
              builtRef.current = false;
              tryBuild();
            }
            break;

          case "rrweb_batch":
            if (msg.sessionId === sessionId) {
              const incoming = msg.events || [];
              if (!incoming.length) return;
              eventsRef.current.push(...incoming);

              if (replayerRef.current) {
                for (const ev of incoming) {
                  try { replayerRef.current.addEvent(ev); } catch {}
                }
                // If we just got a full snapshot, re-scale
                if (incoming.some((ev) => ev.type === 2)) {
                  setTimeout(scalePlayer, 50);
                }
              } else if (!builtRef.current) {
                tryBuild();
              }
              setEvCount(eventsRef.current.length);
            }
            break;
        }
      };

      ws.onclose = () => {
        if (!closed && statusRef.current !== "live") {
          setStatus("ended");
        }
      };

      ws.onerror = () => {
        if (!closed) setStatus("error");
      };
    }

    connect();

    return () => {
      closed = true;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "unwatch", sessionId }));
      }
      if (ws) ws.close();
      destroyPlayer();
    };
  }, [sessionId]);

  function tryBuild() {
    if (eventsRef.current.length < 2) return;
    setTimeout(() => {
      if (!builtRef.current) buildPlayer();
    }, 150);
  }

  async function buildPlayer() {
    destroyPlayer();

    const events = eventsRef.current;
    if (!events.length || !wrapRef.current) return;

    const hasSnapshot = events.some((e) => e.type === 2);
    if (!hasSnapshot) return;

    builtRef.current = true;

    try {
      const rrwebModule = await import("rrweb");
      const Replayer = rrwebModule.Replayer;

      if (!Replayer) {
        builtRef.current = false;
        return;
      }

      wrapRef.current.innerHTML = "";

      const r = new Replayer(events, {
        root: wrapRef.current,
        liveMode: true,
      });

      replayerRef.current = r;
      r.startLive();

      setTimeout(() => scalePlayer(), 50);
      setTimeout(() => scalePlayer(), 300);

      statusRef.current = "live";
      setStatus("live");
    } catch (err) {
      console.error("[MagicBrowser] Failed to build replayer:", err);
      builtRef.current = false;
    }
  }

  function scalePlayer() {
    if (!wrapRef.current || !containerRef.current) return;

    const replayerWrapper = wrapRef.current.querySelector(".replayer-wrapper");
    const iframe = wrapRef.current.querySelector("iframe");
    if (!replayerWrapper || !iframe) return;

    const container = containerRef.current;
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    // Get recorded page dimensions
    const iw = parseInt(iframe.width) || parseInt(iframe.getAttribute("width")) || metaRef.current?.screenW || 1920;
    const ih = parseInt(iframe.height) || parseInt(iframe.getAttribute("height")) || metaRef.current?.screenH || 1080;

    // Scale to fill the full container width
    const scale = cw / iw;

    replayerWrapper.style.transform = `scale(${scale})`;
    replayerWrapper.style.transformOrigin = "top left";
    replayerWrapper.style.position = "absolute";
    replayerWrapper.style.left = "0";
    replayerWrapper.style.top = "0";
    replayerWrapper.style.width = `${iw}px`;
    replayerWrapper.style.height = `${ih}px`;

    iframe.style.width = `${iw}px`;
    iframe.style.height = `${ih}px`;
    iframe.style.border = "none";
  }

  useEffect(() => {
    const timer = setTimeout(scalePlayer, 150);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  useEffect(() => {
    const handler = () => scalePlayer();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  function destroyPlayer() {
    if (replayerRef.current) {
      try { replayerRef.current.pause(); } catch {}
      replayerRef.current = null;
    }
    if (wrapRef.current) wrapRef.current.innerHTML = "";
    builtRef.current = false;
  }

  const elapsed = useElapsed(meta?.startTs);

  return (
    <div className={`flex flex-col bg-neutral-900 text-white ${isFullscreen ? "fixed inset-0 z-50" : "flex-1"}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 bg-neutral-800 border-b border-neutral-700 shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <img src={getAvatarByRole("visitor")} alt="visitor" className="w-7 h-7 rounded-full object-cover" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">{visitorName || "Visitor"}</p>
            <StatusBadge status={status} />
          </div>
          {meta?.url && (
            <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1">
              <Globe className="w-3 h-3" /> {meta.url}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          {meta && (
            <span className="flex items-center gap-1">
              <Monitor className="w-3 h-3" /> {meta.screenW}×{meta.screenH}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {elapsed}
          </span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Player area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-white">
        {status === "connecting" && !evCount && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-neutral-900">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-neutral-400">Connecting to session...</p>
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-neutral-900">
            <div className="text-center">
              <p className="text-sm text-red-400 mb-1">Session not available</p>
              <p className="text-xs text-neutral-500">The visitor may not have Magic Browse active</p>
            </div>
          </div>
        )}
        {status === "ended" && !evCount && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-neutral-900">
            <div className="text-center">
              <p className="text-sm text-neutral-400 mb-1">Session ended</p>
              <p className="text-xs text-neutral-500">The visitor has disconnected</p>
            </div>
          </div>
        )}
        <div ref={wrapRef} className="absolute inset-0" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "live") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600/20 text-red-400 text-[10px] font-semibold rounded-full">
        <Radio className="w-3 h-3" /> LIVE
      </span>
    );
  }
  if (status === "connecting") {
    return <span className="text-[10px] text-yellow-500 font-medium">Connecting...</span>;
  }
  if (status === "ended") {
    return <span className="text-[10px] text-neutral-500 font-medium">Ended</span>;
  }
  return null;
}

function useElapsed(startTs) {
  const [label, setLabel] = useState("—");
  useEffect(() => {
    if (!startTs) { setLabel("—"); return; }
    const tick = () => {
      const s = Math.floor((Date.now() - startTs) / 1000);
      const m = Math.floor(s / 60);
      setLabel(m > 0 ? `${m}m ${s % 60}s` : `${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTs]);
  return label;
}

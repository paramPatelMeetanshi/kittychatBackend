import { useEffect, useRef, useState } from 'react';

const WS_URL = 'ws://localhost:4000?role=dashboard';
const MAX_EVENTS = 30;

export default function LiveSessionViewer() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [pageUrl, setPageUrl] = useState('—');
  const [status, setStatus] = useState('waiting');
  const [scrollDepth, setScrollDepth] = useState(0);
  const [events, setEvents] = useState([]);
  const [clicks, setClicks] = useState([]);
  const wsRef = useRef(null);
  const iframeRef = useRef(null);
  const rrwebRef = useRef(null);

  // Connect to WebSocket server
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      let data;
      try { data = JSON.parse(e.data); } catch { return; }
      handleEvent(data);
    };

    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('error');

    return () => ws.close();
  }, []);

  function handleEvent(data) {
    // Filter to active session only (after one is selected)
    if (activeSession && data.sessionId && data.sessionId !== activeSession) return;

    switch (data.type) {
      case 'session_list':
        setSessions(data.sessions || []);
        break;

      case 'session_joined':
        setSessions((s) => [...new Set([...s, data.sessionId])]);
        break;

      case 'session_left':
        setSessions((s) => s.filter((id) => id !== data.sessionId));
        if (activeSession === data.sessionId) {
          setStatus('disconnected');
          setActiveSession(null);
        }
        break;

      case 'session_start':
      case 'url_change':
        setPageUrl(data.url);
        addEvent({ label: `📄 URL: ${data.url}`, ts: data.ts });
        break;

      case 'cursor':
        setCursor({ x: data.x, y: data.y, vw: data.vw, vh: data.vh });
        setStatus('active');
        break;

      case 'click':
        const label = `${data.tag}${data.id ? '#' + data.id : ''}${data.text ? ` "${data.text.slice(0, 30)}"` : ''}`;
        addEvent({ label: `🖱 Click: ${label}`, ts: data.ts });
        setClicks((prev) => [{ x: data.x, y: data.y, vw: data.vw || 1280, vh: data.vh || 720, id: data.ts }, ...prev].slice(0, 10));
        break;

      case 'scroll':
        setScrollDepth(data.depth);
        break;

      case 'status':
        setStatus(data.status);
        break;

      case 'rrweb':
        // Forward rrweb events to replayer if active
        if (rrwebRef.current) {
          rrwebRef.current.addEvent(data.event);
        }
        break;

      default:
        break;
    }
  }

  // Re-attach event handler when activeSession changes
  useEffect(() => {
    if (!wsRef.current) return;
    wsRef.current.onmessage = (e) => {
      let data;
      try { data = JSON.parse(e.data); } catch { return; }
      handleEvent(data);
    };
  }, [activeSession]);

  function addEvent(ev) {
    setEvents((prev) => [ev, ...prev].slice(0, MAX_EVENTS));
  }

  // Cursor dot position as % of preview area
  function cursorStyle(area) {
    if (!cursor) return { display: 'none' };
    const scaleX = area.width / (cursor.vw || 1280);
    const scaleY = area.height / (cursor.vh || 720);
    return {
      position: 'absolute',
      left: cursor.x * scaleX,
      top: cursor.y * scaleY,
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: '#f43f5e',
      boxShadow: '0 0 0 3px rgba(244,63,94,0.3)',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      transition: 'left 0.05s, top 0.05s',
      zIndex: 10,
    };
  }

  const PREVIEW_W = 800;
  const PREVIEW_H = 500;

  const statusColor = {
    active: '#22c55e',
    idle: '#f59e0b',
    disconnected: '#ef4444',
    waiting: '#94a3b8',
    error: '#ef4444',
  }[status] || '#94a3b8';

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>🐱 KittyChat</h2>
        <p style={styles.sideLabel}>Magic Browse</p>

        <div style={styles.section}>
          <p style={styles.label}>Live Sessions</p>
          {sessions.length === 0 && (
            <p style={styles.muted}>No visitors yet</p>
          )}
          {sessions.map((id) => (
            <button
              key={id}
              style={{ ...styles.sessionBtn, ...(activeSession === id ? styles.sessionBtnActive : {}) }}
              onClick={() => { setActiveSession(id); setStatus('active'); setEvents([]); }}
            >
              👤 {id}
            </button>
          ))}
        </div>

        <div style={styles.section}>
          <p style={styles.label}>Current Page</p>
          <p style={styles.url}>{pageUrl}</p>
        </div>

        <div style={styles.section}>
          <p style={styles.label}>Scroll Depth</p>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width: `${scrollDepth}%` }} />
          </div>
          <p style={styles.muted}>{scrollDepth}%</p>
        </div>

        <div style={styles.section}>
          <p style={styles.label}>Status</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ ...styles.dot, background: statusColor }} />
            <span style={{ color: statusColor, fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main style={styles.main}>
        <h3 style={styles.heading}>Live Cursor View</h3>

        {/* Preview canvas */}
        <div style={{ ...styles.preview, width: PREVIEW_W, height: PREVIEW_H }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Grid bg */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.07 }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Click ripples */}
            {clicks.map((c) => (
              <span
                key={c.id}
                style={{
                  position: 'absolute',
                  left: c.x * (PREVIEW_W / (c.vw || 1280)),
                  top: c.y * (PREVIEW_H / (c.vh || 720)),
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid #f43f5e',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.6,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Cursor dot */}
            <div style={cursorStyle({ width: PREVIEW_W, height: PREVIEW_H })} />

            {!activeSession && (
              <div style={styles.placeholder}>
                <p>Select a visitor session from the sidebar to start watching</p>
              </div>
            )}
          </div>
        </div>

        {/* Event log */}
        <div style={styles.log}>
          <h4 style={styles.logHeading}>Recent Activity</h4>
          {events.length === 0 && <p style={styles.muted}>No events yet</p>}
          {events.map((ev, i) => (
            <div key={i} style={styles.logItem}>
              <span style={styles.logTime}>{new Date(ev.ts).toLocaleTimeString()}</span>
              <span>{ev.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Inter', system-ui, sans-serif",
    background: '#0f172a',
    color: '#e2e8f0',
    overflow: 'hidden',
  },
  sidebar: {
    width: 260,
    background: '#1e293b',
    borderRight: '1px solid #334155',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    overflowY: 'auto',
  },
  logo: { margin: 0, fontSize: 20, fontWeight: 700 },
  sideLabel: { margin: '2px 0 20px', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  section: { marginBottom: 24 },
  label: { margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 },
  url: { margin: 0, fontSize: 12, color: '#7dd3fc', wordBreak: 'break-all' },
  muted: { margin: 0, fontSize: 12, color: '#475569' },
  progressTrack: { height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressBar: { height: '100%', background: '#6366f1', borderRadius: 3, transition: 'width 0.3s' },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  sessionBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 10px',
    marginBottom: 6,
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#cbd5e1',
    fontSize: 12,
    cursor: 'pointer',
  },
  sessionBtnActive: { background: '#312e81', borderColor: '#6366f1', color: '#a5b4fc' },
  main: { flex: 1, padding: 28, overflowY: 'auto' },
  heading: { margin: '0 0 16px', fontSize: 16, fontWeight: 600 },
  preview: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
  },
  placeholder: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#475569',
    fontSize: 14,
  },
  log: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '16px',
    maxHeight: 280,
    overflowY: 'auto',
  },
  logHeading: { margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#94a3b8' },
  logItem: {
    display: 'flex',
    gap: 10,
    padding: '5px 0',
    borderBottom: '1px solid #1e293b',
    fontSize: 13,
  },
  logTime: { color: '#475569', minWidth: 72, fontSize: 11, paddingTop: 1 },
};

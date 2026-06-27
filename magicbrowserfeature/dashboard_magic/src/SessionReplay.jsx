import { useEffect, useRef, useState, useCallback } from 'react';
import { Replayer } from '@rrweb/replay';
import '@rrweb/replay/dist/style.css';

const WS_URL = 'ws://localhost:4000?role=dashboard';

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseUA(ua = '') {
  const browser =
    /Edg/.test(ua)         ? 'Edge'    :
    /Chrome/.test(ua)      ? 'Chrome'  :
    /Firefox/.test(ua)     ? 'Firefox' :
    /Safari/.test(ua)      ? 'Safari'  : 'Unknown';
  const os =
    /Windows/.test(ua)     ? 'Windows' :
    /Mac/.test(ua)         ? 'macOS'   :
    /Linux/.test(ua)       ? 'Linux'   :
    /Android/.test(ua)     ? 'Android' :
    /iPhone|iPad/.test(ua) ? 'iOS'     : 'Unknown';
  return { browser, os };
}

function useElapsed(startTs) {
  const [label, setLabel] = useState('—');
  useEffect(() => {
    if (!startTs) { setLabel('—'); return; }
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function SessionReplay() {
  const [sessions,     setSessions]     = useState([]);
  const [activeId,     setActiveId]     = useState(null);
  const [activeMeta,   setActiveMeta]   = useState(null);
  const [mode,         setMode]         = useState('live');
  const [speed,        setSpeed]        = useState(1);
  const [ended,        setEnded]        = useState(false);
  const [evCount,      setEvCount]      = useState(0);
  const [playing,      setPlaying]      = useState(false);
  const [playerReady,  setPlayerReady]  = useState(false);

  // stable refs — avoid stale closures in ws callbacks
  const wsRef       = useRef(null);
  const replayer    = useRef(null);
  const wrapRef     = useRef(null);
  const eventsRef   = useRef([]);
  const activeIdRef = useRef(null);
  const modeRef     = useRef('live');
  const builtRef    = useRef(false);   // prevent double-build

  activeIdRef.current = activeId;
  modeRef.current     = mode;

  // ── WebSocket connection ───────────────────────────────────────────────────
  useEffect(() => {
    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen  = () => console.log('[ws] connected to server');
      ws.onerror = (e) => console.error('[ws] error', e);
      ws.onclose = () => {
        console.log('[ws] closed, reconnecting in 2s');
        setTimeout(connect, 2000);
      };
      ws.onmessage = (e) => {
        try { handleMsg(JSON.parse(e.data)); } catch {}
      };
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

  // ── Message handler (uses refs, no stale closure issue) ───────────────────
  function handleMsg(msg) {
    switch (msg.type) {

      case 'session_list':
        setSessions(msg.sessions || []);
        break;

      case 'session_started':
        setSessions(prev => prev.map(s =>
          s.sessionId === msg.sessionId ? { ...s, meta: msg.meta } : s
        ));
        if (msg.sessionId === activeIdRef.current) setActiveMeta(msg.meta);
        break;

      case 'session_ended':
        if (msg.sessionId === activeIdRef.current) setEnded(true);
        break;

      case 'url_change':
        if (msg.sessionId === activeIdRef.current)
          setActiveMeta(prev => prev ? { ...prev, url: msg.url } : prev);
        break;

      case 'watch_ack':
        if (msg.sessionId === activeIdRef.current) setActiveMeta(msg.meta || null);
        break;

      // Full stored history → build player immediately
      case 'replay_events': {
        if (msg.sessionId !== activeIdRef.current) return;
        const evs = msg.events || [];
        console.log(`[replay_events] ${evs.length} events for ${msg.sessionId}`);
        eventsRef.current = evs;
        setEvCount(evs.length);
        builtRef.current = false;
        schedBuild();
        break;
      }

      // Live stream → either feed into running replayer, or build one
      case 'rrweb_batch': {
        if (msg.sessionId !== activeIdRef.current) return;
        const incoming = msg.events || [];
        if (!incoming.length) return;

        eventsRef.current.push(...incoming);
        setEvCount(c => c + incoming.length);

        if (replayer.current && modeRef.current === 'live') {
          // Feed events into live replayer
          for (const ev of incoming) {
            try { replayer.current.addEvent(ev); } catch {}
          }
        } else if (!builtRef.current && modeRef.current === 'live') {
          // First batch arrived — now we can build
          schedBuild();
        }
        break;
      }
    }
  }

  // Build after a short tick to ensure React has painted the container
  function schedBuild() {
    setTimeout(() => {
      if (!builtRef.current) buildPlayer();
    }, 150);
  }

  // ── Build Replayer ─────────────────────────────────────────────────────────
  function buildPlayer() {
    destroyPlayer();

    const events = eventsRef.current;
    if (!events.length) {
      console.warn('[build] no events yet');
      return;
    }
    if (!wrapRef.current) {
      console.warn('[build] container not mounted');
      return;
    }

    console.log(`[build] ${events.length} events, mode=${modeRef.current}`);
    builtRef.current = true;

    try {
      const isLive = modeRef.current === 'live';
      const r = new Replayer(events, {
        root:     wrapRef.current,
        speed,
        liveMode: isLive,
        // Fit the replayer inside our container
        width:    wrapRef.current.clientWidth  || 900,
        height:   wrapRef.current.clientHeight || 540,
      });

      replayer.current = r;

      if (isLive) {
        r.startLive();
      } else {
        r.play();
      }

      setPlaying(true);
      setPlayerReady(true);
    } catch (err) {
      console.error('[build] Replayer threw:', err);
      builtRef.current = false;
    }
  }

  function destroyPlayer() {
    if (replayer.current) {
      try { replayer.current.pause(); } catch {}
      replayer.current = null;
    }
    if (wrapRef.current) wrapRef.current.innerHTML = '';
    setPlaying(false);
    setPlayerReady(false);
  }

  // ── Watch session ──────────────────────────────────────────────────────────
  function watchSession(sid, meta) {
    if (activeIdRef.current) {
      wsRef.current?.send(JSON.stringify({ type: 'unwatch', sessionId: activeIdRef.current }));
    }
    destroyPlayer();
    eventsRef.current = [];
    builtRef.current  = false;
    setEvCount(0);
    setActiveId(sid);
    setActiveMeta(meta || null);
    setEnded(false);
    setMode('live');
    modeRef.current     = 'live';
    activeIdRef.current = sid;

    wsRef.current?.send(JSON.stringify({ type: 'watch', sessionId: sid }));
  }

  // ── Mode switch ────────────────────────────────────────────────────────────
  function switchMode(m) {
    setMode(m);
    modeRef.current  = m;
    builtRef.current = false;
    schedBuild();
  }

  // ── Speed ──────────────────────────────────────────────────────────────────
  function handleSpeed(s) {
    setSpeed(s);
    replayer.current?.setConfig?.({ speed: s });
  }

  function togglePlay() {
    if (!replayer.current) return;
    if (playing) { replayer.current.pause(); setPlaying(false); }
    else         { replayer.current.play();  setPlaying(true);  }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const { browser, os } = parseUA(activeMeta?.userAgent);
  const timeActive = useElapsed(activeMeta?.startTs);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>

      {/* ── Sidebar ── */}
      <aside style={S.sidebar}>
        <div>
          <span style={S.logo}>🐱 KittyChat</span>
          <span style={S.logoSub}>Magic Browse</span>
        </div>

        <p style={S.sLabel}>Active Sessions</p>
        {sessions.length === 0 && <p style={S.muted}>Waiting for visitors…</p>}

        {sessions.map(({ sessionId, meta }) => {
          const { browser: b, os: o } = parseUA(meta?.userAgent);
          const isActive = sessionId === activeId;
          return (
            <button key={sessionId}
              style={isActive ? S.sBtnOn : S.sBtn}
              onClick={() => watchSession(sessionId, meta)}
            >
              <span style={{ fontSize: 18 }}>👤</span>
              <span style={S.sInfo}>
                <span style={S.sId}>{sessionId}</span>
                <span style={S.sMeta}>{b} · {o} · {isActive ? evCount : (meta?.eventCount ?? '?')} events</span>
              </span>
            </button>
          );
        })}

        {activeMeta && (
          <>
            <p style={{ ...S.sLabel, marginTop: 24 }}>Visitor Info</p>
            <div style={S.infoCard}>
              <InfoRow label="URL"         value={activeMeta.url || '—'} />
              <InfoRow label="Browser"     value={browser} />
              <InfoRow label="OS"          value={os} />
              <InfoRow label="Screen"      value={`${activeMeta.screenW}×${activeMeta.screenH}`} />
              <InfoRow label="Time active" value={timeActive} />
            </div>
          </>
        )}
      </aside>

      {/* ── Main ── */}
      <main style={S.main}>

        {/* toolbar */}
        <div style={S.toolbar}>
          <span style={S.tTitle}>
            {activeId ? `Session: ${activeId}` : 'Select a session'}
          </span>

          {activeId && (
            <div style={S.controls}>
              {mode === 'live' && !ended && <span style={S.liveBadge}>● LIVE</span>}
              {ended && <span style={S.endBadge}>ENDED</span>}

              <button style={mode === 'live'   ? S.mBtnOn : S.mBtn} onClick={() => switchMode('live')}>Live</button>
              <button style={mode === 'replay' ? S.mBtnOn : S.mBtn} onClick={() => switchMode('replay')}>Replay</button>

              {mode === 'replay' && playerReady && (
                <button style={S.mBtn} onClick={togglePlay}>
                  {playing ? '⏸ Pause' : '▶ Play'}
                </button>
              )}

              <select style={S.speedSel} value={speed} onChange={e => handleSpeed(Number(e.target.value))}>
                <option value={1}>1×</option>
                <option value={2}>2×</option>
                <option value={4}>4×</option>
              </select>

              <span style={S.evCount}>{evCount} events</span>
            </div>
          )}
        </div>

        {/* player */}
        <div style={S.playerOuter}>
          {!activeId
            ? <p style={S.hint}>👈 Select a visitor session from the sidebar</p>
            : <div ref={wrapRef} style={S.playerWrap} />
          }
        </div>

      </main>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
      <span style={{ color: '#64748b', fontSize: 11 }}>{label}</span>
      <span style={{ color: '#cbd5e1', fontSize: 11, maxWidth: 140, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  root:    { display: 'flex', height: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: "'Inter',system-ui,sans-serif", overflow: 'hidden' },
  sidebar: { width: 270, background: '#1e293b', borderRight: '1px solid #334155', padding: '20px 14px', overflowY: 'auto', flexShrink: 0 },
  logo:    { fontSize: 18, fontWeight: 700, display: 'block', marginBottom: 2 },
  logoSub: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  sLabel:  { fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, margin: '16px 0 8px' },
  muted:   { fontSize: 12, color: '#475569' },

  sBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '9px 10px', marginBottom: 6,
    background: '#0f172a', borderWidth: 1, borderStyle: 'solid', borderColor: '#334155',
    borderRadius: 8, color: '#cbd5e1', cursor: 'pointer', textAlign: 'left',
  },
  sBtnOn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '9px 10px', marginBottom: 6,
    background: '#1e1b4b', borderWidth: 1, borderStyle: 'solid', borderColor: '#6366f1',
    borderRadius: 8, color: '#cbd5e1', cursor: 'pointer', textAlign: 'left',
  },
  sInfo:   { display: 'flex', flexDirection: 'column', minWidth: 0 },
  sId:     { fontSize: 12, fontWeight: 600, color: '#a5b4fc' },
  sMeta:   { fontSize: 10, color: '#64748b', marginTop: 1 },
  infoCard: { background: '#0f172a', borderRadius: 8, padding: '8px 10px' },

  main:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#1e293b', borderBottom: '1px solid #334155', flexShrink: 0 },
  tTitle:  { fontSize: 14, fontWeight: 600, color: '#94a3b8' },
  controls: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },

  liveBadge: { background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 },
  endBadge:  { background: '#334155', color: '#94a3b8', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 },

  mBtn: {
    padding: '5px 12px', fontSize: 12, borderRadius: 6,
    background: '#0f172a', borderWidth: 1, borderStyle: 'solid', borderColor: '#334155',
    color: '#94a3b8', cursor: 'pointer',
  },
  mBtnOn: {
    padding: '5px 12px', fontSize: 12, borderRadius: 6,
    background: '#312e81', borderWidth: 1, borderStyle: 'solid', borderColor: '#6366f1',
    color: '#a5b4fc', cursor: 'pointer',
  },
  speedSel: { padding: '5px 8px', fontSize: 12, borderRadius: 6, background: '#0f172a', borderWidth: 1, borderStyle: 'solid', borderColor: '#334155', color: '#e2e8f0', cursor: 'pointer' },
  evCount:  { fontSize: 11, color: '#475569' },

  playerOuter: { flex: 1, overflow: 'hidden', position: 'relative', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  playerWrap:  { width: '100%', height: '100%', position: 'relative' },
  hint:        { fontSize: 15, color: '#475569' },
};

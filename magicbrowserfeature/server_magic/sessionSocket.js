const express = require('express');
const http    = require('http');
const { WebSocketServer } = require('ws');
const path    = require('path');

const PORT = 4000;

const app = express();
app.use((_, res, next) => { res.setHeader('Access-Control-Allow-Origin', '*'); next(); });
// Serve tracker and test page
app.use(express.static(path.join(__dirname, '..')));
// Serve rrweb UMD bundle locally so tracker never needs CDN
app.get('/rrweb.min.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules/rrweb/dist/rrweb.umd.min.cjs'));
});

const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

// ── In-memory session store ────────────────────────────────────────────────
// Map<sessionId, { meta, events: [], dashboards: Set<ws>, trackerWs }>
const sessions = new Map();

function getOrCreate(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { meta: {}, events: [], dashboards: new Set(), trackerWs: null });
  }
  return sessions.get(sessionId);
}

// All connected dashboard clients (for session-list broadcasts)
const allDashboards = new Set();

// ── Helpers ────────────────────────────────────────────────────────────────
function sendJSON(ws, obj) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}

function broadcastSessionList() {
  const list = [...sessions.entries()].map(([id, s]) => ({
    sessionId: id,
    meta:      s.meta,
    eventCount: s.events.length,
  }));
  for (const dash of allDashboards) {
    sendJSON(dash, { type: 'session_list', sessions: list });
  }
}

// ── Connection handler ─────────────────────────────────────────────────────
wss.on('connection', (ws, req) => {
  const url       = new URL(req.url, `http://localhost:${PORT}`);
  const role      = url.searchParams.get('role') || 'tracker';
  const sessionId = url.searchParams.get('sessionId');

  // ── TRACKER ───────────────────────────────────────────────────────────────
  if (role === 'tracker') {
    if (!sessionId) { ws.close(); return; }

    const session = getOrCreate(sessionId);
    session.trackerWs = ws;

    console.log(`[tracker] connected  session=${sessionId}`);

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      switch (msg.type) {
        case 'session_start':
          session.meta = msg.meta || {};
          session.meta.startTs = Date.now();
          broadcastSessionList();
          // Notify dashboards watching this session
          for (const dash of session.dashboards) {
            sendJSON(dash, { type: 'session_started', sessionId, meta: session.meta });
          }
          break;

        case 'rrweb_batch':
          if (!Array.isArray(msg.events)) return;
          // Store for replay
          for (const ev of msg.events) session.events.push(ev);
          // Forward live to watching dashboards
          for (const dash of session.dashboards) {
            sendJSON(dash, { type: 'rrweb_batch', sessionId, events: msg.events });
          }
          break;

        case 'url_change':
          if (session.meta) session.meta.url = msg.url;
          for (const dash of session.dashboards) {
            sendJSON(dash, { type: 'url_change', sessionId, url: msg.url });
          }
          broadcastSessionList();
          break;
      }
    });

    ws.on('close', () => {
      console.log(`[tracker] disconnected session=${sessionId}`);
      const s = sessions.get(sessionId);
      if (s) {
        s.trackerWs = null;
        for (const dash of s.dashboards) {
          sendJSON(dash, { type: 'session_ended', sessionId });
        }
      }
      broadcastSessionList();
    });

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  } else if (role === 'dashboard') {
    allDashboards.add(ws);
    console.log(`[dashboard] connected. total=${allDashboards.size}`);

    // Send current session list immediately
    const list = [...sessions.entries()].map(([id, s]) => ({
      sessionId: id, meta: s.meta, eventCount: s.events.length,
    }));
    sendJSON(ws, { type: 'session_list', sessions: list });

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      // Dashboard requests to watch a session
      if (msg.type === 'watch' && msg.sessionId) {
        const s = sessions.get(msg.sessionId);
        if (!s) { sendJSON(ws, { type: 'error', message: 'session not found' }); return; }

        // Subscribe
        s.dashboards.add(ws);

        // Replay all stored events first
        if (s.events.length) {
          sendJSON(ws, { type: 'replay_events', sessionId: msg.sessionId, events: s.events });
        }
        sendJSON(ws, { type: 'watch_ack', sessionId: msg.sessionId, meta: s.meta });
      }

      // Dashboard stops watching
      if (msg.type === 'unwatch' && msg.sessionId) {
        const s = sessions.get(msg.sessionId);
        if (s) s.dashboards.delete(ws);
      }
    });

    ws.on('close', () => {
      allDashboards.delete(ws);
      // Remove from all session subscriber lists
      for (const s of sessions.values()) s.dashboards.delete(ws);
      console.log(`[dashboard] disconnected. total=${allDashboards.size}`);
    });
  }
});

server.listen(PORT, () => {
  console.log(`\n🐱 KittyChat Magic Browse server → ws://localhost:${PORT}`);
  console.log(`   Test page → http://localhost:${PORT}/test.html\n`);
});

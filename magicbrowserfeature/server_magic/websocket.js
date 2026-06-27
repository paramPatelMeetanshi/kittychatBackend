const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const PORT = 4000;
const app = express();

// Serve tracker.js as a static file so the demo page can load it
app.use(express.static(path.join(__dirname, '..')));

// Simple CORS for dashboard dev server
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Track connected clients by role: 'tracker' | 'dashboard'
const trackers = new Map();  // sessionId -> ws
const dashboards = new Set();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const role = url.searchParams.get('role') || 'tracker';

  if (role === 'dashboard') {
    dashboards.add(ws);
    console.log(`[dashboard] connected. Total: ${dashboards.size}`);

    // Send current session list to newly connected dashboard
    const sessions = [...trackers.keys()];
    ws.send(JSON.stringify({ type: 'session_list', sessions }));

    ws.on('close', () => {
      dashboards.delete(ws);
      console.log(`[dashboard] disconnected`);
    });

  } else {
    // Tracker client
    let sessionId = null;

    ws.on('message', (raw) => {
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }

      // Register session on first message
      if (!sessionId && data.sessionId) {
        sessionId = data.sessionId;
        trackers.set(sessionId, ws);
        console.log(`[tracker] session started: ${sessionId}`);
        broadcastToDashboards({ type: 'session_joined', sessionId });
      }

      // Forward every event to all dashboards
      broadcastToDashboards(data);
    });

    ws.on('close', () => {
      if (sessionId) {
        trackers.delete(sessionId);
        console.log(`[tracker] session ended: ${sessionId}`);
        broadcastToDashboards({ type: 'session_left', sessionId });
      }
    });
  }
});

function broadcastToDashboards(data) {
  const msg = JSON.stringify(data);
  for (const dash of dashboards) {
    if (dash.readyState === 1 /* OPEN */) {
      dash.send(msg);
    }
  }
}

server.listen(PORT, () => {
  console.log(`Magic Browse WebSocket server running on ws://localhost:${PORT}`);
  console.log(`Serve your test page and embed tracker.js to start streaming.`);
});

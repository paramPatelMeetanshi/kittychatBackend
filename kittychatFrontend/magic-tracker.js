/**
 * KittyChat Magic Browser Tracker
 * Streams rrweb DOM recording events to the server for live session replay.
 * Uses the same sessionId as the chat widget for correlation.
 */
(function () {
  'use strict';

  var defaultHost = (window.KITTYCHAT_ENV && window.KITTYCHAT_ENV.SERVER_HOST) || location.hostname || '0.0.0.0';
  var wsPort = (window.KITTYCHAT_ENV && window.KITTYCHAT_ENV.WS_PORT) || '3001';
  var httpPort = (window.KITTYCHAT_ENV && window.KITTYCHAT_ENV.SERVER_PORT) || '3001';
  
  var wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  var httpProto = location.protocol === 'https:' ? 'https:' : 'http:';
  
  var WS_BASE = window.KITTYCHAT_WS_HOST || (wsProto + '//' + defaultHost + ':' + wsPort);
  var BATCH_MS = 200;
  var RRWEB_CDN = httpProto + '//' + defaultHost + ':' + httpPort + '/rrweb.min.js';

  // Reuse the chat widget's sessionId
  var sessionId = sessionStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('chat_session_id', sessionId);
  }

  var ws;
  var queue = [];
  var flushTimer;
  var stopRecord = null;

  function connect() {
    ws = new WebSocket(WS_BASE + '/magic?role=tracker&sessionId=' + sessionId);

    ws.onopen = function () {
      send({
        type: 'session_start',
        sessionId: sessionId,
        meta: {
          url: location.href,
          userAgent: navigator.userAgent,
          screenW: screen.width,
          screenH: screen.height,
          language: navigator.language,
          ts: Date.now(),
        },
      });
      startFlush();
    };

    ws.onmessage = function (event) {
      var data;
      try { data = JSON.parse(event.data); } catch { return; }

      // Server asks us to take a fresh full snapshot
      if (data.type === 'take_snapshot') {
        if (window.rrweb && window.rrweb.takeFullSnapshot) {
          window.rrweb.takeFullSnapshot();
        }
        // Also flush immediately so the snapshot reaches the server fast
        if (queue.length) {
          send({ type: 'rrweb_batch', sessionId: sessionId, events: queue.splice(0) });
        }
      }
    };

    ws.onclose = function () {
      clearInterval(flushTimer);
      setTimeout(connect, 4000);
    };

    ws.onerror = function () {
      ws.close();
    };
  }

  function send(obj) {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(obj));
    }
  }

  function startFlush() {
    flushTimer = setInterval(function () {
      if (!queue.length) return;
      send({ type: 'rrweb_batch', sessionId: sessionId, events: queue.splice(0) });
    }, BATCH_MS);
  }

  // Load rrweb and start recording
  var s = document.createElement('script');
  s.src = RRWEB_CDN;
  s.onload = function () {
    var rrwebLib = window.rrweb;
    if (!rrwebLib || !rrwebLib.record) {
      console.warn('[MagicBrowser] rrweb not loaded properly');
      return;
    }

    stopRecord = rrwebLib.record({
      emit: function (event) {
        queue.push(event);
      },
      maskAllInputs: true,
      blockSelector: 'input[type="password"], input[autocomplete*="cc"]',
      sampling: {
        mousemove: 50,
        mouseInteraction: true,
        scroll: 300,
        input: 'last',
      },
    });
  };
  s.onerror = function () {
    console.error('[MagicBrowser] Failed to load rrweb from', RRWEB_CDN);
  };
  document.head.appendChild(s);

  // SPA URL change detection
  var lastUrl = location.href;
  setInterval(function () {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      send({ type: 'url_change', sessionId: sessionId, url: location.href, ts: Date.now() });
    }
  }, 1000);

  connect();
})();

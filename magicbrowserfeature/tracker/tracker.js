(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  var WS_URL     = 'ws://localhost:4000';
  var BATCH_MS   = 50;           // flush interval
  var SESSION_ID = 'kc_' + Math.random().toString(36).slice(2, 11);
  var RRWEB_CDN  = 'http://localhost:4000/rrweb.min.js';

  // ── WebSocket ─────────────────────────────────────────────────────────────
  var ws;
  var queue = [];
  var flushTimer;

  function connect() {
    ws = new WebSocket(WS_URL + '?role=tracker&sessionId=' + SESSION_ID);

    ws.onopen = function () {
      send({
        type:      'session_start',
        sessionId: SESSION_ID,
        meta: {
          url:        location.href,
          userAgent:  navigator.userAgent,
          screenW:    screen.width,
          screenH:    screen.height,
          language:   navigator.language,
          ts:         Date.now(),
        },
      });
      startFlush();
    };

    ws.onclose = function () {
      clearInterval(flushTimer);
      setTimeout(connect, 3000);
    };

    ws.onerror = function () { ws.close(); };
  }

  function send(obj) {
    if (ws && ws.readyState === 1 /* OPEN */) {
      ws.send(JSON.stringify(obj));
    }
  }

  function startFlush() {
    flushTimer = setInterval(function () {
      if (!queue.length) return;
      send({ type: 'rrweb_batch', sessionId: SESSION_ID, events: queue.splice(0) });
    }, BATCH_MS);
  }

  // ── Load rrweb from CDN then start recording ──────────────────────────────
  var s = document.createElement('script');
  s.src = RRWEB_CDN;
  s.onload = function () {
    if (typeof rrweb === 'undefined') return;

    rrweb.record({
      // ── Privacy ────────────────────────────────────────────────────────
      maskAllInputs:   true,   // never capture keystrokes
      maskInputOptions: {
        password:      true,
        color:         false,
        date:          false,
        'datetime-local': false,
        email:         true,
        month:         false,
        number:        false,
        range:         false,
        search:        false,
        tel:           true,
        text:          true,
        time:          false,
        url:           false,
        week:          false,
        textarea:      true,
        select:        false,
      },
      // Mask elements with .sensitive or [data-private]
      maskTextSelector: '.sensitive, [data-private]',
      // Block credit-card / OTP / password input from DOM snapshot
      blockSelector: 'input[type="password"], input[autocomplete*="cc"], input[autocomplete*="otp"]',

      // ── Sampling ───────────────────────────────────────────────────────
      sampling: {
        mousemove:      true,
        mouseInteraction: true,
        scroll:         150,
        media:          800,
        input:          'last',
      },

      emit: function (event) {
        queue.push(event);
      },
    });
  };
  document.head.appendChild(s);

  // ── URL change detection (SPA) ────────────────────────────────────────────
  var lastUrl = location.href;
  setInterval(function () {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      send({ type: 'url_change', sessionId: SESSION_ID, url: location.href, ts: Date.now() });
    }
  }, 1000);

  connect();
})();

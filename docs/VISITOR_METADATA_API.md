# Visitor Metadata & Widget Integration API

## Overview

The LiveChat system collects and tracks detailed visitor information when they connect via the chat widget. This document covers:

1. How the widget identifies visitors (session-based)
2. What metadata is automatically captured
3. How to send additional metadata from your JS code
4. REST API for accessing visitor data
5. WebSocket events for real-time visitor info

---

## Session Identification

Each visitor is identified by a **session ID** — a unique string stored in the browser's `sessionStorage`.

```javascript
// Generate or retrieve session ID
let sessionId = sessionStorage.getItem('chat_session_id');
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem('chat_session_id', sessionId);
}
```

- Same tab reload → same session (sessionStorage persists)
- New tab → new session ID → new conversation
- Closing tab → session lost (unless you use localStorage for persistence)

---

## Automatically Captured Data

When a visitor connects via WebSocket, the server automatically captures:

| Field | Source | Example |
|-------|--------|---------|
| `ip` | Request socket/headers | `192.168.1.45` |
| `userAgent` | `User-Agent` header | `Mozilla/5.0 (Windows NT 10.0; ...)` |
| `browser` | Parsed from user-agent | `Chrome 120` |
| `os` | Parsed from user-agent | `Windows 10/11` |
| `device` | Parsed from user-agent | `Desktop`, `Mobile`, `Tablet` |
| `language` | `Accept-Language` header | `en-US` |
| `lastSeenAt` | Server timestamp | `2024-01-15T10:30:00Z` |
| `visitCount` | Incremented on each connect | `3` |

---

## Sending Metadata from JS (Widget → Server)

### `set_metadata` — Send visitor details

Send this immediately after WebSocket connects. The server stores it in the `visitors` collection.

```javascript
ws.send(JSON.stringify({
  type: "set_metadata",
  // All fields are optional — send what you have
  email: "user@example.com",
  phone: "+1-555-0123",
  city: "Mumbai",
  country: "India",
  timezone: "Asia/Kolkata",
  currentPage: "https://yoursite.com/pricing",
  referrer: "https://google.com",
  screenResolution: "1920x1080",
  customData: {
    plan: "pro",
    company: "Acme Inc",
    userId: "usr_12345"
  }
}));
```

**Allowed fields:**

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Visitor's email address |
| `phone` | string | Visitor's phone number |
| `city` | string | City name |
| `country` | string | Country name |
| `timezone` | string | IANA timezone (e.g., `Asia/Kolkata`) |
| `currentPage` | string | URL of the page visitor is on |
| `referrer` | string | Referring URL |
| `screenResolution` | string | Screen size (e.g., `1920x1080`) |
| `customData` | object | Any custom key-value pairs |

### `set_name` — Set visitor display name

```javascript
ws.send(JSON.stringify({
  type: "set_name",
  name: "John Doe"
}));
```

### `page_view` — Track page navigation

Send this when the visitor navigates to a new page (useful for SPAs):

```javascript
ws.send(JSON.stringify({
  type: "page_view",
  url: "https://yoursite.com/products/widget",
  title: "Widget Product Page"
}));
```

The server stores the last 20 page views per visitor.

---

## Complete Integration Example (Pure JavaScript)

```javascript
(function() {
  const SERVER = 'ws://YOUR_SERVER_IP:3001/widget';

  // Session management
  let sessionId = sessionStorage.getItem('livechat_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('livechat_session', sessionId);
  }

  let ws;

  function connect() {
    ws = new WebSocket(`${SERVER}?sessionId=${sessionId}`);

    ws.onopen = () => {
      console.log('[LiveChat] Connected');

      // 1. Set visitor name (if known)
      const userName = localStorage.getItem('user_name');
      if (userName) {
        ws.send(JSON.stringify({ type: 'set_name', name: userName }));
      }

      // 2. Send metadata
      ws.send(JSON.stringify({
        type: 'set_metadata',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        referrer: document.referrer || 'direct',
        currentPage: window.location.href,
        // Add any custom data you have about the user
        customData: {
          loggedIn: !!localStorage.getItem('auth_token'),
          plan: 'free',
          locale: navigator.language,
        }
      }));

      // 3. Send initial page view
      ws.send(JSON.stringify({
        type: 'page_view',
        url: window.location.href,
        title: document.title,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'history':
          // Render past messages
          data.messages.forEach(renderMessage);
          break;
        case 'message':
          renderMessage(data);
          break;
        case 'typing':
          showTyping(data.sender, data.isTyping);
          break;
      }
    };

    ws.onclose = () => {
      console.log('[LiveChat] Disconnected, reconnecting...');
      setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }

  // Track SPA navigation
  function trackPageView() {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'page_view',
        url: window.location.href,
        title: document.title,
      }));
      ws.send(JSON.stringify({
        type: 'set_metadata',
        currentPage: window.location.href,
      }));
    }
  }

  // Listen for URL changes (SPA support)
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    setTimeout(trackPageView, 100);
  };
  window.addEventListener('popstate', () => setTimeout(trackPageView, 100));

  // Send a message
  function sendMessage(content, visitorName) {
    if (!ws || ws.readyState !== 1) return false;
    ws.send(JSON.stringify({
      type: 'message',
      content: content,
      name: visitorName || undefined,
    }));
    return true;
  }

  // Send typing indicator
  let typingTimeout;
  function setTyping(isTyping) {
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: 'typing', isTyping }));
  }

  function handleInputChange() {
    setTyping(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => setTyping(false), 2000);
  }

  // Update visitor info at any time
  function updateVisitorInfo(data) {
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: 'set_metadata', ...data }));
  }

  // Expose public API
  window.LiveChat = {
    sendMessage,
    setTyping,
    handleInputChange,
    updateVisitorInfo,
    getSessionId: () => sessionId,
  };

  // Start
  connect();
})();
```

### Usage after integration:

```javascript
// Send a message programmatically
LiveChat.sendMessage("Hello, I need help with billing");

// Update visitor info after login
LiveChat.updateVisitorInfo({
  email: "john@example.com",
  phone: "+1-555-0123",
  customData: {
    userId: "usr_abc123",
    plan: "enterprise",
    company: "Acme Corp"
  }
});

// Get session ID for reference
console.log(LiveChat.getSessionId());
```

---

## REST API (Agent-side)

These endpoints require a JWT token from agent login.

### Get Visitor Details

```
GET /api/visitors/:sessionId
Authorization: Bearer <token>
```

Response:
```json
{
  "visitor": {
    "sessionId": "a1b2c3d4-...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "ip": "192.168.1.45",
    "browser": "Chrome 120",
    "os": "Windows 10/11",
    "device": "Desktop",
    "language": "en-US",
    "timezone": "America/New_York",
    "city": "New York",
    "country": "US",
    "screenResolution": "1920x1080",
    "referrer": "https://google.com",
    "currentPage": "https://yoursite.com/pricing",
    "visitCount": 3,
    "createdAt": "2024-01-10T08:00:00Z",
    "lastSeenAt": "2024-01-15T10:30:00Z",
    "pageViews": [
      { "url": "https://yoursite.com/", "title": "Home", "at": "2024-01-15T10:25:00Z" },
      { "url": "https://yoursite.com/pricing", "title": "Pricing", "at": "2024-01-15T10:28:00Z" }
    ],
    "customData": {
      "plan": "pro",
      "userId": "usr_12345"
    },
    "agentNotes": "Interested in enterprise plan. Follow up on Monday.",
    "notesUpdatedAt": "2024-01-15T10:35:00Z"
  },
  "conversation": {
    "sessionId": "a1b2c3d4-...",
    "visitorName": "John Doe",
    "lastMessage": "What are your enterprise pricing options?",
    "lastMessageAt": "2024-01-15T10:30:00Z",
    "status": "open",
    "createdAt": "2024-01-15T10:25:00Z"
  }
}
```

### Update Visitor Data (Agent)

```
PUT /api/visitors/:sessionId
Authorization: Bearer <token>
Content-Type: application/json

{
  "agentNotes": "VIP customer, expedite support",
  "customData": { "priority": "high" }
}
```

Response:
```json
{ "success": true }
```

---

## WebSocket Events (Agent Dashboard)

### `visitor_info` — Received when agent opens a conversation

```javascript
// Automatically sent when agent sends: { type: "open_conversation", sessionId: "..." }
// Also sent when visitor updates their metadata in real-time

{
  type: "visitor_info",
  visitor: {
    sessionId: "...",
    name: "John Doe",
    email: "john@example.com",
    ip: "192.168.1.45",
    browser: "Chrome 120",
    os: "Windows 10/11",
    device: "Desktop",
    timezone: "America/New_York",
    language: "en-US",
    visitCount: 3,
    pageViews: [...],
    customData: {...},
    agentNotes: "...",
    // ... all fields
  }
}
```

### `save_notes` — Agent saves private notes

```javascript
// Agent sends:
ws.send(JSON.stringify({
  type: "save_notes",
  sessionId: "visitor-session-id",
  notes: "Follow up with pricing quote on Monday"
}));

// Server responds:
{ type: "notes_saved", sessionId: "..." }
```

---

## Visitor Data Schema (MongoDB `visitors` collection)

```javascript
{
  sessionId: String,        // Unique visitor session ID
  name: String,             // Display name
  email: String,            // Email (optional, from set_metadata)
  phone: String,            // Phone (optional, from set_metadata)

  // Auto-captured on connect
  ip: String,               // Client IP address
  userAgent: String,        // Raw user-agent string
  browser: String,          // Parsed: "Chrome 120"
  os: String,               // Parsed: "Windows 10/11"
  device: String,           // "Desktop" | "Mobile" | "Tablet"
  language: String,         // From Accept-Language header

  // From set_metadata
  timezone: String,         // IANA timezone
  city: String,             // City name
  country: String,          // Country name/code
  screenResolution: String, // "1920x1080"
  referrer: String,         // Referring URL
  currentPage: String,      // Current page URL

  // Tracking
  visitCount: Number,       // Incremented each connect
  pageViews: [              // Last 20 pages (LIFO)
    { url: String, title: String, at: Date }
  ],
  customData: Object,       // Arbitrary key-value pairs

  // Agent-only
  agentNotes: String,       // Private notes by agent
  notesUpdatedAt: Date,     // When notes were last updated

  // Timestamps
  createdAt: Date,          // First time visitor connected
  lastSeenAt: Date,         // Last activity timestamp
  online: Boolean           // Currently connected
}
```

---

## Tips for JS Developers

1. **Call `set_metadata` right after connection opens** — don't wait for user interaction.

2. **Use `customData` for app-specific info** — logged in user IDs, plan types, cart value, etc.

3. **Track page views in SPAs** — listen for `pushState` and `popstate` to track navigation.

4. **Set email/name after login** — call `updateVisitorInfo({ email, ... })` when user authenticates on your site.

5. **The `sessionId` is the link** — keep it consistent within a session. If you want cross-tab persistence, use `localStorage` instead of `sessionStorage`.

6. **IP geolocation** — The server captures IP automatically. If you need city/country, either:
   - Use a client-side geo API and send via `set_metadata`
   - Add server-side IP geolocation (e.g., MaxMind GeoIP)

7. **Timezone detection** — `Intl.DateTimeFormat().resolvedOptions().timeZone` is the most reliable client-side method.

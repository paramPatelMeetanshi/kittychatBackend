# LiveChat WebSocket API Documentation

## Overview

The LiveChat server exposes two WebSocket endpoints:

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `ws://<host>:3001?token=<JWT>` | Dashboard agents | JWT token (from login) |
| `ws://<host>:3001/widget?sessionId=<ID>` | Visitor chat widget | Session ID (any unique string) |

---

## REST API (Authentication)

Base URL: `http://<host>:3001`

### Register

```
POST /api/register
Content-Type: application/json

{
  "email": "agent@example.com",
  "password": "mypassword",
  "name": "Agent Name"
}
```

Response (201):
```json
{
  "success": true,
  "user": { "id": "...", "email": "agent@example.com", "name": "Agent Name", "role": "agent" }
}
```

### Login

```
POST /api/login
Content-Type: application/json

{
  "email": "agent@example.com",
  "password": "mypassword"
}
```

Response (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "...", "name": "...", "role": "agent" }
}
```

Use the `token` value to connect to the dashboard WebSocket.

---

## Visitor Widget WebSocket

Connect to: `ws://<host>:3001/widget?sessionId=<UNIQUE_SESSION_ID>`

The `sessionId` should be a unique identifier per visitor session (e.g., UUID stored in sessionStorage).

### Connecting (Pure JavaScript)

```javascript
// Generate or retrieve session ID
let sessionId = sessionStorage.getItem('chat_session');
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem('chat_session', sessionId);
}

const ws = new WebSocket(`ws://YOUR_SERVER_IP:3001/widget?sessionId=${sessionId}`);

ws.onopen = () => {
  console.log('Connected to chat');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleMessage(data);
};

ws.onclose = () => {
  console.log('Disconnected, reconnecting...');
  setTimeout(() => connect(), 3000);
};

ws.onerror = (err) => {
  console.error('WebSocket error:', err);
  ws.close();
};
```

### Sending Messages (Visitor → Server)

#### Send a chat message
```javascript
ws.send(JSON.stringify({
  type: "message",
  content: "Hello, I need help!",
  name: "John"  // optional, sets visitor display name
}));
```

#### Set visitor name
```javascript
ws.send(JSON.stringify({
  type: "set_name",
  name: "John Doe"
}));
```

#### Send typing indicator
```javascript
// When user starts typing
ws.send(JSON.stringify({ type: "typing", isTyping: true }));

// When user stops typing (after 2s idle or on send)
ws.send(JSON.stringify({ type: "typing", isTyping: false }));
```

### Receiving Messages (Server → Visitor)

```javascript
function handleMessage(data) {
  switch (data.type) {
    case 'history':
      // Array of previous messages for this session
      // data.messages = [{ id, sender, content, timestamp, fromVisitor, fromAgent }, ...]
      renderMessages(data.messages);
      break;

    case 'message':
      // New message (either echo of own message or agent reply)
      // data = { id, sender, senderId, content, timestamp, fromVisitor?, fromAgent? }
      appendMessage(data);
      break;

    case 'typing':
      // Agent is typing
      // data = { sender: "Agent Name", isTyping: true/false }
      showTypingIndicator(data.sender, data.isTyping);
      break;

    case 'error':
      // data = { message: "error description" }
      console.error('Server error:', data.message);
      break;
  }
}
```

### Message Object Shape

```typescript
{
  id: string;          // MongoDB ObjectId as string
  sender: string;      // Display name of sender
  senderId: string;    // Session ID (visitor) or user ID (agent)
  content: string;     // Message text
  room: string;        // "visitor_<sessionId>"
  timestamp: number;   // Unix timestamp in ms
  fromVisitor?: boolean;  // true if sent by visitor
  fromAgent?: boolean;    // true if sent by agent
}
```

---

## Dashboard Agent WebSocket

Connect to: `ws://<host>:3001?token=<JWT_TOKEN>`

Get the token from the `/api/login` REST endpoint.

### Connecting

```javascript
const token = localStorage.getItem('chat_token'); // from login response
const ws = new WebSocket(`ws://YOUR_SERVER_IP:3001?token=${token}`);
```

### Sending Messages (Agent → Server)

#### Open a visitor conversation
```javascript
ws.send(JSON.stringify({
  type: "open_conversation",
  sessionId: "visitor-session-id-here"
}));
// Server responds with { type: "history", messages: [...] }
```

#### Reply to a visitor
```javascript
ws.send(JSON.stringify({
  type: "reply_visitor",
  sessionId: "visitor-session-id-here",
  content: "Hi! How can I help you?"
}));
```

#### Send message in a room (agent-to-agent)
```javascript
ws.send(JSON.stringify({
  type: "message",
  content: "Team update: new feature deployed"
}));
```

#### Switch room
```javascript
ws.send(JSON.stringify({
  type: "switch_room",
  room: "support"  // room name
}));
```

#### Typing indicator
```javascript
ws.send(JSON.stringify({ type: "typing", isTyping: true }));
```

#### Create a new room
```javascript
ws.send(JSON.stringify({
  type: "create_room",
  name: "New Room Name"
}));
```

#### Delete own message
```javascript
ws.send(JSON.stringify({
  type: "delete_message",
  messageId: "mongodb-object-id"
}));
```

#### Edit own message
```javascript
ws.send(JSON.stringify({
  type: "edit_message",
  messageId: "mongodb-object-id",
  content: "Updated message text"
}));
```

#### Mark message as read
```javascript
ws.send(JSON.stringify({
  type: "mark_read",
  messageId: "mongodb-object-id"
}));
```

### Receiving Messages (Server → Agent)

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'history':
      // data.messages = array of message objects
      break;

    case 'message':
      // New message in current room or conversation
      break;

    case 'system':
      // System notification (user joined/left)
      // data = { content: "User joined", timestamp }
      break;

    case 'stats':
      // Dashboard statistics
      // data = { online, visitors, totalMessages, inboxCount, rooms: [...] }
      break;

    case 'conversations':
      // Updated list of all visitor conversations
      // data.conversations = [{ sessionId, visitorName, lastMessage, lastMessageAt, status }]
      break;

    case 'typing':
      // Someone is typing
      // data = { sender, isTyping }
      break;

    case 'message_deleted':
      // data = { messageId }
      break;

    case 'message_edited':
      // data = { messageId, content, editedAt }
      break;

    case 'error':
      // data = { message }
      break;
  }
};
```

---

## Complete Visitor Widget Example (Pure HTML/JS)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Widget</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    #chat-widget {
      position: fixed; bottom: 20px; right: 20px;
      width: 380px; height: 500px;
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      display: flex; flex-direction: column;
      background: #fff;
    }
    #chat-header {
      background: #f97316; color: white; padding: 16px;
      font-weight: 600; font-size: 14px;
    }
    #chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      background: #fafafa;
    }
    .msg { margin-bottom: 12px; max-width: 75%; }
    .msg-visitor { margin-left: auto; text-align: right; }
    .msg-agent { margin-right: auto; }
    .msg-bubble {
      display: inline-block; padding: 8px 14px;
      border-radius: 16px; font-size: 14px; line-height: 1.4;
    }
    .msg-visitor .msg-bubble { background: #f97316; color: white; border-bottom-right-radius: 4px; }
    .msg-agent .msg-bubble { background: white; border: 1px solid #e5e5e5; border-bottom-left-radius: 4px; }
    .msg-meta { font-size: 10px; color: #999; margin-top: 2px; }
    #chat-input-area { padding: 12px; border-top: 1px solid #e5e5e5; display: flex; gap: 8px; }
    #chat-input {
      flex: 1; padding: 10px 14px; border: 1px solid #e5e5e5;
      border-radius: 20px; font-size: 14px; outline: none;
    }
    #chat-input:focus { border-color: #f97316; }
    #chat-send {
      width: 36px; height: 36px; border-radius: 50%;
      background: #f97316; border: none; color: white;
      cursor: pointer; font-size: 16px;
    }
    #chat-send:disabled { background: #ddd; cursor: default; }
    #typing-indicator { padding: 0 16px 8px; font-size: 12px; color: #999; min-height: 20px; }
  </style>
</head>
<body>

<div id="chat-widget">
  <div id="chat-header">💬 Live Support</div>
  <div id="chat-messages"></div>
  <div id="typing-indicator"></div>
  <div id="chat-input-area">
    <input id="chat-input" placeholder="Type a message..." />
    <button id="chat-send" disabled>▶</button>
  </div>
</div>

<script>
(function() {
  // --- Configuration ---
  const SERVER = 'ws://YOUR_SERVER_IP:3001/widget';
  const VISITOR_NAME = 'Website Visitor';

  // --- Session ID (persists per tab) ---
  let sessionId = sessionStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('chat_session_id', sessionId);
  }

  // --- DOM refs ---
  const messagesEl = document.getElementById('chat-messages');
  const inputEl = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const typingEl = document.getElementById('typing-indicator');

  // --- WebSocket ---
  let ws;
  let typingTimeout;

  function connect() {
    ws = new WebSocket(`${SERVER}?sessionId=${sessionId}`);

    ws.onopen = () => {
      sendBtn.disabled = false;
      // Set visitor name
      ws.send(JSON.stringify({ type: 'set_name', name: VISITOR_NAME }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'history':
          messagesEl.innerHTML = '';
          data.messages.forEach(renderMessage);
          scrollToBottom();
          break;

        case 'message':
          renderMessage(data);
          scrollToBottom();
          break;

        case 'typing':
          if (data.isTyping) {
            typingEl.textContent = `${data.sender} is typing...`;
          } else {
            typingEl.textContent = '';
          }
          break;
      }
    };

    ws.onclose = () => {
      sendBtn.disabled = true;
      setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }

  function renderMessage(msg) {
    const isOwn = msg.senderId === sessionId;
    const div = document.createElement('div');
    div.className = `msg ${isOwn ? 'msg-visitor' : 'msg-agent'}`;

    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
      <div class="msg-bubble">${escapeHtml(msg.content)}</div>
      <div class="msg-meta">${time}</div>
    `;
    messagesEl.appendChild(div);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function sendMessage() {
    const content = inputEl.value.trim();
    if (!content || !ws || ws.readyState !== 1) return;

    ws.send(JSON.stringify({
      type: 'message',
      content: content,
      name: VISITOR_NAME
    }));

    inputEl.value = '';
    ws.send(JSON.stringify({ type: 'typing', isTyping: false }));
  }

  // --- Event listeners ---
  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  inputEl.addEventListener('input', () => {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'typing', isTyping: true }));
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        ws.send(JSON.stringify({ type: 'typing', isTyping: false }));
      }, 2000);
    }
  });

  // --- Start ---
  connect();
})();
</script>

</body>
</html>
```

---

## Key Concepts

1. **Session ID** — Each visitor widget instance uses a unique `sessionId` (stored in `sessionStorage`). This ID links all messages to a single conversation. Different tabs = different sessions.

2. **Rooms** — Agent-to-agent messaging uses named rooms (`general`, `support`, `sales`). Visitor conversations use auto-generated rooms named `visitor_<sessionId>`.

3. **Conversations** — Each visitor session creates a "conversation" record in MongoDB. Agents see these in their Inbox and can reply.

4. **Authentication** — Agents authenticate via REST login → JWT → passed as query param on WebSocket connect. Visitors don't need auth, just a session ID.

5. **Reconnection** — Both widget and dashboard should auto-reconnect on disconnect (3-second delay recommended).

---

## Error Handling

The server sends `{ type: "error", message: "..." }` for:
- `"Unauthorized"` — invalid or expired JWT token
- `"sessionId required"` — widget connected without sessionId
- `"Failed to process message"` — server-side processing error

On receiving `"Unauthorized"`, clear stored token and prompt re-login.

---

## Related Documentation

- **[Visitor Metadata API](./VISITOR_METADATA_API.md)** — Full guide on collecting visitor details (browser, device, location, custom data, page tracking) and the `set_metadata` / `page_view` WebSocket events.

# LiveChat Widget API — Integration Documentation

This document is for the JS developer who will build the chat widget UI. It covers everything needed to connect to the WebSocket server, send visitor data, and handle real-time messaging.

---

## Connection

**WebSocket URL:**
```
ws://<SERVER_IP>:3001/widget?sessionId=<UNIQUE_SESSION_ID>
```

- `SERVER_IP` — The server IP (e.g., `192.168.0.166`)
- `sessionId` — A unique UUID per visitor session. Store in `sessionStorage` (per-tab) or `localStorage` (cross-tab).

No authentication required. The `sessionId` is the visitor identity.

---

## Flow (What to send after connecting)

Once WebSocket opens, send these in order:

### 1. Set visitor name

```json
{ "type": "set_name", "name": "Roshan Kaushish" }
```

### 2. Send visitor metadata

```json
{
  "type": "set_metadata",
  "email": "roshan@gmail.com",
  "phone": "+91 98765 43210",
  "city": "Chandigarh",
  "country": "India",
  "timezone": "Asia/Kolkata",
  "screenResolution": "1920x1080",
  "referrer": "https://google.com",
  "currentPage": "https://yoursite.com/pricing",
  "customData": {
    "userId": "usr_123",
    "plan": "enterprise",
    "company": "Meetanshi Technologies"
  }
}
```

All fields optional. Send whatever you have. Can be called again later to update.

**Accepted fields:**

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Visitor email |
| `phone` | string | Phone number |
| `city` | string | City name |
| `country` | string | Country name |
| `timezone` | string | IANA timezone (e.g. `Asia/Kolkata`) |
| `screenResolution` | string | `widthxheight` |
| `referrer` | string | Where they came from |
| `currentPage` | string | Current page URL |
| `customData` | object | Any key-value pairs |

### 3. Send initial page view

```json
{
  "type": "page_view",
  "url": "https://yoursite.com/pricing",
  "title": "Pricing Page"
}
```

Send again on each page navigation (especially SPAs).

---

## Receiving from Server

After connecting, server sends chat history immediately:

```json
{
  "type": "history",
  "messages": [
    {
      "id": "6789abc...",
      "sender": "Roshan",
      "senderId": "a1b2c3d4-...",
      "content": "Hi, I need help",
      "timestamp": 1718000000000,
      "fromVisitor": true
    },
    {
      "id": "6789abd...",
      "sender": "Agent Param",
      "senderId": "user_xyz",
      "content": "Hello! How can I help?",
      "timestamp": 1718000060000,
      "fromAgent": true
    }
  ]
}
```

Real-time events after that:

| type | Shape | When |
|------|-------|------|
| `message` | `{ id, sender, senderId, content, timestamp, fromAgent?, fromVisitor? }` | New message (echo of yours OR agent reply) |
| `typing` | `{ sender, isTyping }` | Agent typing |
| `error` | `{ message }` | Server error |

---

## Sending Messages

### Chat message

```json
{
  "type": "message",
  "content": "Hello, I need help with billing",
  "name": "Roshan"
}
```

- `content` (required) — message text
- `name` (optional) — updates stored name

Server echoes it back as a `message` event with assigned `id` and `timestamp`.

### Typing indicator

```json
{ "type": "typing", "isTyping": true }
```

Send `true` on keystroke, `false` after 2s idle or on send.

### Update name anytime

```json
{ "type": "set_name", "name": "New Name" }
```

### Update metadata anytime

```json
{ "type": "set_metadata", "email": "new@email.com", "customData": { "cartValue": 299 } }
```

Partial updates — only included fields are changed.

### Track page navigation

```json
{ "type": "page_view", "url": "https://yoursite.com/checkout", "title": "Checkout" }
```

---

## Message Object Shape

```
{
  id: string           — Unique message ID
  sender: string       — Display name
  senderId: string     — sessionId (visitor) or userId (agent)
  content: string      — Message text
  timestamp: number    — Unix ms timestamp
  fromVisitor: boolean — true if from visitor
  fromAgent: boolean   — true if from agent
}
```

To check if message is your own: `msg.senderId === yourSessionId`

---

## Auto-Detected (No need to send)

Server captures automatically from HTTP headers:

| Data | Source |
|------|--------|
| IP address | Socket / X-Forwarded-For |
| Browser + version | User-Agent (parsed) |
| OS | User-Agent (parsed) |
| Device type | User-Agent (parsed) |
| Language | Accept-Language header |

---

## What Agent Sees in Dashboard

Right panel shows:

- Name, email, location
- Local time + timezone
- Browser, OS, device, IP
- Screen resolution
- Current page + referrer
- Visit count (auto-incremented)
- Page view history (last 20)
- All custom data key-values
- Private agent notes

---

## Reconnection

On disconnect, wait 3 seconds and reconnect with same `sessionId`. Server will resend history.

---

## Events Reference

### You SEND:

| type | Required | Optional | Purpose |
|------|----------|----------|---------|
| `set_name` | `name` | — | Set visitor name |
| `set_metadata` | any field | all | Send visitor details |
| `page_view` | `url` | `title` | Track navigation |
| `message` | `content` | `name` | Send chat message |
| `typing` | `isTyping` | — | Typing indicator |

### You RECEIVE:

| type | Fields | Purpose |
|------|--------|---------|
| `history` | `messages[]` | Chat history on connect |
| `message` | `id, sender, senderId, content, timestamp, fromAgent?, fromVisitor?` | New message |
| `typing` | `sender, isTyping` | Agent typing |
| `error` | `message` | Error |

---

## Connection Lifecycle

```
1. Generate sessionId (UUID, store in sessionStorage)
2. Connect: ws://192.168.0.166:3001/widget?sessionId=<id>
3. onopen → send set_name, set_metadata, page_view
4. Receive "history" → render past messages
5. User types → send typing:true, after 2s → typing:false
6. User sends → send "message"
7. Receive "message" echo → render with server id/timestamp
8. Receive "message" from agent → render agent reply
9. Receive "typing" → show typing indicator
10. Page change → send "page_view"
11. onclose → wait 3s → reconnect same sessionId
```

---

## Errors

| Error | Cause |
|-------|-------|
| `"sessionId required"` | No `?sessionId=` in URL |
| Connection closed | Network/server issue — reconnect |


---

## File Upload

Files are uploaded via a REST endpoint, then the file URL is attached to a WebSocket message.

### Step 1: Upload file

```
POST http://<SERVER_IP>:3001/api/upload
Content-Type: multipart/form-data

Body: form field "file" = <file>
```

No authentication required for upload.

**Response:**
```json
{
  "success": true,
  "file": {
    "url": "http://192.168.0.166:3001/uploads/a1b2c3d4.png",
    "name": "screenshot.png",
    "size": 245000,
    "type": "image/png",
    "filename": "a1b2c3d4.png"
  }
}
```

### Step 2: Send message with file

```json
{
  "type": "message",
  "content": "Here is the screenshot",
  "file": {
    "url": "http://192.168.0.166:3001/uploads/a1b2c3d4.png",
    "name": "screenshot.png",
    "size": 245000,
    "type": "image/png"
  }
}
```

- `content` can be empty if only sending a file
- `file.url` (required) — the URL from upload response
- `file.name` — original filename
- `file.size` — size in bytes
- `file.type` — MIME type

### Allowed file types

Images: jpeg, png, gif, webp, svg
Documents: pdf, doc, docx, xls, xlsx, txt, csv
Archives: zip, rar
Video: mp4, webm
Audio: mp3, wav, ogg

Max size: 10 MB

### Accessing uploaded files

Files are served at: `http://<SERVER_IP>:3001/uploads/<filename>`

---

## Guest Visitor Names

If no name is provided via `set_name`, the server automatically assigns a unique friendly name like:

- "Happy Panda #1"
- "Brave Fox #2"
- "Quick Eagle #3"

This makes it easy to identify anonymous visitors in the dashboard. The name persists across reconnections for the same `sessionId`.


---

## Collecting Visitor Contact Info (set_contact)

Use this when you show a modal after 1-2 messages asking the visitor for their email/phone. Send whatever the visitor provides.

### Send

```json
{
  "type": "set_contact",
  "name": "Roshan Kaushish",
  "email": "roshan@gmail.com",
  "phone": "+91 98765 43210"
}
```

All fields are optional — send only what the visitor fills in:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Updates visitor display name |
| `email` | string | No | Visitor email |
| `phone` | string | No | Visitor phone |

### Response (from server)

```json
{
  "type": "contact_saved",
  "name": "Roshan Kaushish",
  "email": "roshan@gmail.com",
  "phone": "+91 98765 43210"
}
```

Use this confirmation to close the modal and show a success state.

### Example flow

```
1. Visitor connects → chats 1-2 messages
2. Your JS shows a modal: "Leave your email so we can follow up"
3. Visitor fills email (and optionally name/phone)
4. You send: { type: "set_contact", email: "...", phone: "..." }
5. Server responds: { type: "contact_saved", ... }
6. You close the modal
7. Agent sees updated email/phone in the visitor panel instantly
```

### Notes

- You can call `set_contact` multiple times — each call updates the stored values
- If no `name` is provided but `email` is, the server auto-derives a name from the email (e.g. `roshan.kaushish@gmail.com` → `"Roshan Kaushish"`)
- The dashboard agent panel updates in real-time when contact info is saved
- This is separate from `set_metadata` — use `set_contact` specifically for the modal flow, and `set_metadata` for auto-detected stuff (timezone, page, etc.)

### Name derivation from email

When visitor provides only email (no explicit name):

| Email | Derived Name |
|-------|-------------|
| `roshan.kaushish@gmail.com` | Roshan Kaushish |
| `john_doe@company.com` | John Doe |
| `support-team@corp.io` | Support Team |
| `hello123@mail.com` | Hello |

The part before `@` is split on `.`, `_`, `-`, digits removed, and each word capitalized.

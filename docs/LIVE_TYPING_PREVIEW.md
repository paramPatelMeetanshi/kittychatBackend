# Live Typing Preview — Frontend Implementation Plan

## Overview

The server now supports a **live typing preview** feature. When a visitor types in the chat widget, the dashboard agents viewing that conversation will receive the actual text content in real-time (debounced at 300ms server-side).

---

## Backend Changes (Already Implemented)

### New WebSocket Event: `typing_content` (Visitor → Server)

Sent by the visitor widget alongside the existing `typing` events.

```javascript
ws.send(JSON.stringify({
  type: "typing_content",
  content: "Hey, I was wondering if you cou..."  // current input value
}));
```

### New WebSocket Event: `typing_preview` (Server → Dashboard Agent)

Received by dashboard agents viewing the visitor's conversation.

```json
{
  "type": "typing_preview",
  "sessionId": "visitor-session-id",
  "content": "Hey, I was wondering if you cou...",
  "sender": "Visitor #A3F2C"
}
```

When `content` is `""` (empty string), it means the visitor cleared their input or stopped typing — hide the preview.

### Server-Side Debounce

- The server debounces `typing_content` events at **300ms** per visitor session
- Only the last content received within the 300ms window is forwarded to agents
- On `typing: false` or visitor disconnect, the server auto-clears the preview (sends empty content)

---

## Frontend Implementation (Widget Side — `kittychatFrontend`)

### What to add in `socket.js` / `ui.js`:

On every `input` event in the chat text field, send the current value:

```javascript
// In the input event handler (alongside the existing typing indicator)
inputEl.addEventListener('input', () => {
  const content = inputEl.value;

  // Existing typing indicator logic stays as-is
  ws.send(JSON.stringify({ type: 'typing', isTyping: true }));
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    ws.send(JSON.stringify({ type: 'typing', isTyping: false }));
  }, 2000);

  // NEW: Send live content for preview
  ws.send(JSON.stringify({ type: 'typing_content', content }));
});
```

On message send, also clear the preview:

```javascript
function sendMessage() {
  // ... existing send logic ...

  // Clear preview after sending
  ws.send(JSON.stringify({ type: 'typing_content', content: '' }));
}
```

**Note:** No client-side debounce is needed on the widget — the server handles debounce (300ms). Sending on every `input` event is fine.

---

## Frontend Implementation (Dashboard Side — `dashboard/`)

### What to add in `App.jsx` (WebSocket message handler):

Handle the new `typing_preview` event type:

```javascript
case 'typing_preview':
  // data = { sessionId, content, sender }
  setTypingPreviews(prev => ({
    ...prev,
    [data.sessionId]: data.content || ''
  }));
  break;
```

State to add:
```javascript
const [typingPreviews, setTypingPreviews] = useState({});
```

Pass to `ChatPanel`:
```jsx
<ChatPanel
  // ... existing props
  typingPreview={typingPreviews[activeConversation?.sessionId] || ''}
/>
```

### What to add in `ChatPanel.jsx`:

Accept new prop and render it in the typing indicator area:

```jsx
// Replace or augment the existing typing indicator
{typingPreview && (
  <div className="flex items-end gap-2 justify-start">
    <img src={getAvatarByRole("visitor")} alt="typing" className="w-7 h-7 rounded-full object-cover shrink-0" />
    <div className="bg-white border border-neutral-200 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
      <span className="text-xs text-neutral-400 italic">
        {typingPreview}
      </span>
    </div>
  </div>
)}
```

### Clearing the preview

The preview auto-clears when:
1. Visitor sends the message (server receives it, stops forwarding preview)
2. Visitor stops typing (server sends `typing_preview` with `content: ""`)
3. Visitor disconnects (server cleans up)

On the dashboard side, also clear when you receive a new message from that visitor:

```javascript
case 'message':
  if (data.fromVisitor) {
    setTypingPreviews(prev => ({ ...prev, [data.senderId]: '' }));
  }
  // ... existing message handling
  break;
```

---

## Event Flow Diagram

```
Visitor types "Hello"
  → Widget sends: { type: "typing_content", content: "Hello" }
  → Server debounces (300ms)
  → Server sends to agents viewing conversation:
      { type: "typing_preview", sessionId: "xxx", content: "Hello", sender: "Visitor #A3F2C" }
  → Dashboard renders live preview bubble

Visitor sends message
  → Widget sends: { type: "message", content: "Hello" }
  → Widget sends: { type: "typing_content", content: "" }
  → Server delivers message normally + clears preview
```

---

## ConversationList Enhancement (Optional)

You can also show a preview snippet in the conversation list by passing `typingPreviews` to `ConversationList` and rendering it as the "last message" when active:

```jsx
{typingPreviews[conv.sessionId] ? (
  <span className="text-orange-500 italic text-xs">
    {typingPreviews[conv.sessionId].slice(0, 40)}...
  </span>
) : (
  <span>{conv.lastMessage}</span>
)}
```

---

## Summary

| Piece | Status |
|-------|--------|
| Server: `typing_content` handler with debounce | ✅ Done |
| Server: `typing_preview` broadcast to agents | ✅ Done |
| Server: cleanup on disconnect / stop typing | ✅ Done |
| Widget: send `typing_content` on input | 🔲 Frontend TODO |
| Dashboard: handle `typing_preview` event | 🔲 Frontend TODO |
| Dashboard: render live preview in ChatPanel | 🔲 Frontend TODO |

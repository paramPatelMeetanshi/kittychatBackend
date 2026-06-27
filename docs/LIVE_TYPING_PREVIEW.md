# Live Typing Preview — Frontend Implementation Plan

## What This Does

Dashboard agents see the **actual text** a visitor is typing in real-time — not just "is typing...". The preview stays visible as long as there's content in the visitor's input field. It only disappears when the input is empty (cleared or message sent).

---

## Backend (Already Implemented)

### New event: `typing_content` (Visitor → Server)

```json
{ "type": "typing_content", "content": "Hey I need help with my ord" }
```

### New event: `typing_preview` (Server → Dashboard)

```json
{
  "type": "typing_preview",
  "sessionId": "visitor-uuid",
  "content": "Hey I need help with my ord",
  "sender": "Visitor #A3F2C"
}
```

### Behavior

- Server debounces at **300ms** — only the latest content within that window is forwarded
- Empty content (`""`) is sent **immediately** (no debounce) so the preview clears instantly
- On visitor disconnect, the server clears any pending debounce and agents stop seeing the preview
- The preview **persists** until content becomes empty — there is no timeout that hides it

---

## Widget Frontend Implementation (`kittychatFrontend`)

### On input change — send live content

```javascript
inputEl.addEventListener('input', () => {
  const content = inputEl.value;

  // Send live content (server debounces it)
  ws.send(JSON.stringify({ type: 'typing_content', content }));

  // Keep existing typing indicator logic if you want, or remove it
  // since typing_preview replaces "is typing..." on the dashboard
});
```

### On message send — clear the preview

```javascript
function sendMessage() {
  const content = inputEl.value.trim();
  if (!content) return;

  ws.send(JSON.stringify({ type: 'message', content, name: visitorName }));
  inputEl.value = '';

  // Clear the live preview
  ws.send(JSON.stringify({ type: 'typing_content', content: '' }));
}
```

### Key rule

Always send `{ type: "typing_content", content: "" }` when the input is emptied — whether by sending a message, pressing backspace to clear, or programmatically clearing. This is what hides the preview on the dashboard.

---

## Dashboard Frontend Implementation (`dashboard/`)

### 1. Add state in `App.jsx`

```javascript
const [typingPreviews, setTypingPreviews] = useState({});
```

### 2. Handle the event in the WebSocket message handler

```javascript
case 'typing_preview':
  // data = { sessionId, content, sender }
  if (data.content) {
    setTypingPreviews(prev => ({ ...prev, [data.sessionId]: { content: data.content, sender: data.sender } }));
  } else {
    // Empty content = clear preview
    setTypingPreviews(prev => {
      const next = { ...prev };
      delete next[data.sessionId];
      return next;
    });
  }
  break;
```

Also clear when a message arrives from that visitor:

```javascript
case 'message':
  if (data.fromVisitor && data.senderId) {
    setTypingPreviews(prev => {
      const next = { ...prev };
      delete next[data.senderId];
      return next;
    });
  }
  // ... existing message handling
  break;
```

### 3. Pass to ChatPanel

```jsx
<ChatPanel
  // ... existing props
  typingPreview={typingPreviews[activeConversation?.sessionId] || null}
/>
```

### 4. Render in `ChatPanel.jsx`

Replace the existing typing indicator block with this:

```jsx
{/* Live typing preview — shows actual text instead of "is typing..." */}
{typingPreview && (
  <div className="flex items-end gap-2 justify-start">
    <img src={getAvatarByRole("visitor")} alt="typing" className="w-7 h-7 rounded-full object-cover shrink-0" />
    <div className="bg-white border border-dashed border-orange-300 px-4 py-2.5 rounded-2xl rounded-bl-md">
      <p className="text-sm text-neutral-500 italic leading-relaxed">{typingPreview.content}</p>
      <p className="text-[10px] text-orange-400 mt-0.5">{typingPreview.sender} is typing</p>
    </div>
  </div>
)}
```

This shows the visitor's actual text in a dashed-border bubble (visually distinct from sent messages) that persists as long as they have text in the input.

---

## Event Flow

```
Visitor types "H"
  → Widget sends: { type: "typing_content", content: "H" }
  → Server waits 300ms...

Visitor types "He" (within 300ms)
  → Server cancels previous, restarts 300ms timer

Visitor types "Hel" (within 300ms)  
  → Server cancels previous, restarts 300ms timer

300ms passes with no new input
  → Server sends to agents: { type: "typing_preview", sessionId: "x", content: "Hel", sender: "..." }
  → Dashboard shows "Hel" in preview bubble

Visitor hits send
  → Widget sends: { type: "message", content: "Hello" }
  → Widget sends: { type: "typing_content", content: "" }
  → Server immediately sends: { type: "typing_preview", content: "" }
  → Dashboard hides preview, shows actual message

Visitor deletes all text (backspace)
  → Widget sends: { type: "typing_content", content: "" }
  → Server immediately clears preview
  → Dashboard hides preview bubble
```

---

## Summary

| Piece | Status |
|-------|--------|
| Server: `typing_content` handler with 300ms debounce | ✅ Done |
| Server: immediate clear on empty content | ✅ Done |
| Server: cleanup on disconnect | ✅ Done |
| Widget: send `typing_content` on every input event | ✅ Done |
| Widget: send empty `typing_content` on send/clear | ✅ Done |
| Dashboard: handle `typing_preview` in WS handler | ✅ Done |
| Dashboard: render live text in ChatPanel | ✅ Done |

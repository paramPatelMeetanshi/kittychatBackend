# Distinguishing AI vs Human Messages — Frontend Guide

## Overview

When AI mode is enabled, the server can reply automatically using Gemini. Every message received by the widget includes a flag indicating whether it came from AI or a human agent. Use this to style messages differently in your chat UI.

---

## Message Fields

Every message you receive has these relevant fields:

```json
{
  "type": "message",
  "id": "abc123",
  "sender": "AI Assistant",
  "senderId": "ai_agent",
  "content": "Hi! How can I help you today?",
  "timestamp": 1718000000000,
  "fromAgent": true,
  "fromAI": true
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `fromVisitor` | boolean | Message sent by the visitor (your user) |
| `fromAgent` | boolean | Message sent by agent side (human OR AI) |
| `fromAI` | boolean | `true` = AI generated reply, absent/`false` = human agent |

---

## How to Identify Message Source

```javascript
function getMessageSource(msg) {
  if (msg.fromVisitor) {
    return "visitor"; // The user's own message
  }
  if (msg.fromAI) {
    return "ai";      // AI auto-reply
  }
  if (msg.fromAgent) {
    return "human";   // Human agent reply
  }
  return "unknown";
}
```

---

## Rendering Logic

```javascript
function renderMessage(msg) {
  const source = getMessageSource(msg);

  switch (source) {
    case "visitor":
      // Right-aligned, user's own message
      // Style: orange/colored bubble
      break;

    case "ai":
      // Left-aligned, with AI indicator
      // Style: light purple/gray bubble + "AI" badge or bot icon
      // msg.sender will be "AI Assistant"
      break;

    case "human":
      // Left-aligned, human agent reply
      // Style: white/gray bubble + agent name
      // msg.sender will be the agent's name (e.g., "Param")
      break;
  }
}
```

---

## Example HTML Rendering

```javascript
function renderMessage(msg) {
  const isOwn = msg.fromVisitor || msg.senderId === sessionId;
  const isAI = msg.fromAI === true;

  const wrapper = document.createElement('div');
  wrapper.className = `msg ${isOwn ? 'msg-own' : 'msg-reply'}`;

  // Sender label with badge
  if (!isOwn) {
    const label = document.createElement('div');
    label.className = 'msg-label';
    label.innerHTML = `
      <span class="sender-name">${escapeHtml(msg.sender)}</span>
      ${isAI ? '<span class="badge badge-ai">AI</span>' : '<span class="badge badge-human">Human</span>'}
    `;
    wrapper.appendChild(label);
  }

  // Message bubble
  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${isAI ? 'msg-ai' : ''}`;
  bubble.textContent = msg.content;
  wrapper.appendChild(bubble);

  // Timestamp
  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  wrapper.appendChild(time);

  return wrapper;
}
```

---

## Example CSS

```css
/* AI badge */
.badge-ai {
  background: #f3e8ff;
  color: #7c3aed;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
}

/* Human badge */
.badge-human {
  background: #dbeafe;
  color: #2563eb;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
}

/* AI message bubble - slightly different style */
.msg-ai {
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-bottom-left-radius: 4px;
}

/* Human agent bubble */
.msg-reply .msg-bubble {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-bottom-left-radius: 4px;
}

/* Visitor's own message */
.msg-own .msg-bubble {
  background: #f97316;
  color: white;
  border-bottom-right-radius: 4px;
}
```

---

## Quick Reference

| Condition | Source | Suggested UI |
|-----------|--------|-------------|
| `msg.fromVisitor === true` | Visitor (user) | Right-aligned, orange bubble |
| `msg.fromAgent === true && msg.fromAI === true` | AI Agent | Left-aligned, purple-tinted bubble, "AI" badge, bot icon |
| `msg.fromAgent === true && !msg.fromAI` | Human Agent | Left-aligned, white bubble, "Human" badge or just agent name |

---

## Additional Notes

- `msg.sender` for AI replies is `"AI Assistant"` — you can customize this display name
- `msg.senderId` for AI replies is `"ai_agent"` — use this for programmatic checks
- When AI mode is off, you'll never receive `fromAI: true` messages
- A human agent can reply even when AI mode is on (manual override) — those won't have `fromAI`
- The `history` event on connect includes past messages with the same flags, so you can render history correctly too

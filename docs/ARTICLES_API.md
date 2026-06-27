# Articles API — Integration Documentation

## Overview

Articles are help/knowledge-base content that visitors can browse inside the chat widget. They have a title, avatar image, and HTML content. The admin creates articles via the dashboard, and your JS widget fetches and displays them.

---

## REST Endpoints (Public — No Auth Required)

### List all published articles

```
GET http://<SERVER_IP>:3001/api/articles
```

Response:
```json
[
  {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "title": "Getting Started",
    "avatar": "https://example.com/images/start.png",
    "published": true,
    "createdAt": "2024-06-01T10:00:00.000Z",
    "updatedAt": "2024-06-02T15:30:00.000Z"
  },
  {
    "_id": "665f1a2b3c4d5e6f7a8b9c0e",
    "title": "Billing & Payments",
    "avatar": "https://example.com/images/billing.png",
    "published": true,
    "createdAt": "2024-06-01T11:00:00.000Z",
    "updatedAt": "2024-06-01T11:00:00.000Z"
  }
]
```

Note: The list endpoint does NOT include `content` (HTML body) to keep the response lightweight.

### Get single article (with full content)

```
GET http://<SERVER_IP>:3001/api/articles/<article_id>
```

Response:
```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "title": "Getting Started",
  "avatar": "https://example.com/images/start.png",
  "content": "<h2>Welcome!</h2><p>Here's how to get started with our platform...</p><ul><li>Step 1: Create an account</li><li>Step 2: Set up your profile</li></ul>",
  "published": true,
  "createdAt": "2024-06-01T10:00:00.000Z",
  "updatedAt": "2024-06-02T15:30:00.000Z"
}
```

The `content` field contains HTML that should be rendered in the widget.

---

## Article Object Shape

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique article ID (MongoDB ObjectId) |
| `title` | string | Article title |
| `avatar` | string | URL to article thumbnail/icon image |
| `content` | string | Full article body as HTML |
| `published` | boolean | Whether visible to visitors |
| `createdAt` | string | ISO date of creation |
| `updatedAt` | string | ISO date of last update |

---

## Implementation Guide

### Step 1: Fetch article list on widget load

```javascript
async function loadArticles() {
  const res = await fetch('http://192.168.0.166:3001/api/articles');
  const articles = await res.json();
  renderArticleList(articles);
}
```

### Step 2: Render article list in widget

```javascript
function renderArticleList(articles) {
  const container = document.getElementById('articles-list');
  container.innerHTML = '';

  articles.forEach(article => {
    const item = document.createElement('div');
    item.className = 'article-item';
    item.innerHTML = `
      <img src="${article.avatar || 'default-icon.png'}" alt="" class="article-avatar" />
      <div class="article-info">
        <p class="article-title">${escapeHtml(article.title)}</p>
      </div>
    `;
    item.onclick = () => openArticle(article._id);
    container.appendChild(item);
  });
}
```

### Step 3: Open and render full article

```javascript
async function openArticle(articleId) {
  const res = await fetch(`http://192.168.0.166:3001/api/articles/${articleId}`);
  const article = await res.json();

  const viewer = document.getElementById('article-viewer');
  viewer.innerHTML = `
    <div class="article-header">
      <button onclick="closeArticle()" class="back-btn">← Back</button>
      <h2>${escapeHtml(article.title)}</h2>
    </div>
    <div class="article-content">
      ${article.content}
    </div>
  `;
  viewer.style.display = 'block';
  document.getElementById('articles-list').style.display = 'none';
}

function closeArticle() {
  document.getElementById('article-viewer').style.display = 'none';
  document.getElementById('articles-list').style.display = 'block';
}
```

---

## Example CSS

```css
.article-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;
}

.article-item:hover {
  background: #fafafa;
}

.article-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f5f5;
}

.article-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.article-content {
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.article-content h2 {
  font-size: 18px;
  margin-bottom: 12px;
}

.article-content p {
  margin-bottom: 8px;
}

.article-content ul, .article-content ol {
  padding-left: 20px;
  margin-bottom: 8px;
}

.back-btn {
  background: none;
  border: none;
  color: #f97316;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 8px;
}
```

---

## Widget UI Suggestions

### Option A: Tab in chat widget
Add a "Help" or "Articles" tab/icon in your widget header. When clicked, show the article list instead of the chat.

### Option B: Before-chat screen
Show popular articles on the pre-chat screen. If visitor can't find their answer, they start a chat.

### Option C: In-chat suggestion
After a visitor sends a message, check if any article title matches and suggest it inline:
```
"You might find this helpful: [Getting Started] — tap to read"
```

---

## Security Notes

- Article list and detail are **public** endpoints (no auth needed) — visitors can access them directly
- Only admin (JWT authenticated) can create, update, or delete articles
- The `content` field contains raw HTML — sanitize it before rendering if you don't trust the admin input
- The list endpoint excludes `content` to keep payloads small

---

## Admin Endpoints (JWT Required)

These are used by the dashboard, but listed here for completeness:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/articles/admin` | List all articles (including drafts) |
| `POST` | `/api/articles` | Create article `{ title, content, avatar, published }` |
| `PUT` | `/api/articles/:id` | Update article fields |
| `DELETE` | `/api/articles/:id` | Delete article |

All require `Authorization: Bearer <token>` header.

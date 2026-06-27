import { useState, useEffect } from "react";
import { BookOpen, Plus, Pencil, Trash2, Eye, EyeOff, X, Save, Image } from "lucide-react";
import { ArticlesSkeleton } from "./Skeletons";

const SERVER_HOST = import.meta.env.VITE_API_HOST || window.location.host;
const API_URL = `${window.location.protocol}//${SERVER_HOST}`;

export default function ArticlesPage({ token }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | article object
  const [form, setForm] = useState({ title: "", content: "", avatar: "", published: true });

  useEffect(() => { fetchArticles(); }, []);

  async function fetchArticles() {
    try {
      const res = await fetch(`${API_URL}/api/articles/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setArticles(await res.json());
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }

  function startNew() {
    setEditing("new");
    setForm({ title: "", content: "", avatar: "", published: true });
  }

  function startEdit(article) {
    setEditing(article);
    setForm({
      title: article.title,
      content: article.content,
      avatar: article.avatar || "",
      published: article.published,
    });
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    try {
      if (editing === "new") {
        await fetch(`${API_URL}/api/articles`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`${API_URL}/api/articles/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        });
      }
      setEditing(null);
      fetchArticles();
    } catch (err) {
      console.error("Failed to save article:", err);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this article?")) return;
    await fetch(`${API_URL}/api/articles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchArticles();
  }

  async function togglePublished(article) {
    await fetch(`${API_URL}/api/articles/${article._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: !article.published }),
    });
    fetchArticles();
  }

  // Editor view
  if (editing) {
    return (
      <div className="flex-1 flex flex-col bg-neutral-50 overflow-hidden">
        <div className="px-6 py-4 bg-white border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            {editing === "new" ? "New Article" : "Edit Article"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(null)}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-2xl">
          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Article title"
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Avatar URL</label>
            <div className="flex items-center gap-3">
              <input
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="https://example.com/image.png"
                className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              />
              {form.avatar && (
                <img src={form.avatar} alt="" className="w-10 h-10 rounded-lg object-cover border border-neutral-200" />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Content (HTML)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="<h2>Getting Started</h2><p>Welcome to our platform...</p>"
              className="w-full h-64 px-4 py-3 border border-neutral-200 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="published" className="text-xs text-neutral-700">Published (visible to visitors)</label>
          </div>

          {/* Preview */}
          {form.content && (
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Preview</label>
              <div
                className="p-4 border border-neutral-200 rounded-lg bg-white prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="flex-1 flex flex-col bg-neutral-50 overflow-hidden">
      <div className="px-6 py-5 bg-white border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Articles</h1>
            <p className="text-xs text-neutral-500">Help articles visible to visitors in the chat widget</p>
          </div>
        </div>
        <button
          onClick={startNew}
          className="px-4 py-2 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          New Article
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading && <ArticlesSkeleton />}

        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-medium">No articles yet</p>
            <p className="text-xs text-neutral-400 mt-1">Create help articles for your visitors</p>
          </div>
        )}

        <div className="space-y-3 max-w-2xl">
          {articles.map((article) => (
            <div
              key={article._id}
              className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden shrink-0">
                {article.avatar ? (
                  <img src={article.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-5 h-5 text-neutral-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{article.title}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {new Date(article.createdAt).toLocaleDateString()} &middot;
                  {article.published ? (
                    <span className="text-green-600 ml-1">Published</span>
                  ) : (
                    <span className="text-neutral-400 ml-1">Draft</span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePublished(article)}
                  title={article.published ? "Unpublish" : "Publish"}
                  className="p-2 text-neutral-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                >
                  {article.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => startEdit(article)}
                  className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(article._id)}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

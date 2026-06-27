import { createServer } from "http";
import { WebSocketServer } from "ws";
import { readFileSync, existsSync, createReadStream, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import geoip from "geoip-lite";
import { connectDB, getDB } from "./db.js";
import { registerUser, loginUser, verifyToken, setUserOffline, getOnlineUsers } from "./auth.js";
import { upload, UPLOAD_DIR } from "./upload.js";
import { generateAIReply, isAIConfigured, translateMessage, getAIProviderStatus } from "./ai.js";
import { sendDiscordAlert, getDiscordSettings, isDiscordClassifierReady } from "./discord.js";
import { getEmailSettings, isEmailConfigured, sendEmailToVisitor, DEFAULT_TEMPLATE } from "./email.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// Guest name generator — "Visitor #XXXX" with unique counter
let guestCounter = Math.floor(Math.random() * 9000) + 1000; // start with random 4-digit

function generateGuestName(sessionId) {
  // Use last 4 chars of sessionId as part of identifier for uniqueness
  if (sessionId) {
    const suffix = sessionId.replace(/-/g, "").slice(-5).toUpperCase();
    return `Visitor #${suffix}`;
  }
  guestCounter++;
  return `Visitor #${guestCounter}`;
}

// Convert country code to flag emoji
function countryToFlag(code) {
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

// Get geo info from IP
function getGeoFromIP(ip) {
  // Skip private/local IPs
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "::1") {
    return { city: null, country: null, countryCode: null, flag: "", region: null, ll: null };
  }
  const geo = geoip.lookup(ip);
  if (!geo) return { city: null, country: null, countryCode: null, flag: "", region: null, ll: null };
  return {
    city: geo.city || null,
    country: geo.country || null,
    countryCode: geo.country || null,
    flag: countryToFlag(geo.country),
    region: geo.region || null,
    ll: geo.ll || null,
  };
}

// MIME types for static file serving
const MIME_TYPES = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".pdf": "application/pdf", ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain", ".csv": "text/csv",
  ".zip": "application/zip", ".mp4": "video/mp4", ".webm": "video/webm",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".ogg": "audio/ogg",
};

// HTTP server
const httpServer = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // --- Serve rrweb.min.js for the magic browser tracker ---
  if (url.pathname === "/rrweb.min.js") {
    const rrwebPath = path.join(__dirname, "rrweb.min.js");
    if (existsSync(rrwebPath)) {
      const stat = statSync(rrwebPath);
      res.writeHead(200, {
        "Content-Type": "application/javascript",
        "Content-Length": stat.size,
        "Cache-Control": "public, max-age=86400",
      });
      createReadStream(rrwebPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
    return;
  }

  // --- Serve widget frontend files (for embedding on external sites) ---
  if (url.pathname.startsWith("/widget/")) {
    const widgetDir = path.join(__dirname, "..", "kittychatFrontend");
    const fileName = url.pathname.replace("/widget/", "");
    const filePath = path.join(widgetDir, fileName);
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      ".js": "application/javascript",
      ".html": "text/html",
      ".css": "text/css",
      ".png": "image/png",
      ".webp": "image/webp",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
    };
    const mime = mimeTypes[ext] || "application/octet-stream";
    const stat = statSync(filePath);
    res.writeHead(200, {
      "Content-Type": mime,
      "Content-Length": stat.size,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    });
    createReadStream(filePath).pipe(res);
    return;
  }

  // --- Serve dashboard (built React app) in production ---
  const dashboardDir = path.join(__dirname, "..", "dashboard", "dist");
  if (url.pathname.startsWith("/assets/")) {
    const filePath = path.join(dashboardDir, url.pathname);
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const assetMimes = {
        ".js": "application/javascript", ".css": "text/css",
        ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon",
        ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
      };
      const mime = assetMimes[ext] || "application/octet-stream";
      const stat = statSync(filePath);
      res.writeHead(200, {
        "Content-Type": mime,
        "Content-Length": stat.size,
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      createReadStream(filePath).pipe(res);
      return;
    }
  }

  // --- Static file serving for uploads ---
  if (url.pathname.startsWith("/uploads/")) {
    const fileName = url.pathname.replace("/uploads/", "");
    const filePath = path.join(UPLOAD_DIR, fileName);
    if (!existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(fileName).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    const stat = statSync(filePath);
    res.writeHead(200, {
      "Content-Type": mime,
      "Content-Length": stat.size,
      "Content-Disposition": `inline; filename="${fileName}"`,
    });
    createReadStream(filePath).pipe(res);
    return;
  }

  // --- File upload endpoint ---
  if (url.pathname === "/api/upload" && req.method === "POST") {
    const singleUpload = upload.single("file");
    singleUpload(req, res, (err) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
      if (!req.file) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No file uploaded" }));
        return;
      }
      const fileUrl = `http://${req.headers.host}/uploads/${req.file.filename}`;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: true,
        file: {
          url: fileUrl,
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          filename: req.file.filename,
        },
      }));
    });
    return;
  }

  // --- Regular JSON body routes ---
  let body = "";

  await new Promise((resolve) => {
    req.on("data", (chunk) => (body += chunk));
    req.on("end", resolve);
  });

  try {
    if (url.pathname === "/api/register" && req.method === "POST") {
      const { email, password, name } = JSON.parse(body);
      if (!email || !password || !name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Email, password, and name are required" }));
        return;
      }
      const user = await registerUser(email, password, name);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, user }));
    } else if (url.pathname === "/api/login" && req.method === "POST") {
      const { email, password } = JSON.parse(body);
      if (!email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Email and password are required" }));
        return;
      }
      const result = await loginUser(email, password);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } else if (url.pathname === "/api/users" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const users = await getOnlineUsers();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users));
    } else if (url.pathname === "/api/rooms" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const db = getDB();
      const rooms = await db.collection("rooms").find().toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(rooms));
    } else if (url.pathname === "/api/conversations" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const db = getDB();
      const conversations = await db
        .collection("conversations")
        .find({ lastMessage: { $ne: null } })
        .sort({ lastMessageAt: -1 })
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(conversations));
    } else if (url.pathname === "/api/visitors" && req.method === "GET") {
      // GET /api/visitors — list all visitors (online ones marked)
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const db = getDB();
      const allVisitors = await db.collection("visitors")
        .find()
        .sort({ lastSeenAt: -1 })
        .limit(100)
        .toArray();

      // Mark which visitors are currently connected
      const onlineSessionIds = new Set();
      for (const [, v] of visitorClients) {
        onlineSessionIds.add(v.sessionId);
      }

      // Check which visitors have conversations with messages
      const sessionIds = allVisitors.map((v) => v.sessionId);
      const conversations = await db.collection("conversations").find({ sessionId: { $in: sessionIds } }).toArray();
      const convMap = {};
      for (const c of conversations) convMap[c.sessionId] = c;

      const enriched = allVisitors.map((v) => ({
        ...v,
        online: onlineSessionIds.has(v.sessionId),
        hasConversation: !!convMap[v.sessionId]?.lastMessage,
        lastMessage: convMap[v.sessionId]?.lastMessage || null,
        conversationStatus: convMap[v.sessionId]?.status || null,
      }));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ visitors: enriched }));

    } else if (url.pathname.startsWith("/api/visitors/") && req.method === "GET") {
      // GET /api/visitors/:sessionId — get visitor details
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const sessionId = url.pathname.split("/api/visitors/")[1];
      const db = getDB();
      let visitor = await db.collection("visitors").findOne({ sessionId });
      const conversation = await db.collection("conversations").findOne({ sessionId });

      if (!visitor) {
        // Build minimal info from conversation + live connection
        visitor = {
          sessionId,
          name: conversation?.visitorName || generateGuestName(sessionId),
          createdAt: conversation?.createdAt,
          lastSeenAt: conversation?.lastSeenAt,
        };
        // Check if visitor is currently connected
        for (const [, v] of visitorClients) {
          if (v.sessionId === sessionId) {
            visitor.ip = v.ip;
            visitor.browser = v.browser;
            visitor.os = v.os;
            visitor.device = v.device;
            visitor.language = v.language;
            visitor.userAgent = v.userAgent;
            visitor.city = v.city;
            visitor.country = v.country;
            visitor.countryCode = v.countryCode;
            visitor.flag = v.flag;
            visitor.online = true;
            break;
          }
        }
      } else {
        visitor.online = false;
        for (const [, v] of visitorClients) {
          if (v.sessionId === sessionId) {
            visitor.online = true;
            break;
          }
        }
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ visitor, conversation }));
    } else if (url.pathname.startsWith("/api/visitors/") && req.method === "PUT") {
      // PUT /api/visitors/:sessionId/notes — update agent notes
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const pathParts = url.pathname.split("/");
      const sessionId = pathParts[3];
      const db = getDB();
      const updates = JSON.parse(body);
      await db.collection("visitors").updateOne(
        { sessionId },
        { $set: updates },
        { upsert: true }
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } else if (url.pathname === "/api/settings/ai" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const db = getDB();
      const setting = await db.collection("settings").findOne({ key: "ai_mode" });
      const fallback = await db.collection("settings").findOne({ key: "ai_fallback" });
      const providerSetting = await db.collection("settings").findOne({ key: "ai_provider" });
      const providerStatus = getAIProviderStatus();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        enabled: setting?.enabled || false,
        aiConfigured: isAIConfigured(),
        fallbackEnabled: fallback?.enabled || false,
        fallbackMinutes: fallback?.minutes || 5,
        provider: providerSetting?.provider || "auto",
        geminiAvailable: providerStatus.geminiAvailable,
        groqAvailable: providerStatus.groqAvailable,
      }));
    } else if (url.pathname === "/api/settings/ai" && req.method === "POST") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const { enabled } = JSON.parse(body);
      const db = getDB();
      await db.collection("settings").updateOne(
        { key: "ai_mode" },
        { $set: { enabled: !!enabled, updatedAt: new Date() } },
        { upsert: true }
      );
      broadcastToAgents({ type: "ai_mode_changed", enabled: !!enabled });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, enabled: !!enabled }));
    } else if (url.pathname === "/api/settings/ai-fallback" && req.method === "POST") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const { fallbackEnabled, fallbackMinutes } = JSON.parse(body);
      const db = getDB();
      const minutes = Math.max(1, Math.min(60, Number(fallbackMinutes) || 5));
      await db.collection("settings").updateOne(
        { key: "ai_fallback" },
        { $set: { enabled: !!fallbackEnabled, minutes, updatedAt: new Date() } },
        { upsert: true }
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, fallbackEnabled: !!fallbackEnabled, fallbackMinutes: minutes }));
    } else if (url.pathname === "/api/settings/ai-prompts" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const db = getDB();
      const config = await db.collection("settings").findOne({ key: "ai_prompts" });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        systemInstruction: config?.systemInstruction || "",
        personality: config?.personality || "",
      }));
    } else if (url.pathname === "/api/settings/ai-prompts" && req.method === "POST") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const { systemInstruction, personality } = JSON.parse(body);
      const db = getDB();
      await db.collection("settings").updateOne(
        { key: "ai_prompts" },
        { $set: { systemInstruction: systemInstruction || "", personality: personality || "", updatedAt: new Date() } },
        { upsert: true }
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));

    } else if (url.pathname === "/api/settings/ai-provider" && req.method === "POST") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const { provider } = JSON.parse(body);
      const allowed = ["auto", "gemini", "groq"];
      if (!allowed.includes(provider)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid provider. Use: auto, gemini, or groq" }));
        return;
      }
      const db = getDB();
      await db.collection("settings").updateOne(
        { key: "ai_provider" },
        { $set: { provider, updatedAt: new Date() } },
        { upsert: true }
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, provider }));

    // ---- Discord Webhook API ----
    } else if (url.pathname === "/api/settings/discord" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const settings = await getDiscordSettings();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ...settings, classifierReady: isDiscordClassifierReady() }));

    } else if (url.pathname === "/api/settings/discord" && req.method === "POST") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const { enabled, webhookUrl, prompt } = JSON.parse(body);
      const db = getDB();
      const updates = { updatedAt: new Date() };
      if (typeof enabled === "boolean") updates.enabled = enabled;
      if (webhookUrl !== undefined) updates.webhookUrl = webhookUrl;
      if (prompt !== undefined) updates.prompt = prompt;
      await db.collection("settings").updateOne(
        { key: "discord_webhook" },
        { $set: updates },
        { upsert: true }
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));

    // ---- Articles API ----
    } else if (url.pathname === "/api/articles" && req.method === "GET") {
      // Public — no auth needed (visitors can fetch articles)
      const db = getDB();
      const articles = await db.collection("articles")
        .find({ published: true })
        .sort({ createdAt: -1 })
        .project({ content: 0 }) // list view: no heavy HTML
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(articles));

    } else if (url.pathname.match(/^\/api\/articles\/[a-f0-9]{24}$/) && req.method === "GET") {
      // Public — get single article by ID
      const articleId = url.pathname.split("/api/articles/")[1];
      const db = getDB();
      const { ObjectId } = await import("mongodb");
      const article = await db.collection("articles").findOne({ _id: new ObjectId(articleId), published: true });
      if (!article) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Article not found" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(article));

    } else if (url.pathname === "/api/articles" && req.method === "POST") {
      // Admin — create article
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const { title, content, avatar, published } = JSON.parse(body);
      if (!title?.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title is required" }));
        return;
      }
      const db = getDB();
      const article = {
        title: title.trim(),
        content: content || "",
        avatar: avatar || "",
        published: published !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: decoded.userId,
      };
      const result = await db.collection("articles").insertOne(article);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, article: { ...article, _id: result.insertedId } }));

    } else if (url.pathname.match(/^\/api\/articles\/[a-f0-9]{24}$/) && req.method === "PUT") {
      // Admin — update article
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const articleId = url.pathname.split("/api/articles/")[1];
      const updates = JSON.parse(body);
      const db = getDB();
      const { ObjectId } = await import("mongodb");
      const allowed = ["title", "content", "avatar", "published"];
      const setFields = { updatedAt: new Date() };
      for (const key of allowed) {
        if (updates[key] !== undefined) setFields[key] = updates[key];
      }
      await db.collection("articles").updateOne(
        { _id: new ObjectId(articleId) },
        { $set: setFields }
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));

    } else if (url.pathname.match(/^\/api\/articles\/[a-f0-9]{24}$/) && req.method === "DELETE") {
      // Admin — delete article
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const articleId = url.pathname.split("/api/articles/")[1];
      const db = getDB();
      const { ObjectId } = await import("mongodb");
      await db.collection("articles").deleteOne({ _id: new ObjectId(articleId) });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));

    } else if (url.pathname === "/api/articles/admin" && req.method === "GET") {
      // Admin — list all articles (including unpublished)
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const db = getDB();
      const articles = await db.collection("articles").find().sort({ createdAt: -1 }).toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(articles));

    // ---- Translation API ----
    } else if (url.pathname === "/api/translate" && req.method === "POST") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      if (!isAIConfigured()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "AI not configured. Set GEMINI_API_KEY in .env" }));
        return;
      }
      const { text, targetLang } = JSON.parse(body);
      if (!text?.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "text is required" }));
        return;
      }
      try {
        const result = await translateMessage(text.trim(), targetLang || "english");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }

    // ---- Email SMTP Settings API ----
    } else if (url.pathname === "/api/settings/email" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const settings = await getEmailSettings();
      // Don't send the password back
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ...settings, pass: settings.pass ? "••••••••" : "" }));

    } else if (url.pathname === "/api/settings/email" && req.method === "POST") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const { enabled, host, port, secure, user, pass, fromEmail, fromName, companyName, siteUrl, cc, template } = JSON.parse(body);
      const db = getDB();
      const updates = { updatedAt: new Date() };
      if (typeof enabled === "boolean") updates.enabled = enabled;
      if (host !== undefined) updates.host = host;
      if (port !== undefined) updates.port = Number(port) || 587;
      if (typeof secure === "boolean") updates.secure = secure;
      if (user !== undefined) updates.user = user;
      if (pass !== undefined && pass !== "••••••••") updates.pass = pass;
      if (fromEmail !== undefined) updates.fromEmail = fromEmail;
      if (fromName !== undefined) updates.fromName = fromName;
      if (companyName !== undefined) updates.companyName = companyName;
      if (siteUrl !== undefined) updates.siteUrl = siteUrl;
      if (cc !== undefined) updates.cc = cc;
      if (template !== undefined) updates.template = template;

      await db.collection("settings").updateOne(
        { key: "email_smtp" },
        { $set: updates },
        { upsert: true }
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));

    } else if (url.pathname === "/api/settings/email/test" && req.method === "POST") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const { toEmail } = JSON.parse(body);
      if (!toEmail) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "toEmail required" }));
        return;
      }
      try {
        await sendEmailToVisitor(toEmail, "This is a test message from your support chat.", "Test User");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }

    } else if (url.pathname === "/api/email/send" && req.method === "POST") {
      // Send email to a visitor (agent-triggered)
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const decoded = verifyToken(token);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const { sessionId, content } = JSON.parse(body);
      if (!sessionId || !content?.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "sessionId and content required" }));
        return;
      }
      const db = getDB();
      const visitor = await db.collection("visitors").findOne({ sessionId });
      if (!visitor?.email) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Visitor has no email on file" }));
        return;
      }
      try {
        await sendEmailToVisitor(visitor.email, content.trim(), visitor.name);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, sentTo: visitor.email }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }

    } else {
      // SPA fallback: serve dashboard index.html for non-API routes
      const dashIndexPath = path.join(__dirname, "..", "dashboard", "dist", "index.html");
      if (!url.pathname.startsWith("/api/") && existsSync(dashIndexPath)) {
        const stat = statSync(dashIndexPath);
        res.writeHead(200, { "Content-Type": "text/html", "Content-Length": stat.size });
        createReadStream(dashIndexPath).pipe(res);
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
      }
    }
  } catch (err) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
});

// ---- WebSocket servers ----
const wss = new WebSocketServer({ noServer: true });
const widgetWss = new WebSocketServer({ noServer: true });
const magicWss = new WebSocketServer({ noServer: true });

httpServer.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname === "/widget") {
    widgetWss.handleUpgrade(req, socket, head, (ws) => widgetWss.emit("connection", ws, req));
  } else if (url.pathname === "/magic") {
    magicWss.handleUpgrade(req, socket, head, (ws) => magicWss.emit("connection", ws, req));
  } else {
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  }
});

// Track connected dashboard agents
const agentClients = new Map();
// Track connected widget visitors
const visitorClients = new Map();

// Live typing preview debounce map: sessionId -> { timeout, lastContent }
const typingPreviewDebounce = new Map();

function broadcastToRoom(room, data) {
  const payload = JSON.stringify(data);
  for (const [ws, client] of agentClients) {
    if (ws.readyState === 1 && client.room === room) {
      ws.send(payload);
    }
  }
}

function broadcastToAgents(data) {
  const payload = JSON.stringify(data);
  for (const [ws] of agentClients) {
    if (ws.readyState === 1) ws.send(payload);
  }
}

function sendToVisitor(sessionId, data) {
  const payload = JSON.stringify(data);
  for (const [ws, visitor] of visitorClients) {
    if (ws.readyState === 1 && visitor.sessionId === sessionId) {
      ws.send(payload);
    }
  }
}

async function broadcastStats() {
  const db = getDB();
  const rooms = await db.collection("rooms").find().toArray();

  for (const room of rooms) {
    room.messageCount = await db.collection("messages").countDocuments({ room: room.name });
  }

  const inboxCount = await db.collection("conversations").countDocuments({ status: "open" });

  const stats = {
    type: "stats",
    online: agentClients.size,
    visitors: visitorClients.size,
    totalMessages: await db.collection("messages").countDocuments(),
    inboxCount,
    rooms: rooms.map((r) => ({ id: r.name, name: r.name, messageCount: r.messageCount })),
  };
  broadcastToAgents(stats);
}

async function broadcastConversations() {
  const db = getDB();
  const conversations = await db
    .collection("conversations")
    .find({ lastMessage: { $ne: null } })
    .sort({ lastMessageAt: -1 })
    .toArray();

  // Enrich with visitor email/phone from visitors collection
  const sessionIds = conversations.map((c) => c.sessionId);
  const visitors = await db
    .collection("visitors")
    .find({ sessionId: { $in: sessionIds } }, { projection: { sessionId: 1, email: 1, phone: 1, flag: 1, country: 1 } })
    .toArray();
  const visitorMap = {};
  for (const v of visitors) visitorMap[v.sessionId] = v;

  const enriched = conversations.map((c) => {
    // Check if visitor is online
    let online = false;
    for (const [, v] of visitorClients) {
      if (v.sessionId === c.sessionId) { online = true; break; }
    }
    return {
      ...c,
      email: visitorMap[c.sessionId]?.email || null,
      phone: visitorMap[c.sessionId]?.phone || null,
      flag: visitorMap[c.sessionId]?.flag || null,
      country: visitorMap[c.sessionId]?.country || null,
      online,
    };
  });

  broadcastToAgents({ type: "conversations", conversations: enriched });
}

// Helper: extract IP from request
function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

// Helper: parse user-agent into browser/OS
function parseUserAgent(ua) {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "Unknown" };

  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  // Browser detection
  if (ua.includes("Firefox/")) {
    const match = ua.match(/Firefox\/(\d+)/);
    browser = `Firefox ${match ? match[1] : ""}`;
  } else if (ua.includes("Edg/")) {
    const match = ua.match(/Edg\/(\d+)/);
    browser = `Edge ${match ? match[1] : ""}`;
  } else if (ua.includes("Chrome/")) {
    const match = ua.match(/Chrome\/(\d+)/);
    browser = `Chrome ${match ? match[1] : ""}`;
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    const match = ua.match(/Version\/(\d+)/);
    browser = `Safari ${match ? match[1] : ""}`;
  }

  // OS detection
  if (ua.includes("Windows NT 10")) os = "Windows 10/11";
  else if (ua.includes("Windows NT")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Device detection
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
    device = "Mobile";
  } else if (ua.includes("iPad") || ua.includes("Tablet")) {
    device = "Tablet";
  }

  return { browser, os, device };
}

// ---- Dashboard Agent WebSocket ----
wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const token = url.searchParams.get("token");
  const decoded = verifyToken(token);

  if (!decoded) {
    ws.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
    ws.close();
    return;
  }

  const clientData = {
    userId: decoded.userId,
    name: decoded.name,
    email: decoded.email,
    role: decoded.role,
    room: "general",
    viewingConversation: null,
  };
  agentClients.set(ws, clientData);

  (async () => {
    const db = getDB();
    const history = await db
      .collection("messages")
      .find({ room: "general" })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    ws.send(JSON.stringify({ type: "history", messages: history.reverse() }));
    await broadcastStats();
    await broadcastConversations();
  })();

  ws.on("message", async (raw) => {
    try {
      const data = JSON.parse(raw);
      const client = agentClients.get(ws);
      const db = getDB();

      switch (data.type) {
        case "message": {
          if (!data.content?.trim()) break;

          const msg = {
            sender: client.name,
            senderId: client.userId,
            content: data.content.trim(),
            room: client.room,
            timestamp: new Date(),
            readBy: [client.userId],
          };

          await db.collection("messages").insertOne(msg);
          broadcastToRoom(client.room, {
            type: "message",
            id: msg._id?.toString(),
            sender: msg.sender,
            senderId: msg.senderId,
            content: msg.content,
            room: msg.room,
            timestamp: msg.timestamp.getTime(),
          });
          await broadcastStats();
          break;
        }

        case "switch_room": {
          if (!data.room) break;
          const oldRoom = client.room;
          client.room = data.room;
          client.viewingConversation = null;

          broadcastToRoom(oldRoom, {
            type: "system",
            content: `${client.name} left the room`,
            timestamp: Date.now(),
          });

          const history = await db
            .collection("messages")
            .find({ room: client.room })
            .sort({ timestamp: -1 })
            .limit(50)
            .toArray();

          ws.send(JSON.stringify({ type: "history", messages: history.reverse() }));

          broadcastToRoom(client.room, {
            type: "system",
            content: `${client.name} joined the room`,
            timestamp: Date.now(),
          });
          await broadcastStats();
          break;
        }

        case "open_conversation": {
          if (!data.sessionId) break;
          client.viewingConversation = data.sessionId;
          client.room = `visitor_${data.sessionId}`;

          const history = await db
            .collection("messages")
            .find({ room: `visitor_${data.sessionId}` })
            .sort({ timestamp: -1 })
            .limit(50)
            .toArray();

          ws.send(JSON.stringify({ type: "history", messages: history.reverse() }));

          // Mark as read
          await db.collection("conversations").updateOne(
            { sessionId: data.sessionId },
            { $set: { unread: false, readAt: new Date() } }
          );

          // Send visitor details
          let visitorInfo = await db.collection("visitors").findOne({ sessionId: data.sessionId });
          if (!visitorInfo) {
            const conv = await db.collection("conversations").findOne({ sessionId: data.sessionId });
            visitorInfo = {
              sessionId: data.sessionId,
              name: conv?.visitorName || generateGuestName(data.sessionId),
              createdAt: conv?.createdAt,
              lastSeenAt: conv?.lastSeenAt,
            };
            for (const [, v] of visitorClients) {
              if (v.sessionId === data.sessionId) {
                visitorInfo.ip = v.ip;
                visitorInfo.browser = v.browser;
                visitorInfo.os = v.os;
                visitorInfo.device = v.device;
                visitorInfo.language = v.language;
                visitorInfo.city = v.city;
                visitorInfo.country = v.country;
                visitorInfo.countryCode = v.countryCode;
                visitorInfo.flag = v.flag;
                visitorInfo.online = true;
                break;
              }
            }
          } else {
            visitorInfo.online = false;
            for (const [, v] of visitorClients) {
              if (v.sessionId === data.sessionId) {
                visitorInfo.online = true;
                break;
              }
            }
          }
          ws.send(JSON.stringify({ type: "visitor_info", visitor: visitorInfo }));

          // Send other conversations from same email
          if (visitorInfo.email) {
            const otherVisitors = await db.collection("visitors")
              .find({ email: visitorInfo.email, sessionId: { $ne: data.sessionId } })
              .project({ sessionId: 1, name: 1, createdAt: 1 })
              .toArray();
            const otherConvs = [];
            for (const ov of otherVisitors) {
              const c = await db.collection("conversations").findOne({ sessionId: ov.sessionId });
              if (c) otherConvs.push({ ...c, visitorName: ov.name });
            }
            ws.send(JSON.stringify({ type: "other_conversations", conversations: otherConvs }));
          }

          // Send shared images from this conversation
          const imageMessages = await db.collection("messages")
            .find({ room: `visitor_${data.sessionId}`, "file.type": { $regex: /^image\// } })
            .sort({ timestamp: -1 })
            .limit(20)
            .toArray();
          const sharedImages = imageMessages.map((m) => ({
            url: m.file.url,
            name: m.file.name,
            timestamp: m.timestamp,
            sender: m.sender,
          }));
          ws.send(JSON.stringify({ type: "shared_images", images: sharedImages }));

          await broadcastConversations();
          break;
        }

        // Resolve / unresolve a conversation
        case "resolve_conversation": {
          if (!data.sessionId) break;
          const newStatus = data.resolved ? "resolved" : "open";
          await db.collection("conversations").updateOne(
            { sessionId: data.sessionId },
            { $set: { status: newStatus, resolvedAt: data.resolved ? new Date() : null } }
          );
          await broadcastConversations();
          ws.send(JSON.stringify({ type: "conversation_resolved", sessionId: data.sessionId, status: newStatus }));
          break;
        }

        // Mark read/unread
        case "mark_conversation": {
          if (!data.sessionId) break;
          await db.collection("conversations").updateOne(
            { sessionId: data.sessionId },
            { $set: { unread: !!data.unread } }
          );
          await broadcastConversations();
          break;
        }

        case "reply_visitor": {
          if (!data.sessionId || (!data.content?.trim() && !data.file)) break;

          const msg = {
            sender: client.name,
            senderId: client.userId,
            content: (data.content || "").trim(),
            room: `visitor_${data.sessionId}`,
            timestamp: new Date(),
            fromAgent: true,
          };

          if (data.file && data.file.url) {
            msg.file = {
              url: data.file.url,
              name: data.file.name || "file",
              size: data.file.size || 0,
              type: data.file.type || "application/octet-stream",
            };
          }

          await db.collection("messages").insertOne(msg);

          await db.collection("conversations").updateOne(
            { sessionId: data.sessionId },
            { $set: { lastMessage: msg.file ? `📎 ${msg.file.name}` : msg.content, lastMessageAt: new Date() } }
          );

          const msgPayload = {
            type: "message",
            id: msg._id?.toString(),
            sender: msg.sender,
            senderId: msg.senderId,
            content: msg.content,
            room: msg.room,
            timestamp: msg.timestamp.getTime(),
            fromAgent: true,
          };
          if (msg.file) msgPayload.file = msg.file;

          // Check if visitor is online
          let visitorOnline = false;
          for (const [, v] of visitorClients) {
            if (v.sessionId === data.sessionId) {
              visitorOnline = true;
              break;
            }
          }

          sendToVisitor(data.sessionId, msgPayload);

          // Send to other agents viewing this conversation
          for (const [agentWs, agentClient] of agentClients) {
            if (agentWs === ws) continue;
            if (agentWs.readyState === 1 && agentClient.viewingConversation === data.sessionId) {
              agentWs.send(JSON.stringify(msgPayload));
            }
          }

          // Send confirmation to sender
          ws.send(JSON.stringify(msgPayload));

          // If visitor is offline, check if they have an email and notify agent
          if (!visitorOnline) {
            const visitorRecord = await db.collection("visitors").findOne({ sessionId: data.sessionId });
            const hasEmail = !!visitorRecord?.email;
            const emailConfigured = await isEmailConfigured();

            if (hasEmail && emailConfigured && msg.content) {
              // If agent explicitly requested email send
              if (data.sendEmail) {
                try {
                  await sendEmailToVisitor(visitorRecord.email, msg.content, visitorRecord.name);
                  ws.send(JSON.stringify({
                    type: "email_sent",
                    sessionId: data.sessionId,
                    sentTo: visitorRecord.email,
                  }));
                } catch (emailErr) {
                  ws.send(JSON.stringify({
                    type: "email_failed",
                    sessionId: data.sessionId,
                    error: emailErr.message,
                  }));
                }
              } else {
                // Prompt agent that visitor is offline and email is available
                ws.send(JSON.stringify({
                  type: "visitor_offline_prompt",
                  sessionId: data.sessionId,
                  email: visitorRecord.email,
                  visitorName: visitorRecord.name,
                  messageContent: msg.content,
                }));
              }
            } else if (!visitorOnline && !hasEmail) {
              ws.send(JSON.stringify({
                type: "visitor_offline_no_email",
                sessionId: data.sessionId,
              }));
            }
          }

          await broadcastConversations();
          break;
        }

        // Agent confirms sending email to offline visitor
        case "email_visitor": {
          if (!data.sessionId || !data.content?.trim()) break;
          const visitorRecord = await db.collection("visitors").findOne({ sessionId: data.sessionId });
          if (!visitorRecord?.email) {
            ws.send(JSON.stringify({ type: "email_failed", sessionId: data.sessionId, error: "No email on file" }));
            break;
          }
          try {
            await sendEmailToVisitor(visitorRecord.email, data.content.trim(), visitorRecord.name);
            ws.send(JSON.stringify({
              type: "email_sent",
              sessionId: data.sessionId,
              sentTo: visitorRecord.email,
            }));
          } catch (emailErr) {
            ws.send(JSON.stringify({
              type: "email_failed",
              sessionId: data.sessionId,
              error: emailErr.message,
            }));
          }
          break;
        }

        case "typing": {
          if (client.viewingConversation) {
            sendToVisitor(client.viewingConversation, {
              type: "typing",
              sender: client.name,
              isTyping: data.isTyping,
            });
          } else {
            broadcastToRoom(client.room, {
              type: "typing",
              sender: client.name,
              isTyping: data.isTyping,
            });
          }
          break;
        }

        case "mark_read": {
          if (data.messageId) {
            const { ObjectId } = await import("mongodb");
            await db.collection("messages").updateOne(
              { _id: new ObjectId(data.messageId) },
              { $addToSet: { readBy: client.userId } }
            );
          }
          break;
        }

        case "create_room": {
          if (!data.name?.trim()) break;
          const roomName = data.name.trim().toLowerCase().replace(/\s+/g, "-");
          await db.collection("rooms").updateOne(
            { name: roomName },
            { $setOnInsert: { name: roomName, createdAt: new Date(), createdBy: client.userId } },
            { upsert: true }
          );
          await broadcastStats();
          break;
        }

        case "delete_message": {
          if (!data.messageId) break;
          const { ObjectId } = await import("mongodb");
          const message = await db.collection("messages").findOne({ _id: new ObjectId(data.messageId) });
          if (message && message.senderId === client.userId) {
            await db.collection("messages").deleteOne({ _id: new ObjectId(data.messageId) });
            broadcastToRoom(client.room, { type: "message_deleted", messageId: data.messageId });
            await broadcastStats();
          }
          break;
        }

        case "edit_message": {
          if (!data.messageId || !data.content?.trim()) break;
          const { ObjectId } = await import("mongodb");
          const msg2 = await db.collection("messages").findOne({ _id: new ObjectId(data.messageId) });
          if (msg2 && msg2.senderId === client.userId) {
            await db.collection("messages").updateOne(
              { _id: new ObjectId(data.messageId) },
              { $set: { content: data.content.trim(), editedAt: new Date() } }
            );
            broadcastToRoom(client.room, {
              type: "message_edited",
              messageId: data.messageId,
              content: data.content.trim(),
              editedAt: Date.now(),
            });
          }
          break;
        }

        // Agent saves private notes about a visitor
        case "save_notes": {
          if (!data.sessionId || !data.notes) break;
          await db.collection("visitors").updateOne(
            { sessionId: data.sessionId },
            { $set: { agentNotes: data.notes, notesUpdatedAt: new Date() } },
            { upsert: true }
          );
          ws.send(JSON.stringify({ type: "notes_saved", sessionId: data.sessionId }));
          break;
        }

        // Update conversation status (resolve, open, block, unread)
        case "update_conversation": {
          if (!data.sessionId) break;
          const updates = {};
          if (data.status) updates.status = data.status;
          if (data.unread !== undefined) updates.unread = data.unread;
          if (Object.keys(updates).length > 0) {
            updates.updatedAt = new Date();
            await db.collection("conversations").updateOne(
              { sessionId: data.sessionId },
              { $set: updates }
            );
            await broadcastConversations();
          }
          break;
        }

        // Delete conversation and all messages
        case "delete_conversation": {
          if (!data.sessionId) break;
          await db.collection("conversations").deleteOne({ sessionId: data.sessionId });
          await db.collection("messages").deleteMany({ room: `visitor_${data.sessionId}` });
          await broadcastConversations();
          await broadcastStats();
          break;
        }
      }
    } catch (e) {
      console.error("Error processing message:", e);
      ws.send(JSON.stringify({ type: "error", message: "Failed to process message" }));
    }
  });

  ws.on("close", async () => {
    const client = agentClients.get(ws);
    if (client) {
      broadcastToRoom(client.room, {
        type: "system",
        content: `${client.name} left`,
        timestamp: Date.now(),
      });
      await setUserOffline(client.userId);
    }
    agentClients.delete(ws);
    await broadcastStats();
  });
});

// ---- Visitor Widget WebSocket ----
widgetWss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    ws.send(JSON.stringify({ type: "error", message: "sessionId required" }));
    ws.close();
    return;
  }

  // Capture connection metadata from HTTP headers
  const ip = getClientIP(req);
  const userAgentStr = req.headers["user-agent"] || "";
  const { browser, os, device } = parseUserAgent(userAgentStr);
  const language = req.headers["accept-language"]?.split(",")[0] || "unknown";

  // Geo lookup from IP
  const geo = getGeoFromIP(ip);

  const visitorData = {
    sessionId,
    name: generateGuestName(sessionId),
    connectedAt: new Date(),
    ip,
    userAgent: userAgentStr,
    browser,
    os,
    device,
    language,
    city: geo.city,
    country: geo.country,
    countryCode: geo.countryCode,
    flag: geo.flag,
    region: geo.region,
  };
  visitorClients.set(ws, visitorData);

  // Save/update visitor record in DB
  (async () => {
    const db = getDB();

    // Check if visitor already exists (to preserve their name)
    const existingVisitor = await db.collection("visitors").findOne({ sessionId });
    if (existingVisitor && existingVisitor.name) {
      visitorData.name = existingVisitor.name;
    }

    // Upsert visitor info
    await db.collection("visitors").updateOne(
      { sessionId },
      {
        $set: {
          ip,
          userAgent: userAgentStr,
          browser,
          os,
          device,
          language,
          city: geo.city,
          country: geo.country,
          countryCode: geo.countryCode,
          flag: geo.flag,
          region: geo.region,
          lastSeenAt: new Date(),
          online: true,
        },
        $setOnInsert: {
          sessionId,
          name: visitorData.name,
          createdAt: new Date(),
          customData: {},
          pageViews: [],
          agentNotes: "",
        },
        $inc: { visitCount: 1 },
      },
      { upsert: true }
    );

    // Create or update conversation record
    await db.collection("conversations").updateOne(
      { sessionId },
      {
        $setOnInsert: {
          sessionId,
          visitorName: visitorData.name,
          status: "open",
          createdAt: new Date(),
        },
        $set: { lastSeenAt: new Date() },
      },
      { upsert: true }
    );

    // Load history
    const history = await db
      .collection("messages")
      .find({ room: `visitor_${sessionId}` })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    ws.send(JSON.stringify({ type: "history", messages: history.reverse() }));
    await broadcastStats();
    await broadcastConversations();
  })();

  ws.on("message", async (raw) => {
    try {
      const data = JSON.parse(raw);
      const visitor = visitorClients.get(ws);
      const db = getDB();

      switch (data.type) {
        case "message": {
          if (!data.content?.trim() && !data.file) break;

          const msg = {
            sender: visitor.name,
            senderId: visitor.sessionId,
            content: (data.content || "").trim(),
            room: `visitor_${visitor.sessionId}`,
            timestamp: new Date(),
            fromVisitor: true,
          };

          // Attach file info if present
          if (data.file && data.file.url) {
            msg.file = {
              url: data.file.url,
              name: data.file.name || "file",
              size: data.file.size || 0,
              type: data.file.type || "application/octet-stream",
            };
          }

          await db.collection("messages").insertOne(msg);

          await db.collection("conversations").updateOne(
            { sessionId: visitor.sessionId },
            {
              $set: {
                lastMessage: msg.file ? `📎 ${msg.file.name}` : msg.content,
                lastMessageAt: new Date(),
                visitorName: data.name || visitor.name,
                status: "open",
                unread: true,
              },
            }
          );

          if (data.name) visitor.name = data.name;

          const msgPayload = {
            type: "message",
            id: msg._id?.toString(),
            sender: msg.sender,
            senderId: msg.senderId,
            content: msg.content,
            room: msg.room,
            timestamp: msg.timestamp.getTime(),
            fromVisitor: true,
          };
          if (msg.file) msgPayload.file = msg.file;

          ws.send(JSON.stringify(msgPayload));

          for (const [agentWs, agentClient] of agentClients) {
            if (agentWs.readyState === 1 && agentClient.viewingConversation === visitor.sessionId) {
              agentWs.send(JSON.stringify(msgPayload));
            }
          }

          await broadcastConversations();
          await broadcastStats();

          // Discord high-priority alert (non-blocking)
          if (msg.content) {
            const visitorMeta = await db.collection("visitors").findOne({ sessionId: visitor.sessionId });
            sendDiscordAlert(
              visitor.name,
              msg.content,
              visitor.sessionId,
              { email: visitorMeta?.email, currentPage: visitorMeta?.currentPage, country: visitorMeta?.country }
            ).catch((err) => console.error("[Discord] Alert error:", err.message));
          }

          // AI auto-reply if enabled
          const aiSetting = await db.collection("settings").findOne({ key: "ai_mode" });
          if (aiSetting?.enabled && isAIConfigured()) {
            try {
              const recentMessages = await db
                .collection("messages")
                .find({ room: `visitor_${visitor.sessionId}` })
                .sort({ timestamp: -1 })
                .limit(10)
                .toArray();

              const visitorInfo = await db.collection("visitors").findOne({ sessionId: visitor.sessionId });
              const aiReply = await generateAIReply(recentMessages.reverse(), visitorInfo || {});

              if (aiReply) {
                const aiMsg = {
                  sender: "AI Assistant",
                  senderId: "ai_agent",
                  content: aiReply,
                  room: `visitor_${visitor.sessionId}`,
                  timestamp: new Date(),
                  fromAgent: true,
                  fromAI: true,
                };

                await db.collection("messages").insertOne(aiMsg);

                await db.collection("conversations").updateOne(
                  { sessionId: visitor.sessionId },
                  { $set: { lastMessage: aiReply, lastMessageAt: new Date() } }
                );

                const aiPayload = {
                  type: "message",
                  id: aiMsg._id?.toString(),
                  sender: aiMsg.sender,
                  senderId: aiMsg.senderId,
                  content: aiMsg.content,
                  room: aiMsg.room,
                  timestamp: aiMsg.timestamp.getTime(),
                  fromAgent: true,
                  fromAI: true,
                };

                // Send to visitor
                ws.send(JSON.stringify(aiPayload));

                // Send to agents viewing
                for (const [agentWs, agentClient] of agentClients) {
                  if (agentWs.readyState === 1 && agentClient.viewingConversation === visitor.sessionId) {
                    agentWs.send(JSON.stringify(aiPayload));
                  }
                }

                await broadcastConversations();
              }
            } catch (aiErr) {
              console.error("[AI] Auto-reply error:", aiErr.message);
            }
          }

          break;
        }

        case "set_name": {
          const newName = data.name?.trim();
          // Reject generic placeholder names — keep unique guest ID
          const genericNames = ["visitor", "website visitor", "guest", "anonymous", "user"];
          if (newName && !genericNames.includes(newName.toLowerCase())) {
            visitor.name = newName;
            await db.collection("conversations").updateOne(
              { sessionId: visitor.sessionId },
              { $set: { visitorName: visitor.name } }
            );
            await db.collection("visitors").updateOne(
              { sessionId: visitor.sessionId },
              { $set: { name: visitor.name } }
            );
            await broadcastConversations();
          }
          break;
        }

        // Visitor shares contact info (email/phone/name in one call)
        case "set_contact": {
          const updates = {};
          const visitorUpdates = {};

          // Derive name from email if no explicit name given
          let derivedName = null;
          if (data.name?.trim()) {
            derivedName = data.name.trim();
          } else if (data.email?.trim()) {
            // Extract name from email: "roshan.kaushish@gmail.com" → "Roshan Kaushish"
            const emailLocal = data.email.trim().split("@")[0];
            derivedName = emailLocal
              .replace(/[._-]/g, " ")
              .replace(/\d+/g, "")
              .trim()
              .split(" ")
              .filter(Boolean)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");
            if (!derivedName) derivedName = data.email.trim().split("@")[0];
          }

          if (derivedName) {
            visitor.name = derivedName;
            updates.visitorName = visitor.name;
            visitorUpdates.name = visitor.name;
          }
          if (data.email?.trim()) {
            visitorUpdates.email = data.email.trim();
          }
          if (data.phone?.trim()) {
            visitorUpdates.phone = data.phone.trim();
          }

          if (Object.keys(visitorUpdates).length > 0) {
            await db.collection("visitors").updateOne(
              { sessionId: visitor.sessionId },
              { $set: visitorUpdates },
              { upsert: true }
            );
          }
          if (derivedName) {
            await db.collection("conversations").updateOne(
              { sessionId: visitor.sessionId },
              { $set: { visitorName: derivedName } }
            );
          }

          // Confirm back to visitor
          ws.send(JSON.stringify({
            type: "contact_saved",
            name: visitor.name,
            email: visitorUpdates.email || null,
            phone: visitorUpdates.phone || null,
          }));

          // Notify agents viewing this conversation
          for (const [agentWs, agentClient] of agentClients) {
            if (agentWs.readyState === 1 && agentClient.viewingConversation === visitor.sessionId) {
              const visitorInfo = await db.collection("visitors").findOne({ sessionId: visitor.sessionId });
              agentWs.send(JSON.stringify({ type: "visitor_info", visitor: visitorInfo }));
            }
          }

          await broadcastConversations();
          break;
        }

        // Visitor sends metadata (collected by JS SDK)
        case "set_metadata": {
          const allowed = [
            "email", "phone", "city", "country", "timezone",
            "currentPage", "referrer", "screenResolution", "customData"
          ];
          const updates = {};
          for (const key of allowed) {
            if (data[key] !== undefined) updates[key] = data[key];
          }
          if (Object.keys(updates).length > 0) {
            await db.collection("visitors").updateOne(
              { sessionId: visitor.sessionId },
              { $set: updates },
              { upsert: true }
            );
            // Notify agents viewing this conversation
            for (const [agentWs, agentClient] of agentClients) {
              if (agentWs.readyState === 1 && agentClient.viewingConversation === visitor.sessionId) {
                const visitorInfo = await db.collection("visitors").findOne({ sessionId: visitor.sessionId });
                agentWs.send(JSON.stringify({ type: "visitor_info", visitor: visitorInfo }));
              }
            }
          }
          break;
        }

        // Track page views
        case "page_view": {
          if (data.url) {
            await db.collection("visitors").updateOne(
              { sessionId: visitor.sessionId },
              {
                $push: {
                  pageViews: {
                    $each: [{ url: data.url, title: data.title || "", at: new Date() }],
                    $slice: -20,
                  },
                },
                $set: { currentPage: data.url },
              }
            );
          }
          break;
        }

        case "typing": {
          // Only forward typing: false (stop) to agents.
          // typing: true is replaced by typing_preview (live content).
          if (!data.isTyping) {
            for (const [agentWs, agentClient] of agentClients) {
              if (agentWs.readyState === 1 && agentClient.viewingConversation === visitor.sessionId) {
                agentWs.send(JSON.stringify({
                  type: "typing",
                  sender: visitor.name,
                  isTyping: false,
                }));
              }
            }
          }
          break;
        }

        // Live typing content preview (debounced server-side)
        // Shows actual text being typed. Stays visible until content is empty string.
        case "typing_content": {
          const content = data.content ?? "";
          const sid = visitor.sessionId;
          const DEBOUNCE_MS = 300;

          const existing = typingPreviewDebounce.get(sid);
          if (existing) {
            clearTimeout(existing.timeout);
          }

          // If content is empty, send immediately (no debounce on clear)
          if (content === "") {
            for (const [agentWs, agentClient] of agentClients) {
              if (agentWs.readyState === 1 && agentClient.viewingConversation === sid) {
                agentWs.send(JSON.stringify({
                  type: "typing_preview",
                  sessionId: sid,
                  content: "",
                  sender: visitor.name,
                }));
              }
            }
            typingPreviewDebounce.delete(sid);
          } else {
            // Debounce non-empty content
            const timeout = setTimeout(() => {
              for (const [agentWs, agentClient] of agentClients) {
                if (agentWs.readyState === 1 && agentClient.viewingConversation === sid) {
                  agentWs.send(JSON.stringify({
                    type: "typing_preview",
                    sessionId: sid,
                    content: content,
                    sender: visitor.name,
                  }));
                }
              }
              typingPreviewDebounce.delete(sid);
            }, DEBOUNCE_MS);

            typingPreviewDebounce.set(sid, { timeout, lastContent: content });
          }
          break;
        }
      }
    } catch (e) {
      console.error("Widget error:", e);
    }
  });

  ws.on("close", async () => {
    const visitor = visitorClients.get(ws);
    if (visitor) {
      const db = getDB();
      await db.collection("visitors").updateOne(
        { sessionId: visitor.sessionId },
        { $set: { lastSeenAt: new Date(), online: false } }
      );
      // Clean up live typing debounce
      const debounceEntry = typingPreviewDebounce.get(visitor.sessionId);
      if (debounceEntry) {
        clearTimeout(debounceEntry.timeout);
        typingPreviewDebounce.delete(visitor.sessionId);
      }
    }
    visitorClients.delete(ws);
    await broadcastStats();
  });
});

// ---- Magic Browse WebSocket (session replay) ----
// In-memory store: Map<sessionId, { meta, events[], trackerWs, dashboards: Set<ws> }>
const magicSessions = new Map();
const magicDashboards = new Set();

function getMagicSession(sessionId) {
  if (!magicSessions.has(sessionId)) {
    magicSessions.set(sessionId, { meta: {}, events: [], trackerWs: null, dashboards: new Set() });
  }
  return magicSessions.get(sessionId);
}

function broadcastMagicSessionList() {
  const list = [...magicSessions.entries()]
    .filter(([, s]) => s.trackerWs !== null)
    .map(([id, s]) => ({
      sessionId: id,
      meta: s.meta,
      eventCount: s.events.length,
    }));
  const msg = JSON.stringify({ type: "session_list", sessions: list });
  for (const dash of magicDashboards) {
    if (dash.readyState === 1) dash.send(msg);
  }
}

magicWss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const role = url.searchParams.get("role") || "tracker";
  const sessionId = url.searchParams.get("sessionId");

  if (role === "tracker") {
    if (!sessionId) { ws.close(); return; }

    const session = getMagicSession(sessionId);
    session.trackerWs = ws;
    console.log(`[magic-tracker] connected session=${sessionId}`);

    ws.on("message", (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      switch (msg.type) {
        case "session_start":
          session.meta = msg.meta || {};
          session.meta.startTs = Date.now();
          broadcastMagicSessionList();
          for (const dash of session.dashboards) {
            if (dash.readyState === 1) dash.send(JSON.stringify({ type: "session_started", sessionId, meta: session.meta }));
          }
          break;

        case "rrweb_batch":
          if (!Array.isArray(msg.events)) return;
          // Keep only last 2000 events to prevent memory bloat
          for (const ev of msg.events) {
            session.events.push(ev);
          }
          if (session.events.length > 2000) {
            // Keep from last full snapshot onward
            let snapIdx = -1;
            for (let i = session.events.length - 1; i >= 0; i--) {
              if (session.events[i].type === 2) { snapIdx = i; break; }
            }
            if (snapIdx > 0) {
              session.events = session.events.slice(snapIdx);
            } else {
              session.events = session.events.slice(-1500);
            }
          }
          // Forward live to watching dashboards
          const batchMsg = JSON.stringify({ type: "rrweb_batch", sessionId, events: msg.events });
          for (const dash of session.dashboards) {
            if (dash.readyState === 1) dash.send(batchMsg);
          }
          break;

        case "url_change":
          if (session.meta) session.meta.url = msg.url;
          const urlMsg = JSON.stringify({ type: "url_change", sessionId, url: msg.url });
          for (const dash of session.dashboards) {
            if (dash.readyState === 1) dash.send(urlMsg);
          }
          broadcastMagicSessionList();
          break;
      }
    });

    ws.on("close", () => {
      console.log(`[magic-tracker] disconnected session=${sessionId}`);
      if (magicSessions.has(sessionId)) {
        const s = magicSessions.get(sessionId);
        s.trackerWs = null;
        const endMsg = JSON.stringify({ type: "session_ended", sessionId });
        for (const dash of s.dashboards) {
          if (dash.readyState === 1) dash.send(endMsg);
        }
        // Clean up session after 5 minutes of disconnect
        setTimeout(() => {
          const sess = magicSessions.get(sessionId);
          if (sess && sess.trackerWs === null) {
            magicSessions.delete(sessionId);
            broadcastMagicSessionList();
          }
        }, 5 * 60 * 1000);
      }
      broadcastMagicSessionList();
    });

  } else if (role === "dashboard") {
    magicDashboards.add(ws);
    console.log(`[magic-dashboard] connected. total=${magicDashboards.size}`);

    // Send current session list
    const list = [...magicSessions.entries()]
      .filter(([, s]) => s.trackerWs !== null)
      .map(([id, s]) => ({
        sessionId: id,
        meta: s.meta,
        eventCount: s.events.length,
      }));
    ws.send(JSON.stringify({ type: "session_list", sessions: list }));

    ws.on("message", (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      if (msg.type === "watch" && msg.sessionId) {
        const s = magicSessions.get(msg.sessionId);
        if (!s) {
          ws.send(JSON.stringify({ type: "error", message: "session not found" }));
          return;
        }
        s.dashboards.add(ws);

        // Ask the tracker to take a fresh full snapshot immediately
        if (s.trackerWs && s.trackerWs.readyState === 1) {
          s.trackerWs.send(JSON.stringify({ type: "take_snapshot" }));
        }

        // Send only recent events starting from last full snapshot
        let replayEvents = s.events;
        let lastSnapshotIdx = -1;
        for (let i = replayEvents.length - 1; i >= 0; i--) {
          if (replayEvents[i].type === 2) { lastSnapshotIdx = i; break; }
        }
        if (lastSnapshotIdx > 0) {
          replayEvents = replayEvents.slice(lastSnapshotIdx);
        }
        if (replayEvents.length > 1000) {
          replayEvents = replayEvents.slice(-1000);
        }
        if (replayEvents.length) {
          ws.send(JSON.stringify({ type: "replay_events", sessionId: msg.sessionId, events: replayEvents }));
        }
        ws.send(JSON.stringify({ type: "watch_ack", sessionId: msg.sessionId, meta: s.meta }));
      }

      if (msg.type === "unwatch" && msg.sessionId) {
        const s = magicSessions.get(msg.sessionId);
        if (s) s.dashboards.delete(ws);
      }
    });

    ws.on("close", () => {
      magicDashboards.delete(ws);
      for (const s of magicSessions.values()) s.dashboards.delete(ws);
      console.log(`[magic-dashboard] disconnected. total=${magicDashboards.size}`);
    });
  }
});

// Start
async function start() {
  await connectDB();

  const db = getDB();
  await db.collection("visitors").createIndex({ sessionId: 1 }, { unique: true });

  // Initialize settings
  await db.collection("settings").updateOne(
    { key: "ai_mode" },
    { $setOnInsert: { key: "ai_mode", enabled: false, updatedAt: new Date() } },
    { upsert: true }
  );
  await db.collection("settings").updateOne(
    { key: "ai_fallback" },
    { $setOnInsert: { key: "ai_fallback", enabled: false, minutes: 5, updatedAt: new Date() } },
    { upsert: true }
  );

  // Start fallback timer check
  setInterval(checkFallbackReplies, 30000); // every 30 seconds

  console.log(`AI configured: ${isAIConfigured()}`);

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Dashboard WS: ws://0.0.0.0:${PORT}/`);
    console.log(`Widget WS:    ws://0.0.0.0:${PORT}/widget?sessionId=xxx`);
  });
}

// Fallback timer: check for unanswered visitor messages
async function checkFallbackReplies() {
  try {
    const db = getDB();
    const fallbackSetting = await db.collection("settings").findOne({ key: "ai_fallback" });
    if (!fallbackSetting?.enabled || !isAIConfigured()) return;

    const minutes = fallbackSetting.minutes || 5;
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);

    // Find open conversations where last message is from visitor and older than cutoff
    const conversations = await db.collection("conversations")
      .find({ status: "open" })
      .toArray();

    for (const conv of conversations) {
      // Get the last message in this conversation
      const lastMsg = await db.collection("messages")
        .findOne({ room: `visitor_${conv.sessionId}` }, { sort: { timestamp: -1 } });

      if (!lastMsg) continue;
      // Only trigger if last message is from visitor and older than fallback time
      if (!lastMsg.fromVisitor) continue;
      if (lastMsg.timestamp > cutoff) continue;

      // Check if we already sent a fallback reply after this message
      const replyAfter = await db.collection("messages").findOne({
        room: `visitor_${conv.sessionId}`,
        timestamp: { $gt: lastMsg.timestamp },
        fromAgent: true,
      });
      if (replyAfter) continue; // Already replied

      // Generate AI fallback reply
      const recentMessages = await db.collection("messages")
        .find({ room: `visitor_${conv.sessionId}` })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      const visitorInfo = await db.collection("visitors").findOne({ sessionId: conv.sessionId });
      const aiReply = await generateAIReply(recentMessages.reverse(), visitorInfo || {});

      if (!aiReply) continue;

      const aiMsg = {
        sender: "AI Assistant",
        senderId: "ai_agent",
        content: aiReply,
        room: `visitor_${conv.sessionId}`,
        timestamp: new Date(),
        fromAgent: true,
        fromAI: true,
        fallbackReply: true,
      };

      await db.collection("messages").insertOne(aiMsg);
      await db.collection("conversations").updateOne(
        { sessionId: conv.sessionId },
        { $set: { lastMessage: aiReply, lastMessageAt: new Date() } }
      );

      const aiPayload = {
        type: "message",
        id: aiMsg._id?.toString(),
        sender: aiMsg.sender,
        senderId: aiMsg.senderId,
        content: aiMsg.content,
        room: aiMsg.room,
        timestamp: aiMsg.timestamp.getTime(),
        fromAgent: true,
        fromAI: true,
      };

      // Send to visitor if connected
      sendToVisitor(conv.sessionId, aiPayload);

      // Send to agents viewing this conversation
      for (const [agentWs, agentClient] of agentClients) {
        if (agentWs.readyState === 1 && agentClient.viewingConversation === conv.sessionId) {
          agentWs.send(JSON.stringify(aiPayload));
        }
      }

      await broadcastConversations();
      console.log(`[AI Fallback] Replied to ${conv.visitorName} (waited ${minutes}min)`);
    }
  } catch (err) {
    console.error("[AI Fallback] Error:", err.message);
  }
}

start().catch(console.error);

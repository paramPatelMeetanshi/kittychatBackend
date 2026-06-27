import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDB } from "./db.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let model = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== "your-gemini-api-key-here") {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

const DEFAULT_DISCORD_PROMPT = `You are a strict message priority classifier for a customer support chat tool called KittyChat.

Your job: Determine if a visitor's message is HIGH PRIORITY and needs immediate team attention.

Classify as "high" ONLY if the message clearly contains:
- Bug reports or application errors (crashes, broken features, error codes)
- Payment/billing issues (failed transactions, wrong charges, refund requests)
- Account access problems (can't login, locked out, security concerns)
- Data loss or corruption reports
- Service outage reports (site down, feature not working for everyone)
- Urgent deadline-sensitive requests (launch blockers, production issues)
- Security vulnerabilities or breach reports

Classify as "normal" if the message is:
- General questions about features or pricing
- How-to questions or product inquiries
- Feedback or feature requests (non-urgent)
- Greetings, casual chat, or small talk
- General complaints without technical urgency
- Scheduling or availability questions

When in doubt, classify as "normal". Only flag truly urgent issues.

Message: "{MESSAGE}"

Reply with ONLY one word: "high" or "normal". Nothing else.`;

/**
 * Get Discord settings from DB
 */
export async function getDiscordSettings() {
  const db = getDB();
  const setting = await db.collection("settings").findOne({ key: "discord_webhook" });
  return {
    enabled: setting?.enabled ?? true,
    webhookUrl: setting?.webhookUrl || process.env.DISCORD_WEBHOOK_URL || "",
    prompt: setting?.prompt || DEFAULT_DISCORD_PROMPT,
  };
}

/**
 * Classify message priority using Gemini
 */
export async function classifyPriority(message, customPrompt) {
  if (!model) return "normal";

  try {
    const prompt = (customPrompt || DEFAULT_DISCORD_PROMPT).replace("{MESSAGE}", message);
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toLowerCase();
    return response === "high" ? "high" : "normal";
  } catch (error) {
    console.error("[Discord] Priority classification error:", error.message);
    return "normal";
  }
}

/**
 * Send high-priority alert to Discord
 */
export async function sendDiscordAlert(visitorName, message, sessionId, metadata = {}) {
  const settings = await getDiscordSettings();
  if (!settings.enabled || !settings.webhookUrl) return false;

  try {
    const priority = await classifyPriority(message, settings.prompt);
    if (priority !== "high") return false;

    const fields = [];
    if (metadata.email) fields.push({ name: "📧 Email", value: metadata.email, inline: true });
    if (metadata.currentPage) fields.push({ name: "🌐 Page", value: metadata.currentPage, inline: true });
    if (metadata.country) fields.push({ name: "📍 Location", value: metadata.country, inline: true });

    const payload = {
      username: "KittyChat Alert",
      embeds: [{
        title: "🚨 High Priority Message",
        description: message.length > 1000 ? message.slice(0, 1000) + "..." : message,
        color: 0xff4444,
        author: { name: visitorName || "Website Visitor" },
        fields,
        footer: { text: `Session: ${sessionId?.slice(0, 8) || "unknown"}` },
        timestamp: new Date().toISOString(),
      }],
    };

    const res = await fetch(settings.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[Discord] Webhook failed:", res.status, await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Discord] Error sending alert:", error.message);
    return false;
  }
}

export function isDiscordClassifierReady() {
  return model !== null;
}

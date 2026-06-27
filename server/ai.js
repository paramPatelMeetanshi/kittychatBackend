import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { getDB } from "./db.js";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const DEFAULT_SYSTEM_PROMPT = `You are a helpful customer support agent. Be concise, friendly, and helpful. Answer questions about the product/service. If you don't know something, say so politely and offer to connect them with a human agent.`;

const DEFAULT_PERSONALITY = `Tone: Professional yet friendly. Keep replies to 1-3 sentences. Don't use emojis excessively. Address the visitor by name if known.`;

let model = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== "your-gemini-api-key-here") {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

/**
 * Get AI prompt config from DB (with defaults)
 */
async function getAIConfig() {
  const db = getDB();
  const config = await db.collection("settings").findOne({ key: "ai_prompts" });
  return {
    systemInstruction: config?.systemInstruction || DEFAULT_SYSTEM_PROMPT,
    personality: config?.personality || DEFAULT_PERSONALITY,
  };
}

/**
 * Generate an AI reply based on full conversation history
 * @param {Array} messages - All messages [{sender, content, fromVisitor, fromAgent, fromAI}]
 * @param {object} visitorInfo - Visitor metadata {name, email, etc.}
 * @returns {string|null} - AI reply or null if AI not configured
 */
export async function generateAIReply(messages, visitorInfo = {}) {
  if (!model) {
    return null;
  }

  try {
    const { systemInstruction, personality } = await getAIConfig();

    // Build visitor context
    const visitorParts = [];
    if (visitorInfo.name) visitorParts.push(`Name: ${visitorInfo.name}`);
    if (visitorInfo.email) visitorParts.push(`Email: ${visitorInfo.email}`);
    if (visitorInfo.phone) visitorParts.push(`Phone: ${visitorInfo.phone}`);
    if (visitorInfo.city || visitorInfo.country) {
      visitorParts.push(`Location: ${[visitorInfo.city, visitorInfo.country].filter(Boolean).join(", ")}`);
    }
    if (visitorInfo.currentPage) visitorParts.push(`Current page: ${visitorInfo.currentPage}`);

    const visitorContext = visitorParts.length > 0
      ? `\n\nVisitor Information:\n${visitorParts.join("\n")}`
      : "";

    // Build full chat context
    const chatHistory = messages
      .map((m) => {
        let role = "Visitor";
        if (m.fromAI) role = "AI Assistant";
        else if (m.fromAgent) role = "Human Agent";
        return `[${role}]: ${m.content}`;
      })
      .join("\n");

    const prompt = `${systemInstruction}

${personality}
${visitorContext}

--- Full Chat History ---
${chatHistory}
--- End of Chat ---

Based on the full conversation above, write your next reply as the support agent. Be contextual and don't repeat what was already said. Keep it natural and helpful.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return response.trim();
  } catch (error) {
    console.error("[AI] Error generating reply:", error.message);
    return null;
  }
}

export function isAIConfigured() {
  return model !== null;
}

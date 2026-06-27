import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { getDB } from "./db.js";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const DEFAULT_SYSTEM_PROMPT = `You are a helpful customer support agent. Be concise, friendly, and helpful. Answer questions about the product/service. If you don't know something, say so politely and offer to connect them with a human agent.`;

const DEFAULT_PERSONALITY = `Tone: Professional yet friendly. Keep replies to 1-3 sentences. Don't use emojis excessively. Address the visitor by name if known.`;

// --- Gemini setup ---
let geminiModel = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== "your-gemini-api-key-here") {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

// --- Groq setup ---
let groqClient = null;
if (GROQ_API_KEY && GROQ_API_KEY !== "your-groq-api-key-here") {
  groqClient = new Groq({ apiKey: GROQ_API_KEY });
}

const GROQ_MODEL = "llama-3.1-8b-instant";

/**
 * Get AI provider config from DB
 */
async function getAIProvider() {
  const db = getDB();
  const setting = await db.collection("settings").findOne({ key: "ai_provider" });
  // Default: use gemini if available, else groq
  return setting?.provider || "auto";
}

/**
 * Resolve which provider to actually use
 */
function resolveProvider(preferred) {
  if (preferred === "gemini" && geminiModel) return "gemini";
  if (preferred === "groq" && groqClient) return "groq";
  if (preferred === "auto") {
    if (geminiModel) return "gemini";
    if (groqClient) return "groq";
  }
  // Fallback
  if (geminiModel) return "gemini";
  if (groqClient) return "groq";
  return null;
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
 * Call Gemini with a prompt
 */
async function callGemini(prompt) {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Call Groq with a system + user prompt
 */
async function callGroq(systemPrompt, userPrompt) {
  const completion = await groqClient.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content?.trim() || "";
}

/**
 * Generate an AI reply based on full conversation history
 */
export async function generateAIReply(messages, visitorInfo = {}) {
  const preferred = await getAIProvider();
  const provider = resolveProvider(preferred);

  if (!provider) return null;

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

    if (provider === "gemini") {
      const prompt = `${systemInstruction}\n\n${personality}${visitorContext}\n\n--- Full Chat History ---\n${chatHistory}\n--- End of Chat ---\n\nBased on the full conversation above, write your next reply as the support agent. Be contextual and don't repeat what was already said. Keep it natural and helpful.`;
      return await callGemini(prompt);
    } else {
      const systemMsg = `${systemInstruction}\n\n${personality}${visitorContext}`;
      const userMsg = `--- Full Chat History ---\n${chatHistory}\n--- End of Chat ---\n\nBased on the full conversation above, write your next reply as the support agent. Be contextual and don't repeat what was already said. Keep it natural and helpful.`;
      return await callGroq(systemMsg, userMsg);
    }
  } catch (error) {
    console.error(`[AI:${provider}] Error generating reply:`, error.message);
    return null;
  }
}

/**
 * Translate a message
 */
export async function translateMessage(text, targetLang = "english") {
  const preferred = await getAIProvider();
  const provider = resolveProvider(preferred);

  if (!provider) throw new Error("No AI provider configured");

  const isToEnglish = ["english", "en", "auto"].includes(targetLang.toLowerCase());

  let prompt;
  if (isToEnglish) {
    prompt = `You are a translation assistant. Detect the language of the following message, translate it to English, and briefly explain its meaning if idioms or cultural context is relevant.\n\nMessage: "${text}"\n\nRespond in this exact JSON format only, no markdown:\n{"detectedLanguage": "language name", "translatedText": "english translation", "meaning": "brief explanation if needed, or empty string"}`;
  } else {
    prompt = `You are a translation assistant. Translate the following English message to ${targetLang}. Keep the tone conversational and natural.\n\nMessage: "${text}"\n\nRespond in this exact JSON format only, no markdown:\n{"translatedText": "translated text in ${targetLang}", "targetLanguage": "${targetLang}"}`;
  }

  try {
    let responseText;
    if (provider === "gemini") {
      responseText = await callGemini(prompt);
    } else {
      responseText = await callGroq("You are a translation assistant. Always respond in valid JSON only.", prompt);
    }

    const jsonStr = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);
    return {
      translatedText: parsed.translatedText || text,
      detectedLanguage: parsed.detectedLanguage || null,
      targetLanguage: parsed.targetLanguage || (isToEnglish ? "English" : targetLang),
      meaning: parsed.meaning || "",
    };
  } catch (error) {
    console.error(`[AI:${provider}] Translation error:`, error.message);
    throw new Error("Translation failed: " + error.message);
  }
}

export function isAIConfigured() {
  return geminiModel !== null || groqClient !== null;
}

/**
 * Get available providers and which is active
 */
export function getAIProviderStatus() {
  return {
    geminiAvailable: geminiModel !== null,
    groqAvailable: groqClient !== null,
  };
}

/**
 * Generic AI call — used by all features (discord, translation, replies).
 * Respects the user-selected provider from DB.
 * @param {string} prompt - The full prompt text
 * @param {string} [systemPrompt] - Optional system prompt (used for Groq)
 * @returns {string} - AI response text
 */
export async function callAI(prompt, systemPrompt) {
  const preferred = await getAIProvider();
  const provider = resolveProvider(preferred);

  if (!provider) throw new Error("No AI provider configured");

  if (provider === "gemini") {
    return await callGemini(prompt);
  } else {
    return await callGroq(systemPrompt || "You are a helpful assistant.", prompt);
  }
}

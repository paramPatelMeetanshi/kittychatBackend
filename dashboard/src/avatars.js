// Cat avatar system
// Visitors get cat1-cat6 (assigned by server, stored in DB)
// Agents select their avatar at login (cat1-cat6)
// AI always uses aicat

export const CAT_AVATARS = [
  "/images/cat1.png",
  "/images/cat2.png",
  "/images/cat3.png",
  "/images/cat4.png",
  "/images/cat5.png",
  "/images/cat6.png",
];

export const AI_AVATAR = "/images/aicat.png";
export const LOGO = "/images/kitty_logo.png";

/**
 * Get avatar URL by role — fallback when no specific avatar is assigned
 */
export function getAvatarByRole(role) {
  if (role === "ai") return AI_AVATAR;
  if (role === "profile" || role === "agent") return CAT_AVATARS[0];
  if (role === "visitor") return CAT_AVATARS[2];
  return CAT_AVATARS[0];
}

/**
 * Get avatar for a specific visitor/agent from their stored avatar field
 * @param {string} avatar - stored avatar identifier like "cat1", "cat2", etc.
 */
export function getAvatarUrl(avatar) {
  if (!avatar) return CAT_AVATARS[0];
  if (avatar === "aicat") return AI_AVATAR;
  // Handle "cat1" through "cat6"
  const match = avatar.match(/^cat(\d)$/);
  if (match) {
    const idx = parseInt(match[1]) - 1;
    if (idx >= 0 && idx < CAT_AVATARS.length) return CAT_AVATARS[idx];
  }
  // Handle full paths
  if (avatar.startsWith("/images/")) return avatar;
  return `/images/${avatar}.png`;
}

/**
 * Get avatar for a message based on sender info
 */
export function getMessageAvatar(msg, currentUser) {
  if (msg.fromAI) return AI_AVATAR;
  if (msg.fromAgent) {
    // Use agent's stored avatar or current user's avatar
    return msg.senderAvatar ? getAvatarUrl(msg.senderAvatar) : getAvatarUrl(currentUser?.avatar);
  }
  // Visitor — use their assigned avatar
  return msg.senderAvatar ? getAvatarUrl(msg.senderAvatar) : CAT_AVATARS[2];
}

/**
 * Deterministic avatar from a session/name string (fallback)
 */
export function getAvatarFromSeed(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CAT_AVATARS[Math.abs(hash) % CAT_AVATARS.length];
}

export default { CAT_AVATARS, AI_AVATAR, LOGO, getAvatarByRole, getAvatarUrl, getMessageAvatar, getAvatarFromSeed };

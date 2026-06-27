// Avatar images from /images folder — each assigned to a distinct role
// Frame 1 = Visitors (customers chatting in)
// Frame 2 = Human agents (dashboard operators)
// Frame 3 = AI Assistant
// Frame 4 = Sidebar / logged-in user profile

const avatars = {
  visitor: "/images/Frame 1.png",
  agent: "/images/Frame 2.png",
  ai: "/images/Frame 3.png",
  profile: "/images/Frame 4.png",
};

/**
 * Get avatar by role
 * @param {"visitor"|"agent"|"ai"|"profile"} role
 */
export function getAvatarByRole(role) {
  return avatars[role] || avatars.visitor;
}

/**
 * Get avatar for a message based on its sender type
 */
export function getMessageAvatar(msg, currentUsername) {
  if (msg.fromAI) return avatars.ai;
  if (msg.fromAgent || msg.sender === currentUsername) return avatars.agent;
  return avatars.visitor;
}

/**
 * Legacy: deterministic avatar from seed (for conversation list variety)
 */
export function getAvatar(seed = "") {
  const pool = [avatars.visitor, avatars.agent, avatars.ai, avatars.profile];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return pool[Math.abs(hash) % pool.length];
}

export default avatars;

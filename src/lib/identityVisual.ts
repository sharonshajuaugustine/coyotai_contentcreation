// Deterministic per-name color + emoji avatar, derived from a hash of the
// name — no picker UI, no schema change, but still gives each submitter a
// consistent visual identity across the whole team's screens.

const COLORS = ["#c9f0ff", "#eafffd", "#d5cad6", "#f7d9e3", "#e3f0c4", "#f0dcc4"];
const AVATARS = ["🦊", "🌙", "🌸", "☁️", "✨", "🍁", "🐚", "🌊", "🍄", "🪷"];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function colorForName(name: string): string {
  if (!name) return COLORS[0];
  return COLORS[hash(name) % COLORS.length];
}

export function avatarForName(name: string): string {
  if (!name) return "👤";
  return AVATARS[hash(name) % AVATARS.length];
}

// Extended pastel swatches, all still within the kitsune watercolor theme
// (soft blues/lavenders/pinks/mints) - used to give bento tiles visual
// variety instead of every card being the same flat glass tint.
export const SWATCHES = {
  "pale-sky": { bg: "#c9f0ff", label: "Sky" },
  "azure-mist": { bg: "#eafffd", label: "Mist" },
  thistle: { bg: "#d5cad6", label: "Thistle" },
  blush: { bg: "#f7d9e3", label: "Blush" },
  mint: { bg: "#dcf2e3", label: "Mint" },
  butter: { bg: "#f7ecc4", label: "Butter" },
  lavender: { bg: "#e2dcf7", label: "Lavender" },
  peach: { bg: "#f7e0cf", label: "Peach" },
} as const;

export type SwatchKey = keyof typeof SWATCHES;
export const SWATCH_KEYS = Object.keys(SWATCHES) as SwatchKey[];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Deterministic fallback tint when an idea has no series (so the grid still
// reads as varied, not flat), derived from the idea's format so same-format
// ideas share a family color.
export function swatchForFormat(format: string | null): SwatchKey {
  if (!format) return "azure-mist";
  const keys = SWATCH_KEYS;
  return keys[hash(format) % keys.length];
}

export function swatchColor(key: string | null | undefined): string {
  return SWATCHES[(key as SwatchKey) ?? "azure-mist"]?.bg ?? SWATCHES["azure-mist"].bg;
}

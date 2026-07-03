import type { Idea } from "./types";

// Deterministic bento-tile weight — no AI call, computed at read time.
// Bigger idea (more content, more discussion, better performance) = bigger tile.
export function computeWeight(idea: Idea): number {
  let w = 1;
  w += Math.min(idea.description.length / 120, 3); // richer description
  w += Math.min(idea.images.length * 0.5, 1.5); // visual reference
  w += Math.min((idea.comments?.length ?? 0) * 0.4, 2); // discussion
  const perf = idea.performance_logs ?? [];
  if (perf.length) {
    const bestViews = Math.max(...perf.map((p) => p.views ?? 0));
    w += Math.min(bestViews / 5000, 3); // strong performers grow
  }
  return Math.round(w * 10) / 10;
}

// Breaks down the score above so the UI can explain "why is this tile this
// size" (K10) without re-deriving the logic.
export function weightBreakdown(idea: Idea) {
  const perf = idea.performance_logs ?? [];
  const bestViews = perf.length ? Math.max(...perf.map((p) => p.views ?? 0)) : 0;
  return {
    base: 1,
    description: Math.round(Math.min(idea.description.length / 120, 3) * 10) / 10,
    images: Math.round(Math.min(idea.images.length * 0.5, 1.5) * 10) / 10,
    comments: Math.round(Math.min((idea.comments?.length ?? 0) * 0.4, 2) * 10) / 10,
    performance: Math.round(Math.min(bestViews / 5000, 3) * 10) / 10,
  };
}

// Maps a weight score to a grid span so tiles pack into a dense treemap-like
// bento grid instead of leaving gaps. Bigger score -> more columns/rows.
// A manual size_override (B4) short-circuits the computed weight entirely,
// for the rare case the algorithm gets it wrong.
export function spanForWeight(weight: number, override?: "small" | "large" | null): { col: number; row: number } {
  if (override === "large") return { col: 2, row: 2 };
  if (override === "small") return { col: 1, row: 1 };
  if (weight >= 6) return { col: 2, row: 2 };
  if (weight >= 4) return { col: 2, row: 1 };
  if (weight >= 2.5) return { col: 1, row: 2 };
  return { col: 1, row: 1 };
}

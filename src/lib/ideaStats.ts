import type { Idea } from "./types";
import { FORMATS } from "./types";

function bestLog(idea: Idea) {
  const logs = idea.performance_logs ?? [];
  if (!logs.length) return null;
  return logs.reduce((best, l) => ((l.views ?? 0) > (best.views ?? 0) ? l : best), logs[0]);
}

// Weighted single number so ideas can be sorted/ranked without eyeballing
// four separate metrics. Views matter most, saves signal real value.
export function engagementScore(idea: Idea): number {
  const log = bestLog(idea);
  if (!log) return 0;
  return (log.views ?? 0) * 1 + (log.likes ?? 0) * 3 + (log.saves ?? 0) * 5 + (log.comments_count ?? 0) * 4;
}

export function formatStats(ideas: Idea[]) {
  return FORMATS.map((f) => {
    const done = ideas.filter((i) => i.status === "done" && i.format === f.value);
    const scores = done.map(engagementScore);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { format: f.value, label: f.label, count: done.length, avgScore: Math.round(avg) };
  }).filter((s) => s.count > 0);
}

export function bestAndWorstFormat(ideas: Idea[]) {
  const stats = formatStats(ideas);
  if (stats.length < 2) return null;
  const sorted = [...stats].sort((a, b) => b.avgScore - a.avgScore);
  return { best: sorted[0], worst: sorted[sorted.length - 1] };
}

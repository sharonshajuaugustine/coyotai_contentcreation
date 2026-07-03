"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
import type { Idea } from "@/lib/types";
import { engagementScore, bestAndWorstFormat, formatStats } from "@/lib/ideaStats";

function bestViews(idea: Idea) {
  const logs = idea.performance_logs ?? [];
  return logs.length ? Math.max(...logs.map((l) => l.views ?? 0)) : 0;
}

function exportCsv(ideas: Idea[]) {
  const rows = [["idea_title", "logged_at", "views", "likes", "saves", "logged_by"]];
  for (const idea of ideas) {
    for (const p of idea.performance_logs ?? []) {
      rows.push([idea.title, p.logged_at, String(p.views ?? ""), String(p.likes ?? ""), String(p.saves ?? ""), p.logged_by]);
    }
  }
  const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "coyot-performance-logs.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Leaderboard({ ideas }: { ideas: Idea[] }) {
  const ranked = [...ideas]
    .filter((i) => i.status === "done")
    .sort((a, b) => engagementScore(b) - engagementScore(a));

  if (ranked.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-sm text-taupe/70">
        No posted ideas with performance logs yet — mark an idea "done" and log some numbers to see it here.
      </div>
    );
  }

  const chartData = ranked.slice(0, 8).map((i) => ({
    name: i.title.length > 18 ? i.title.slice(0, 18) + "…" : i.title,
    views: bestViews(i),
  }));

  const bw = bestAndWorstFormat(ideas);
  const stats = formatStats(ideas);

  return (
    <div className="space-y-3">
      {bw && (
        <div className="glass-card p-3 flex gap-4 text-xs text-taupe/80 flex-wrap">
          <span>🏆 Best format: <strong>{bw.best.label}</strong> (avg score {bw.best.avgScore})</span>
          <span>📉 Needs work: <strong>{bw.worst.label}</strong> (avg score {bw.worst.avgScore})</span>
        </div>
      )}

      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-taupe">Top performers (engagement score)</h2>
          <button
            onClick={() => exportCsv(ideas)}
            aria-label="Export performance logs as CSV"
            className="glass-pill text-xs px-2 py-1 flex items-center gap-1"
          >
            <Download size={12} aria-hidden="true" /> CSV
          </button>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "var(--taupe-ink)" }} />
              <Tooltip contentStyle={{ background: "var(--azure-mist)", border: "1px solid var(--thistle)", borderRadius: 12 }} />
              <Bar dataKey="views" fill="var(--pale-sky)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ol className="space-y-2">
          {ranked.map((idea, i) => {
            const percentile = Math.round(((ranked.length - i) / ranked.length) * 100);
            return (
              <li key={idea.id} className="flex items-center justify-between text-sm glass-pill px-3 py-2">
                <span className="text-taupe">
                  <span className="text-taupe/50 mr-2">#{i + 1}</span>
                  {idea.title}
                </span>
                <span className="text-taupe/70 text-xs">
                  score {engagementScore(idea).toLocaleString()} · top {percentile}%
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {stats.length > 0 && (
        <div className="glass-card p-4">
          <h2 className="text-sm font-semibold text-taupe mb-2">By format</h2>
          <ul className="space-y-1 text-xs text-taupe/80">
            {stats.map((s) => (
              <li key={s.format} className="flex justify-between glass-pill px-3 py-1.5">
                <span>{s.label} ({s.count})</span>
                <span>avg score {s.avgScore}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

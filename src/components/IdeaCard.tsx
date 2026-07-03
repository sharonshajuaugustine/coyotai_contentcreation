"use client";
import { MessageCircle, Archive, ArrowRight, Info, Clock } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { Idea } from "@/lib/types";
import { FORMATS } from "@/lib/types";
import { relativeTime } from "@/lib/relativeTime";
import { colorForName, avatarForName } from "@/lib/identityVisual";
import { weightBreakdown } from "@/lib/weight";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export default function IdeaCard({
  idea,
  weight,
  onOpen,
  onQuickArchive,
  onQuickAdvance,
}: {
  idea: Idea;
  weight: number;
  onOpen: () => void;
  onQuickArchive?: () => void;
  onQuickAdvance?: () => void;
}) {
  const big = weight >= 4;
  const formatLabel = FORMATS.find((f) => f.value === idea.format)?.label;
  const b = weightBreakdown(idea);
  const breakdownText = `Size breakdown: base ${b.base} + description ${b.description} + images ${b.images} + comments ${b.comments} + performance ${b.performance}`;

  const perf = idea.performance_logs ?? [];
  const sparkData = [...perf]
    .sort((a, c) => new Date(a.logged_at).getTime() - new Date(c.logged_at).getTime())
    .map((p) => ({ v: p.views ?? 0 }));
  const needsCheckIn =
    idea.status === "done" && perf.length === 0 && Date.now() - new Date(idea.updated_at).getTime() > THREE_DAYS_MS;

  return (
    <button
      onClick={onOpen}
      tabIndex={-1}
      aria-label={`Open idea: ${idea.title}, submitted by ${idea.submitted_by}`}
      className={`group glass-card status-border-${idea.status} h-full w-full min-h-[44px] text-left p-4 flex flex-col justify-between overflow-hidden relative`}
    >
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {needsCheckIn && (
          <span title="No performance logged in 3+ days" className="text-amber-600">
            <Clock size={12} aria-hidden="true" />
          </span>
        )}
        {idea.pinned && <span className="text-xs">📌</span>}
        <span title={breakdownText} className="text-taupe/40">
          <Info size={11} aria-hidden="true" />
        </span>
      </div>
      <div>
        {formatLabel && (
          <span className="glass-pill inline-block text-[11px] px-2 py-0.5 mb-2 text-taupe/80">
            {formatLabel}
          </span>
        )}
        <h3 className={`font-semibold text-taupe ${big ? "text-lg" : "text-sm"} line-clamp-2 pr-8`}>
          {idea.title}
        </h3>
        {big && (
          <p className="text-xs text-taupe/70 mt-1 line-clamp-3">{idea.description}</p>
        )}
      </div>
      {idea.images[0] && big && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={idea.images[0]}
          alt=""
          loading="lazy"
          className="rounded-xl mt-2 h-16 w-full object-cover"
        />
      )}
      {sparkData.length > 1 && (
        <div className="h-6 w-full mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="v" stroke="var(--pale-sky)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="flex items-center justify-between text-[11px] text-taupe/70 mt-2">
        <span
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
          style={{ background: colorForName(idea.submitted_by) }}
        >
          {avatarForName(idea.submitted_by)} {idea.submitted_by}
        </span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <MessageCircle size={12} aria-hidden="true" />
            {idea.comments?.length ?? 0}
          </span>
          <span>{relativeTime(idea.created_at)}</span>
        </span>
      </div>

      {(onQuickArchive || onQuickAdvance) && (
        <div className="absolute inset-x-0 bottom-0 hidden group-hover:flex justify-end gap-1 p-2 bg-gradient-to-t from-white/50 to-transparent">
          {onQuickAdvance && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Move to next status"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdvance();
              }}
              className="glass-pill p-1.5"
            >
              <ArrowRight size={12} aria-hidden="true" />
            </span>
          )}
          {onQuickArchive && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Archive idea"
              onClick={(e) => {
                e.stopPropagation();
                onQuickArchive();
              }}
              className="glass-pill p-1.5 text-red-500/80"
            >
              <Archive size={12} aria-hidden="true" />
            </span>
          )}
        </div>
      )}
    </button>
  );
}

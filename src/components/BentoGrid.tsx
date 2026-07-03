"use client";
import { useRef } from "react";
import { motion, LayoutGroup } from "framer-motion";
import type { Idea } from "@/lib/types";
import { computeWeight, spanForWeight } from "@/lib/weight";
import IdeaCard from "./IdeaCard";

export default function BentoGrid({
  ideas,
  onOpen,
  density = "comfortable",
  onQuickArchive,
  onQuickAdvance,
}: {
  ideas: Idea[];
  onOpen: (idea: Idea) => void;
  density?: "comfortable" | "compact";
  onQuickArchive?: (idea: Idea) => void;
  onQuickAdvance?: (idea: Idea) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  if (ideas.length === 0) {
    return (
      <div className="glass-card flex items-center justify-center h-40 text-taupe/60 text-sm">
        No ideas here yet — add one to fill this space.
      </div>
    );
  }

  function onGridKeyDown(e: React.KeyboardEvent) {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    const tiles = Array.from(gridRef.current?.querySelectorAll<HTMLElement>("[data-tile]") ?? []);
    const idx = tiles.indexOf(document.activeElement as HTMLElement);
    if (idx === -1) return;
    e.preventDefault();
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = tiles[Math.min(Math.max(idx + delta, 0), tiles.length - 1)];
    next?.focus();
  }

  return (
    <LayoutGroup>
      <div
        ref={gridRef}
        data-glass="subtle"
        onKeyDown={onGridKeyDown}
        role="grid"
        aria-label="Idea tiles"
        className={`grid gap-3 ${density === "compact" ? "auto-rows-[80px]" : "auto-rows-[110px]"}`}
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
      >
        {ideas.map((idea) => {
          const weight = computeWeight(idea);
          const span = spanForWeight(weight, idea.size_override);
          return (
            <motion.div
              layout
              layoutId={idea.id}
              key={idea.id}
              data-tile
              tabIndex={0}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{
                gridColumn: `span ${span.col}`,
                gridRow: `span ${span.row}`,
              }}
              className="tile-breathe bento-tile-min rounded-[22px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pale-sky)]"
              onKeyDown={(e) => e.key === "Enter" && onOpen(idea)}
            >
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <IdeaCard
                  idea={idea}
                  weight={weight}
                  onOpen={() => onOpen(idea)}
                  onQuickArchive={onQuickArchive ? () => onQuickArchive(idea) : undefined}
                  onQuickAdvance={onQuickAdvance ? () => onQuickAdvance(idea) : undefined}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

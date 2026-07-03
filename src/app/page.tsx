"use client";
import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Trophy,
  Archive as ArchiveIcon,
  Plus,
  LayoutGrid,
  Rows3,
  Newspaper,
  Contrast,
  Copy,
  SlidersHorizontal,
  MoreVertical,
  X,
} from "lucide-react";
import type { Idea, IdeaStatus } from "@/lib/types";
import { FORMATS } from "@/lib/types";
import BentoGrid from "@/components/BentoGrid";
import IdeaModal from "@/components/IdeaModal";
import IdeaForm from "@/components/IdeaForm";
import Leaderboard from "@/components/Leaderboard";
import GlassSelect from "@/components/GlassSelect";
import { useIdentity } from "@/lib/useIdentity";

const BOARD_SECTIONS: { key: IdeaStatus; label: string }[] = [
  { key: "pool", label: "Pool" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const EMPTY_COPY: Record<IdeaStatus, string> = {
  pool: "No ideas here yet — add one to fill this space.",
  in_progress: "Nothing being filmed right now — grab an idea from the Pool.",
  done: "Nothing posted yet — once an idea is filmed, mark it Done here.",
  archived: "Nothing archived — deleted ideas land here and can be restored.",
};

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "discussed", label: "Most discussed" },
  { value: "performing", label: "Best performing" },
] as const;

const NEXT_STATUS: Partial<Record<IdeaStatus, IdeaStatus>> = {
  pool: "in_progress",
  in_progress: "done",
};

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export default function Home() {
  return (
    <Suspense>
      <Board />
    </Suspense>
  );
}

function Board() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selected, setSelected] = useState<Idea | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<"board" | "leaderboard" | "archived">("board");
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [submitterFilter, setSubmitterFilter] = useState("");
  const [needsCheckInOnly, setNeedsCheckInOnly] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("newest");
  const [density, setDensity] = useState<"comfortable" | "compact">(
    typeof window !== "undefined" ? (localStorage.getItem("coyot_density") as "comfortable" | "compact") || "comfortable" : "comfortable"
  );
  const [highContrast, setHighContrast] = useState(false);
  const [connectionLost, setConnectionLost] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [showDigest, setShowDigest] = useState(false);
  const [digest, setDigest] = useState("");
  const [loadingDigest, setLoadingDigest] = useState(false);
  const failCount = useRef(0);
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { name } = useIdentity();

  const router = useRouter();
  const searchParams = useSearchParams();
  const activeMobileSection = (searchParams.get("section") as IdeaStatus) || "pool";
  const deepLinkedIdea = searchParams.get("idea");

  function setActiveMobileSection(section: IdeaStatus) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", section);
    router.push(`/?${params.toString()}`);
  }

  function openIdea(idea: Idea) {
    setSelected(idea);
    const params = new URLSearchParams(searchParams.toString());
    params.set("idea", idea.id);
    router.replace(`/?${params.toString()}`, { scroll: false });
  }

  function closeIdea() {
    setSelected(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("idea");
    router.replace(`/?${params.toString()}`, { scroll: false });
  }

  function toggleDensity() {
    const next = density === "comfortable" ? "compact" : "comfortable";
    setDensity(next);
    localStorage.setItem("coyot_density", next);
  }

  function toggleHighContrast() {
    const next = !highContrast;
    setHighContrast(next);
    document.documentElement.setAttribute("data-contrast", next ? "high" : "normal");
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ideas");
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (Array.isArray(json)) {
        setIdeas(json);
        failCount.current = 0;
        setConnectionLost(false);
        setAnnounce(`Loaded ${json.length} ideas`);
      }
    } catch {
      failCount.current += 1;
      if (failCount.current >= 2) setConnectionLost(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // F8: open the deep-linked idea (?idea=<id>) once it's loaded.
  useEffect(() => {
    if (deepLinkedIdea && ideas.length) {
      const found = ideas.find((i) => i.id === deepLinkedIdea);
      if (found) setSelected(found);
    }
  }, [deepLinkedIdea, ideas]);

  // C4: time-of-day wallpaper tint, set client-side only to avoid SSR flash.
  useEffect(() => {
    const hour = new Date().getHours();
    wallpaperRef.current?.setAttribute("data-daytime", hour >= 19 || hour < 6 ? "night" : "day");
  }, []);

  // Close the overflow menu on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Q1: keyboard shortcuts — "n" opens new idea form, Escape closes whatever's open.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if (e.key === "Escape") {
        closeIdea();
        setShowForm(false);
      } else if (e.key === "n" && !typing) {
        e.preventDefault();
        setShowForm(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // C3: very subtle wallpaper parallax on desktop mouse move.
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      wallpaperRef.current?.style.setProperty("--px", `${x}px`);
      wallpaperRef.current?.style.setProperty("--py", `${y}px`);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const submitters = useMemo(
    () => Array.from(new Set(ideas.map((i) => i.submitted_by))).map((s) => ({ value: s, label: s })),
    [ideas]
  );
  const allNames = useMemo(() => Array.from(new Set(ideas.map((i) => i.submitted_by))), [ideas]);

  function needsCheckIn(idea: Idea) {
    return (
      idea.status === "done" &&
      (idea.performance_logs ?? []).length === 0 &&
      Date.now() - new Date(idea.updated_at).getTime() > THREE_DAYS_MS
    );
  }

  function applyFiltersAndSort(list: Idea[]) {
    let out = list.filter((i) => {
      if (formatFilter && i.format !== formatFilter) return false;
      if (submitterFilter && i.submitted_by !== submitterFilter) return false;
      if (needsCheckInOnly && !needsCheckIn(i)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!i.title.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      switch (sort) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "discussed":
          return (b.comments?.length ?? 0) - (a.comments?.length ?? 0);
        case "performing": {
          const bestA = Math.max(0, ...(a.performance_logs ?? []).map((l) => l.views ?? 0));
          const bestB = Math.max(0, ...(b.performance_logs ?? []).map((l) => l.views ?? 0));
          return bestB - bestA;
        }
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return out;
  }

  const activeFilterCount =
    (formatFilter ? 1 : 0) + (submitterFilter ? 1 : 0) + (needsCheckInOnly ? 1 : 0) + (sort !== "newest" ? 1 : 0);
  const isFiltering = query.trim().length > 0 || activeFilterCount > 0;

  function vibrate() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(12);
  }

  async function quickAdvance(idea: Idea) {
    const next = NEXT_STATUS[idea.status];
    if (!next) return;
    const res = await fetch(`/api/ideas/${idea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) return toast.error("Couldn't update status.");
    vibrate();
    toast.success(`Moved to ${next.replace("_", " ")}`);
    load();
  }

  async function quickArchive(idea: Idea) {
    const res = await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Couldn't archive idea.");
    vibrate();
    toast.success("Idea archived", {
      action: {
        label: "Undo",
        onClick: async () => {
          await fetch(`/api/ideas/${idea.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: idea.status }),
          });
          load();
        },
      },
    });
    load();
  }

  async function runDigest() {
    setShowMenu(false);
    setShowDigest(true);
    setLoadingDigest(true);
    try {
      const res = await fetch("/api/ai/digest", { method: "POST" });
      const json = await res.json();
      setDigest(json.digest ?? json.error ?? "");
    } catch {
      setDigest("Couldn't generate digest.");
    } finally {
      setLoadingDigest(false);
    }
  }

  const selectedFresh = selected ? ideas.find((i) => i.id === selected.id) ?? null : null;
  const archivedIdeas = applyFiltersAndSort(ideas.filter((i) => i.status === "archived"));
  const poolCount = ideas.filter((i) => i.status === "pool").length;
  const progressCount = ideas.filter((i) => i.status === "in_progress").length;
  const doneCount = ideas.filter((i) => i.status === "done").length;
  const funnelTotal = poolCount + progressCount + doneCount || 1;

  return (
    <div className="wallpaper-bg" ref={wallpaperRef}>
      <div aria-live="polite" className="sr-only">{announce}</div>

      {connectionLost && (
        <div className="glass-card mx-3 mt-3 p-2 text-center text-xs text-red-600" role="alert">
          Connection trouble — actions may not save. Try refreshing.
        </div>
      )}

      {/* Header: logo + the 3 things people actually reach for often */}
      <header className="glass-pill mx-3 mt-3 px-4 py-2 flex items-center justify-between sticky top-3 z-40">
        <span className="font-semibold text-taupe text-sm">🦊 Coyot AI</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setView(view === "leaderboard" ? "board" : "leaderboard")}
            aria-pressed={view === "leaderboard"}
            aria-label="Leaderboard"
            className={`min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center ${view === "leaderboard" ? "glass-active" : ""}`}
          >
            <Trophy size={16} aria-hidden="true" />
          </button>
          <button
            onClick={() => setView(view === "archived" ? "board" : "archived")}
            aria-pressed={view === "archived"}
            aria-label="Archived ideas"
            className={`min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center ${view === "archived" ? "glass-active" : ""}`}
          >
            <ArchiveIcon size={16} aria-hidden="true" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              aria-label="More options"
              aria-expanded={showMenu}
              className="min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center"
            >
              <MoreVertical size={16} aria-hidden="true" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 glass-card p-1.5 w-48 z-50 space-y-0.5">
                <button onClick={runDigest} className="w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-xl hover:bg-white/40">
                  <Newspaper size={14} aria-hidden="true" /> Weekly digest
                </button>
                <button
                  onClick={() => {
                    toggleHighContrast();
                  }}
                  className="w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-xl hover:bg-white/40"
                >
                  <Contrast size={14} aria-hidden="true" /> {highContrast ? "Normal contrast" : "High contrast"}
                </button>
                <button
                  onClick={() => {
                    toggleDensity();
                  }}
                  className="w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-xl hover:bg-white/40"
                >
                  {density === "compact" ? <LayoutGrid size={14} aria-hidden="true" /> : <Rows3 size={14} aria-hidden="true" />}
                  {density === "compact" ? "Comfortable view" : "Compact view"}
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setShowForm(true)} aria-label="New idea" className="glass-button text-sm min-h-[40px] px-3 flex items-center gap-1">
            <Plus size={16} aria-hidden="true" />
            <span className="hidden sm:inline">New idea</span>
          </button>
        </div>
      </header>

      {showDigest && (
        <div className="glass-card mx-3 mt-3 p-4 text-sm text-taupe/80 relative">
          <h2 className="text-sm font-semibold text-taupe mb-2 pr-6">Weekly digest</h2>
          <p className="whitespace-pre-wrap">{loadingDigest ? "Summarizing the board..." : digest}</p>
          {!loadingDigest && digest && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(digest);
                toast.success("Copied to clipboard");
              }}
              className="glass-pill text-xs px-3 py-1 mt-2 flex items-center gap-1"
            >
              <Copy size={12} aria-hidden="true" /> Copy for group chat
            </button>
          )}
          <button onClick={() => setShowDigest(false)} aria-label="Close digest" className="absolute top-3 right-3 min-h-[32px] min-w-[32px] flex items-center justify-center text-taupe/50">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      {view === "leaderboard" && (
        <main className="p-3">
          <Leaderboard ideas={ideas} />
        </main>
      )}

      {view === "archived" && (
        <main className="p-3">
          {archivedIdeas.length === 0 ? (
            <div className="glass-card flex items-center justify-center h-40 text-taupe/60 text-sm text-center px-6">
              {EMPTY_COPY.archived}
            </div>
          ) : (
            <BentoGrid ideas={archivedIdeas} onOpen={openIdea} density={density} />
          )}
        </main>
      )}

      {view === "board" && (
        <>
          {/* Section tabs first — this is the primary navigation people use constantly */}
          <nav className="flex gap-2 mx-3 mt-3 lg:hidden" aria-label="Board sections">
            {BOARD_SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveMobileSection(s.key)}
                aria-pressed={activeMobileSection === s.key}
                className={`flex-1 glass-pill text-sm py-2.5 min-h-[44px] ${activeMobileSection === s.key ? "font-bold glass-active" : "opacity-70"}`}
              >
                {s.label} ({ideas.filter((i) => i.status === s.key).length})
              </button>
            ))}
          </nav>

          {/* Search + filters toggle — filters collapsed by default so they don't crowd the page */}
          <div className="flex gap-2 mx-3 mt-3 items-center">
            <div className="glass-input flex items-center gap-2 flex-1 min-h-[44px]">
              <Search size={14} className="text-taupe/60" aria-hidden="true" />
              <input
                aria-label="Search ideas"
                className="bg-transparent outline-none w-full text-sm"
                placeholder="Search ideas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              aria-pressed={showFilters}
              aria-label="Filters"
              className={`glass-pill min-h-[44px] px-3 flex items-center gap-1 text-sm relative ${showFilters ? "glass-active" : ""}`}
            >
              <SlidersHorizontal size={14} aria-hidden="true" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-taupe text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="glass-card mx-3 mt-2 p-3 space-y-2">
              <div className="flex gap-2 flex-wrap">
                <div className="w-36">
                  <GlassSelect value={sort} onChange={(v) => setSort(v as typeof sort)} options={[...SORTS]} placeholder="Sort" ariaLabel="Sort ideas" />
                </div>
                <div className="w-36">
                  <GlassSelect value={submitterFilter} onChange={setSubmitterFilter} options={submitters} placeholder="Anyone" ariaLabel="Filter by submitter" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {name && (
                  <button
                    onClick={() => setSubmitterFilter(submitterFilter === name ? "" : name)}
                    aria-pressed={submitterFilter === name}
                    className={`glass-pill text-[11px] px-3 min-h-[36px] ${submitterFilter === name ? "font-bold glass-active" : "opacity-70"}`}
                  >
                    My ideas
                  </button>
                )}
                <button
                  onClick={() => setNeedsCheckInOnly((v) => !v)}
                  aria-pressed={needsCheckInOnly}
                  className={`glass-pill text-[11px] px-3 min-h-[36px] ${needsCheckInOnly ? "font-bold glass-active" : "opacity-70"}`}
                >
                  Needs check-in
                </button>
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFormatFilter(formatFilter === f.value ? "" : f.value)}
                    aria-pressed={formatFilter === f.value}
                    className={`glass-pill text-[11px] px-3 min-h-[36px] ${formatFilter === f.value ? "font-bold glass-active" : "opacity-70"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setFormatFilter("");
                    setSubmitterFilter("");
                    setNeedsCheckInOnly(false);
                    setSort("newest");
                  }}
                  className="text-xs text-red-500/80 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* D4: backlog funnel — quiet, secondary context under the tabs */}
          {funnelTotal > 1 && (
            <div className="mx-3 mt-3 h-1.5 rounded-full overflow-hidden flex glass-pill" aria-hidden="true">
              <div style={{ width: `${(poolCount / funnelTotal) * 100}%`, background: "var(--pale-sky)" }} />
              <div style={{ width: `${(progressCount / funnelTotal) * 100}%`, background: "var(--thistle)" }} />
              <div style={{ width: `${(doneCount / funnelTotal) * 100}%`, background: "var(--azure-mist)" }} />
            </div>
          )}

          <main className="p-3 lg:hidden">
            {(() => {
              const list = applyFiltersAndSort(ideas.filter((i) => i.status === activeMobileSection));
              if (list.length === 0 && isFiltering) {
                return (
                  <div className="glass-card flex flex-col items-center justify-center gap-2 h-40 text-taupe/60 text-sm">
                    <span>No ideas match your search/filter.</span>
                  </div>
                );
              }
              if (list.length === 0) {
                return (
                  <div className="glass-card flex items-center justify-center h-40 text-taupe/60 text-sm text-center px-6">
                    {EMPTY_COPY[activeMobileSection]}
                  </div>
                );
              }
              return <BentoGrid ideas={list} onOpen={openIdea} density={density} onQuickArchive={quickArchive} onQuickAdvance={quickAdvance} />;
            })()}
          </main>

          {/* Desktop: all three sections side by side (D3) */}
          <main className="hidden lg:grid lg:grid-cols-3 gap-4 p-3">
            {BOARD_SECTIONS.map((s) => {
              const list = applyFiltersAndSort(ideas.filter((i) => i.status === s.key));
              return (
                <div key={s.key}>
                  <h2 className="text-sm font-semibold text-taupe mb-2 px-1">
                    {s.label} ({list.length})
                  </h2>
                  {list.length === 0 ? (
                    <div className="glass-card flex items-center justify-center h-32 text-taupe/60 text-xs text-center px-4">
                      {EMPTY_COPY[s.key]}
                    </div>
                  ) : (
                    <BentoGrid ideas={list} onOpen={openIdea} density={density} onQuickArchive={quickArchive} onQuickAdvance={quickAdvance} />
                  )}
                </div>
              );
            })}
          </main>
        </>
      )}

      {/* M3: mobile floating action button */}
      <button
        onClick={() => setShowForm(true)}
        aria-label="Add new idea"
        className="glass-button sm:hidden fixed bottom-5 right-5 z-30 rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
      >
        <Plus size={22} aria-hidden="true" />
      </button>

      {selectedFresh && (
        <IdeaModal idea={selectedFresh} onClose={closeIdea} onChanged={load} allNames={allNames} />
      )}
      {showForm && <IdeaForm onClose={() => setShowForm(false)} onCreated={load} existingIdeas={ideas} />}
    </div>
  );
}

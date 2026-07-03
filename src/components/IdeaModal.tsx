"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Trash2, RotateCcw, X, Pin, PinOff, Pencil, Sparkles, Maximize2, Minimize2, Check, UserPlus, ArrowRight } from "lucide-react";
import type { Idea, IdeaStatus, Comment, Series } from "@/lib/types";
import { FORMATS } from "@/lib/types";
import { useIdentity } from "@/lib/useIdentity";
import { relativeTime } from "@/lib/relativeTime";
import { avatarForName } from "@/lib/identityVisual";
import { burstConfetti } from "@/lib/confetti";
import SeriesPicker from "./SeriesPicker";

export default function IdeaModal({
  idea,
  onClose,
  onChanged,
  allNames = [],
  series = [],
  onSeriesCreated,
}: {
  idea: Idea;
  onClose: () => void;
  onChanged: () => void;
  allNames?: string[];
  series?: Series[];
  onSeriesCreated?: () => void;
}) {
  const { name, setName } = useIdentity();
  const [comment, setComment] = useState("");
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerModel, setAnswerModel] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState(false);
  const [hooks, setHooks] = useState<string[]>([]);
  const [loadingHooks, setLoadingHooks] = useState(false);
  const [perf, setPerf] = useState({ views: "", likes: "", saves: "" });
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleDraft, setTitleDraft] = useState(idea.title);
  const [descDraft, setDescDraft] = useState(idea.description);
  const [assigneeDraft, setAssigneeDraft] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [handoffs, setHandoffs] = useState<Idea["idea_handoffs"]>([]);

  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Guards against losing an in-progress comment, performance entry, or
  // unsaved title/description edit on tab close/reload. Back-button safety
  // for this modal is handled at the router level in page.tsx (it pushes
  // a real history entry on open), not here.
  const hasUnsavedInput =
    comment.trim().length > 0 ||
    perf.views !== "" ||
    perf.likes !== "" ||
    perf.saves !== "" ||
    (editingTitle && titleDraft !== idea.title) ||
    (editingDesc && descDraft !== idea.description);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedInput) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedInput]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ block: "nearest" });
    commentInputRef.current?.focus();
  }, [idea.id]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ideas/${idea.id}/handoff`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setHandoffs(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [idea.id]);

  async function patchIdea(body: Record<string, unknown>) {
    const res = await fetch(`/api/ideas/${idea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, last_edited_by: name || "Anon" }),
    });
    return res;
  }

  async function setStatus(status: IdeaStatus) {
    const res = await patchIdea({ status });
    if (!res.ok) return toast.error("Couldn't update status.");
    toast.success(`Moved to ${status.replace("_", " ")}`);
    if (status === "done" && idea.status !== "done") burstConfetti();
    onChanged();
  }

  async function togglePin() {
    const res = await patchIdea({ pinned: !idea.pinned });
    if (!res.ok) return toast.error("Couldn't update pin.");
    toast.success(idea.pinned ? "Unpinned" : "Pinned to top");
    onChanged();
  }

  async function setSeries(seriesId: string) {
    const res = await patchIdea({ series_id: seriesId || null });
    if (!res.ok) return toast.error("Couldn't update series.");
    onChanged();
  }

  async function assignTo(to: string) {
    if (!to.trim() || assigning) return;
    setAssigning(true);
    const res = await fetch(`/api/ideas/${idea.id}/handoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, changed_by: name || "Anon" }),
    });
    setAssigning(false);
    if (!res.ok) return toast.error("Couldn't assign idea.");
    const newHandoff = await res.json();
    toast.success(`Assigned to ${to}`);
    setAssigneeDraft("");
    setHandoffs((prev) => [newHandoff, ...(prev ?? [])]);
    onChanged();
  }

  async function setSizeOverride(size: "small" | "large" | null) {
    const res = await patchIdea({ size_override: idea.size_override === size ? null : size });
    if (!res.ok) return toast.error("Couldn't update tile size.");
    onChanged();
  }

  async function saveTitle() {
    if (!titleDraft.trim()) return toast.error("Title can't be empty.");
    const res = await patchIdea({ title: titleDraft });
    if (!res.ok) return toast.error("Couldn't save title.");
    setEditingTitle(false);
    onChanged();
  }

  async function saveDesc() {
    const res = await patchIdea({ description: descDraft });
    if (!res.ok) return toast.error("Couldn't save description.");
    setEditingDesc(false);
    onChanged();
  }

  async function archive() {
    const res = await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Couldn't archive idea.");
    toast.success("Idea archived");
    onChanged();
    onClose();
  }

  async function restore() {
    const res = await patchIdea({ status: "pool" });
    if (!res.ok) return toast.error("Couldn't restore idea.");
    toast.success("Idea restored to Pool");
    onChanged();
  }

  async function submitComment() {
    if (!comment.trim()) return;
    let images: string[] = [];
    if (commentFile) {
      const fd = new FormData();
      fd.append("file", commentFile);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await up.json();
      if (json.url) images = [json.url];
      else toast.error("Image upload failed, posting comment without it.");
    }
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea_id: idea.id, author: name || "Anon", body: comment, images, parent_id: replyTo }),
    });
    if (!res.ok) return toast.error("Couldn't post comment.");
    setComment("");
    setCommentFile(null);
    setReplyTo(null);
    onChanged();
  }

  async function saveCommentEdit(id: string, body: string) {
    const res = await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) return toast.error("Couldn't update comment.");
    setEditingCommentId(null);
    onChanged();
  }

  async function deleteComment(id: string) {
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Couldn't delete comment.");
    toast.success("Comment deleted");
    onChanged();
  }

  async function toggleReaction(comment: Comment, emoji: string) {
    const who = name || "Anon";
    const current = comment.reactions?.[emoji] ?? [];
    const next = current.includes(who) ? current.filter((n) => n !== who) : [...current, who];
    const reactions = { ...comment.reactions, [emoji]: next };
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reactions }),
    });
    if (!res.ok) return toast.error("Couldn't react.");
    onChanged();
  }

  async function toggleResolve(comment: Comment) {
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: !comment.resolved }),
    });
    if (!res.ok) return toast.error("Couldn't update.");
    onChanged();
  }

  const mentionQuery = (() => {
    const at = comment.lastIndexOf("@");
    if (at === -1) return null;
    const after = comment.slice(at + 1);
    if (/\s/.test(after)) return null;
    return after;
  })();
  const mentionMatches =
    mentionQuery !== null ? allNames.filter((n) => n.toLowerCase().startsWith(mentionQuery.toLowerCase())) : [];

  function applyMention(n: string) {
    const at = comment.lastIndexOf("@");
    setComment(comment.slice(0, at) + "@" + n + " ");
    commentInputRef.current?.focus();
  }

  async function handleCommentPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const file = item.getAsFile();
    if (file) {
      setCommentFile(file);
      toast.success("Image pasted, will attach on post");
    }
  }

  function validPerf() {
    return [perf.views, perf.likes, perf.saves].every(
      (v) => v === "" || (Number(v) >= 0 && Number.isFinite(Number(v)))
    );
  }

  async function submitPerf() {
    if (!validPerf()) return toast.error("Views/likes/saves must be non-negative numbers.");
    const res = await fetch("/api/performance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea_id: idea.id,
        logged_by: name || "Anon",
        views: perf.views ? Number(perf.views) : null,
        likes: perf.likes ? Number(perf.likes) : null,
        saves: perf.saves ? Number(perf.saves) : null,
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return toast.error(json.error ?? "Couldn't log performance.");
    }
    setPerf({ views: "", likes: "", saves: "" });
    toast.success("Performance logged");
    onChanged();
  }

  async function deletePerfLog(id: string) {
    const res = await fetch(`/api/performance/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Couldn't delete log.");
    toast.success("Log removed");
    onChanged();
  }

  async function askAI() {
    if (!question.trim() || asking) return;
    setAsking(true);
    setAskError(false);
    setAnswer("");
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea_id: idea.id, question }),
      });
      if (!res.ok || !res.body) throw new Error();
      setAnswerModel(res.headers.get("X-Model") ?? "");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setAnswer(full);
      }
    } catch {
      setAskError(true);
      toast.error("AI request failed.");
    } finally {
      setAsking(false);
    }
  }

  async function generateHooks() {
    setLoadingHooks(true);
    try {
      const res = await fetch("/api/ai/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: idea.title, description: idea.description }),
      });
      const json = await res.json();
      if (json.hooks) setHooks(json.hooks);
      else toast.error("Couldn't generate hooks.");
    } catch {
      toast.error("Couldn't generate hooks.");
    } finally {
      setLoadingHooks(false);
    }
  }

  const formatLabel = FORMATS.find((f) => f.value === idea.format)?.label;
  const isArchived = idea.status === "archived";
  const topLevelComments = (idea.comments ?? []).filter((c) => !c.parent_id);
  const repliesFor = (id: string) => (idea.comments ?? []).filter((c) => c.parent_id === id);
  const growthData = [...(idea.performance_logs ?? [])]
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
    .map((p) => ({ date: new Date(p.logged_at).toLocaleDateString(), views: p.views ?? 0 }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Idea: ${idea.title}`}
      data-glass="strong"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-6 relative rounded-b-none sm:rounded-[22px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center glass-pill"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 flex-wrap mb-2">
          {formatLabel && <span className="glass-pill inline-block text-xs px-2 py-0.5">{formatLabel}</span>}
          {!isArchived && (
            <button
              onClick={togglePin}
              aria-label={idea.pinned ? "Unpin idea" : "Pin idea to top"}
              className="glass-pill text-xs px-2 py-0.5 flex items-center gap-1"
            >
              {idea.pinned ? <PinOff size={12} aria-hidden="true" /> : <Pin size={12} aria-hidden="true" />}
              {idea.pinned ? "Unpin" : "Pin"}
            </button>
          )}
          {!isArchived && (
            <>
              <button
                onClick={() => setSizeOverride("small")}
                aria-pressed={idea.size_override === "small"}
                aria-label="Force small tile size"
                className={`glass-pill text-xs px-2 py-0.5 flex items-center gap-1 ${idea.size_override === "small" ? "font-bold" : ""}`}
              >
                <Minimize2 size={12} aria-hidden="true" />
              </button>
              <button
                onClick={() => setSizeOverride("large")}
                aria-pressed={idea.size_override === "large"}
                aria-label="Force large tile size"
                className={`glass-pill text-xs px-2 py-0.5 flex items-center gap-1 ${idea.size_override === "large" ? "font-bold" : ""}`}
              >
                <Maximize2 size={12} aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {!isArchived && (
          <div className="mb-3">
            <SeriesPicker
              value={idea.series_id ?? ""}
              onChange={setSeries}
              series={series}
              authorName={name}
              onSeriesCreated={() => onSeriesCreated?.()}
            />
          </div>
        )}

        {!isArchived && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-xs text-taupe/70 mb-1.5">
              <UserPlus size={12} aria-hidden="true" />
              {idea.assigned_to ? (
                <span>
                  Assigned to <strong className="text-taupe">{idea.assigned_to}</strong>
                </span>
              ) : (
                <span>Unassigned</span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <input
                list="assignee-names"
                className="glass-input flex-1 text-sm min-h-[40px] min-w-[140px]"
                placeholder="Assign to..."
                value={assigneeDraft}
                onChange={(e) => setAssigneeDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && assignTo(assigneeDraft)}
              />
              <datalist id="assignee-names">
                {allNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
              <button
                onClick={() => assignTo(assigneeDraft)}
                className="glass-pill text-xs px-3 py-2 min-h-[40px]"
                disabled={assigning || !assigneeDraft.trim()}
              >
                Assign
              </button>
              {name && idea.assigned_to !== name && (
                <button onClick={() => assignTo(name)} className="glass-pill text-xs px-3 py-2 min-h-[40px]" disabled={assigning}>
                  Assign to me
                </button>
              )}
            </div>
            {(handoffs ?? []).length > 0 && (
              <ul className="mt-2 space-y-1 text-[11px] text-taupe/60">
                {[...(handoffs ?? [])]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((h) => (
                    <li key={h.id} className="flex items-center gap-1">
                      {h.from_name ? <span>{h.from_name}</span> : <span className="italic">unassigned</span>}
                      <ArrowRight size={10} aria-hidden="true" />
                      <span>{h.to_name}</span>
                      <span className="text-taupe/40">· by {h.changed_by} · {relativeTime(h.created_at)}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {editingTitle ? (
          <div className="flex gap-2 items-center pr-8">
            <input
              className="glass-input flex-1 text-lg font-semibold min-h-[44px]"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveTitle()}
              autoFocus
            />
            <button onClick={saveTitle} className="glass-button text-xs min-h-[36px]">Save</button>
          </div>
        ) : (
          <h2 className="text-xl font-semibold text-taupe pr-8 flex items-center gap-2 group">
            {idea.title}
            <button
              onClick={() => {
                setTitleDraft(idea.title);
                setEditingTitle(true);
              }}
              aria-label="Edit title"
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-taupe/50 transition-opacity"
            >
              <Pencil size={14} aria-hidden="true" />
            </button>
          </h2>
        )}

        {editingDesc ? (
          <div className="mt-2 space-y-1">
            <textarea
              className="glass-input w-full text-sm"
              rows={3}
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              autoFocus
            />
            <button onClick={saveDesc} className="glass-button text-xs min-h-[36px]">Save</button>
          </div>
        ) : (
          <p
            onClick={() => {
              setDescDraft(idea.description);
              setEditingDesc(true);
            }}
            className="text-sm text-taupe/80 mt-2 whitespace-pre-wrap cursor-text"
            title="Click to edit"
          >
            {idea.description || <span className="text-taupe/40">Click to add a description</span>}
          </p>
        )}

        <p className="text-[11px] text-taupe/50 mt-1">
          {relativeTime(idea.created_at)}
          {idea.last_edited_by && ` · last edited by ${idea.last_edited_by}`}
        </p>

        {idea.images.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {idea.images.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" loading="lazy" className="h-20 w-20 object-cover rounded-xl" />
            ))}
          </div>
        )}

        {isArchived ? (
          <div className="mt-4">
            <button
              onClick={restore}
              className="glass-pill text-xs px-3 py-2 min-h-[44px] flex items-center gap-1 text-taupe"
            >
              <RotateCcw size={14} aria-hidden="true" /> Restore to Pool
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mt-4 flex-wrap">
            {(["pool", "in_progress", "done"] as IdeaStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                aria-pressed={idea.status === s}
                className={`glass-pill text-xs px-3 py-2 min-h-[44px] ${idea.status === s ? "font-bold" : "opacity-70"}`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
            <button
              onClick={archive}
              aria-label="Archive this idea"
              className="glass-pill text-xs px-3 py-2 min-h-[44px] text-red-500/80 flex items-center gap-1"
            >
              <Trash2 size={14} aria-hidden="true" /> archive
            </button>
          </div>
        )}

        <label className="sr-only" htmlFor="modal-name">Your name</label>
        <input
          id="modal-name"
          className="glass-input w-full mt-4 text-sm min-h-[44px]"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Comments */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-taupe">Comments</h3>
          <div className="space-y-2 mt-2">
            {topLevelComments.length === 0 && (
              <p className="text-xs text-taupe/60">No comments yet — be the first to weigh in.</p>
            )}
            {topLevelComments.map((c) => (
              <div key={c.id} className="text-xs text-taupe/80">
                <CommentRow
                  comment={c}
                  editing={editingCommentId === c.id}
                  onStartEdit={() => setEditingCommentId(c.id)}
                  onSave={(body) => saveCommentEdit(c.id, body)}
                  onDelete={() => deleteComment(c.id)}
                  onReply={() => setReplyTo(c.id)}
                  onReact={(emoji) => toggleReaction(c, emoji)}
                  onToggleResolve={() => toggleResolve(c)}
                  currentUser={name}
                />
                {repliesFor(c.id).length > 0 && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-thistle/50 pl-2">
                    {repliesFor(c.id).map((r) => (
                      <CommentRow
                        key={r.id}
                        comment={r}
                        editing={editingCommentId === r.id}
                        onStartEdit={() => setEditingCommentId(r.id)}
                        onSave={(body) => saveCommentEdit(r.id, body)}
                        onDelete={() => deleteComment(r.id)}
                        onReact={(emoji) => toggleReaction(r, emoji)}
                        onToggleResolve={() => toggleResolve(r)}
                        currentUser={name}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
          {replyTo && (
            <p className="text-[11px] text-taupe/60 mt-2 flex items-center gap-2">
              Replying to a comment
              <button onClick={() => setReplyTo(null)} className="underline">cancel</button>
            </p>
          )}
          <div className="relative">
            {mentionMatches.length > 0 && (
              <div className="absolute bottom-full mb-1 glass-card p-1 z-10">
                {mentionMatches.map((n) => (
                  <button
                    key={n}
                    onClick={() => applyMention(n)}
                    className="block w-full text-left text-xs px-2 py-1 rounded-lg hover:bg-white/40"
                  >
                    @{n}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              <input
                ref={commentInputRef}
                className="glass-input flex-1 text-sm min-h-[44px]"
                placeholder="Add a comment (paste an image, or @mention someone)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                onPaste={handleCommentPaste}
              />
              <input
                type="file"
                accept="image/*"
                aria-label="Attach image to comment"
                onChange={(e) => setCommentFile(e.target.files?.[0] ?? null)}
                className="text-[11px] text-taupe/70 max-w-[110px]"
              />
              <button onClick={submitComment} className="glass-button text-sm min-h-[44px]">Post</button>
            </div>
          </div>
        </div>

        {/* Performance */}
        {idea.status === "done" && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-taupe">Performance log</h3>
            {growthData.length > 1 && (
              <div className="h-32 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--taupe-ink)" }} />
                    <Tooltip contentStyle={{ background: "var(--azure-mist)", border: "1px solid var(--thistle)", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="views" stroke="var(--pale-sky)" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="space-y-1 mt-2 text-xs text-taupe/80">
              {(idea.performance_logs ?? []).length === 0 && (
                <p className="text-taupe/60">No performance logged yet.</p>
              )}
              {(idea.performance_logs ?? []).map((p) =>
                editingLogId === p.id ? (
                  <div key={p.id} className="flex gap-1 flex-wrap items-center glass-pill px-2 py-1">
                    <input inputMode="numeric" className="glass-input w-16 text-xs min-h-[36px]" defaultValue={p.views ?? ""} id={`v-${p.id}`} />
                    <input inputMode="numeric" className="glass-input w-16 text-xs min-h-[36px]" defaultValue={p.likes ?? ""} id={`l-${p.id}`} />
                    <input inputMode="numeric" className="glass-input w-16 text-xs min-h-[36px]" defaultValue={p.saves ?? ""} id={`s-${p.id}`} />
                    <button
                      className="glass-button text-xs min-h-[36px]"
                      onClick={async () => {
                        const v = (document.getElementById(`v-${p.id}`) as HTMLInputElement).value;
                        const l = (document.getElementById(`l-${p.id}`) as HTMLInputElement).value;
                        const s = (document.getElementById(`s-${p.id}`) as HTMLInputElement).value;
                        if ([v, l, s].some((x) => x !== "" && (Number.isNaN(Number(x)) || Number(x) < 0))) {
                          return toast.error("Values must be non-negative numbers.");
                        }
                        const res = await fetch(`/api/performance/${p.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            views: v ? Number(v) : null,
                            likes: l ? Number(l) : null,
                            saves: s ? Number(s) : null,
                          }),
                        });
                        if (!res.ok) return toast.error("Couldn't update log.");
                        toast.success("Log updated");
                        setEditingLogId(null);
                        onChanged();
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div key={p.id} className="flex items-center justify-between glass-pill px-2 py-1">
                    <button
                      className="text-left"
                      onClick={() => setEditingLogId(p.id)}
                      aria-label="Edit this performance log entry"
                    >
                      {new Date(p.logged_at).toLocaleDateString()} — {p.views ?? 0} views, {p.likes ?? 0} likes, {p.saves ?? 0} saves
                    </button>
                    <button
                      onClick={() => deletePerfLog(p.id)}
                      aria-label="Delete this performance log entry"
                      className="min-h-[32px] min-w-[32px] flex items-center justify-center text-red-500/70"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </div>
                )
              )}
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <input inputMode="numeric" className="glass-input w-20 text-sm min-h-[44px]" placeholder="views" value={perf.views} onChange={(e) => setPerf({ ...perf, views: e.target.value })} />
              <input inputMode="numeric" className="glass-input w-20 text-sm min-h-[44px]" placeholder="likes" value={perf.likes} onChange={(e) => setPerf({ ...perf, likes: e.target.value })} />
              <input inputMode="numeric" className="glass-input w-20 text-sm min-h-[44px]" placeholder="saves" value={perf.saves} onChange={(e) => setPerf({ ...perf, saves: e.target.value })} />
              <button onClick={submitPerf} className="glass-button text-sm min-h-[44px]">Log</button>
            </div>
          </div>
        )}

        {/* Hook lines */}
        <div className="mt-4">
          <button onClick={generateHooks} className="glass-pill text-xs px-3 py-2 min-h-[36px] flex items-center gap-1" disabled={loadingHooks}>
            <Sparkles size={12} aria-hidden="true" /> {loadingHooks ? "thinking..." : "Generate hook lines"}
          </button>
          {hooks.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-taupe/80 list-disc list-inside">
              {hooks.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Ask AI */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-taupe">Ask AI about this idea</h3>
          <div className="flex gap-2 mt-2">
            <input
              className="glass-input flex-1 text-sm min-h-[44px]"
              placeholder="e.g. give me a shot list"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAI()}
            />
            <button onClick={askAI} className="glass-button text-sm min-h-[44px]" disabled={asking}>
              {asking ? "..." : "Ask"}
            </button>
          </div>
          {answer && (
            <div className="mt-2">
              <p className="text-xs text-taupe/80 whitespace-pre-wrap">{answer}</p>
              {answerModel && <p className="text-[10px] text-taupe/40 mt-1">via {answerModel}</p>}
            </div>
          )}
          {askError && (
            <button onClick={askAI} className="glass-pill text-xs px-3 py-1 mt-2 min-h-[36px]">
              Retry
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const QUICK_REACTIONS = ["👍", "🔥"];

function CommentRow({
  comment,
  editing,
  onStartEdit,
  onSave,
  onDelete,
  onReply,
  onReact,
  onToggleResolve,
  currentUser,
}: {
  comment: Comment;
  editing: boolean;
  onStartEdit: () => void;
  onSave: (body: string) => void;
  onDelete: () => void;
  onReply?: () => void;
  onReact?: (emoji: string) => void;
  onToggleResolve?: () => void;
  currentUser: string;
}) {
  const [draft, setDraft] = useState(comment.body);

  if (editing) {
    return (
      <div className="flex gap-1 items-center">
        <input
          className="glass-input flex-1 text-xs min-h-[32px]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave(draft)}
          autoFocus
        />
        <button onClick={() => onSave(draft)} className="glass-pill text-[10px] px-2 py-1">Save</button>
      </div>
    );
  }

  return (
    <div className={`group ${comment.resolved ? "opacity-60" : ""}`}>
      <span>{avatarForName(comment.author)} </span>
      <span className="font-semibold">{comment.author}: </span>
      {comment.body}
      {comment.edited_at && <span className="text-taupe/40"> (edited)</span>}
      {comment.resolved && <span className="text-green-600"> ✓ resolved</span>}
      <span className="ml-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 inline-flex gap-2 text-[10px] text-taupe/50 transition-opacity">
        {onReply && <button onClick={onReply} className="py-1">reply</button>}
        <button onClick={onStartEdit} className="py-1">edit</button>
        <button onClick={onDelete} className="py-1">delete</button>
        {onToggleResolve && (
          <button onClick={onToggleResolve} className="flex items-center gap-0.5 py-1">
            <Check size={10} aria-hidden="true" /> {comment.resolved ? "unresolve" : "resolve"}
          </button>
        )}
      </span>
      {comment.images.length > 0 && (
        <div className="flex gap-2 mt-1 flex-wrap">
          {comment.images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" loading="lazy" className="h-14 w-14 object-cover rounded-lg" />
          ))}
        </div>
      )}
      {onReact && (
        <div className="flex gap-1 mt-1">
          {QUICK_REACTIONS.map((emoji) => {
            const count = comment.reactions?.[emoji]?.length ?? 0;
            const mine = comment.reactions?.[emoji]?.includes(currentUser || "Anon");
            return (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className={`glass-pill text-[10px] px-1.5 py-0.5 ${mine ? "font-bold" : ""}`}
              >
                {emoji} {count > 0 && count}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

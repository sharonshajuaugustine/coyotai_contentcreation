"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, Wand2 } from "lucide-react";
import type { Idea } from "@/lib/types";
import { FORMATS } from "@/lib/types";
import { useIdentity } from "@/lib/useIdentity";
import GlassSelect from "./GlassSelect";

function similar(a: string, b: string): boolean {
  const na = a.trim().toLowerCase();
  const nb = b.trim().toLowerCase();
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}

export default function IdeaForm({
  onClose,
  onCreated,
  existingIdeas = [],
}: {
  onClose: () => void;
  onCreated: () => void;
  existingIdeas?: Idea[];
}) {
  const { name, setName } = useIdentity();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [clarify, setClarify] = useState("");
  const [loadingClarify, setLoadingClarify] = useState(false);
  const [clarifyError, setClarifyError] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; title?: string }>({});

  const duplicate = title.trim() ? existingIdeas.find((i) => similar(i.title, title)) : null;

  async function askClarify() {
    if (!title.trim() || loadingClarify) return;
    setLoadingClarify(true);
    setClarifyError(false);
    setClarify("");
    try {
      const res = await fetch("/api/ai/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setClarify(full);
      }
    } catch {
      setClarifyError(true);
      toast.error("AI request failed.");
    } finally {
      setLoadingClarify(false);
    }
  }

  function applyClarify() {
    const summaryLine = clarify.split("\n").find((l) => l.trim().length > 0);
    if (summaryLine) {
      setDescription(clarify.replace(/^summary:\s*/i, "").trim());
      toast.success("Applied AI summary to description");
    }
  }

  async function suggestFormat() {
    if (!title.trim()) return;
    setLoadingFormat(true);
    try {
      const res = await fetch("/api/ai/suggest-format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const json = await res.json();
      if (json.format) {
        setFormat(json.format);
        toast.success("Format suggested");
      } else toast.error("Couldn't suggest a format.");
    } catch {
      toast.error("Couldn't suggest a format.");
    } finally {
      setLoadingFormat(false);
    }
  }

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!title.trim()) next.title = "Title is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSaving(true);
    let images: string[] = [];
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await up.json();
      if (json.url) images = [json.url];
      else toast.error("Image upload failed, saving idea without it.");
    }
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submitted_by: name, title, description, format: format || null, images }),
    });
    setSaving(false);
    if (!res.ok) return toast.error("Couldn't save idea.");
    toast.success("Idea added to the pool");
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 p-0 sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="New idea form">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-6 space-y-3 rounded-b-none sm:rounded-[22px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-taupe">New idea</h2>

        <div>
          <label className="sr-only" htmlFor="form-name">Your name</label>
          <input id="form-name" className="glass-input w-full text-sm min-h-[44px]" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="sr-only" htmlFor="form-title">Title</label>
          <input id="form-title" className="glass-input w-full text-sm min-h-[44px]" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          {duplicate && (
            <p className="text-xs text-amber-600 mt-1">
              A similar idea already exists: "{duplicate.title}" — consider commenting there instead.
            </p>
          )}
        </div>

        <label className="sr-only" htmlFor="form-desc">Description</label>
        <textarea
          id="form-desc"
          className="glass-input w-full text-sm"
          placeholder="Description (you can paste an image here too)"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onPaste={(e) => {
            const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
            const f = item?.getAsFile();
            if (f) {
              setFile(f);
              toast.success("Image pasted, will attach on submit");
            }
          }}
        />

        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <GlassSelect
              value={format}
              onChange={setFormat}
              options={[...FORMATS]}
              placeholder="Format (optional)"
              ariaLabel="Format"
            />
          </div>
          <button onClick={suggestFormat} aria-label="Suggest format with AI" className="glass-pill p-2 min-h-[44px]" disabled={loadingFormat}>
            <Wand2 size={14} aria-hidden="true" />
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
          className={`glass-input flex items-center justify-center text-xs text-taupe/60 min-h-[60px] border-dashed ${dragOver ? "border-2 border-[var(--pale-sky)]" : ""}`}
        >
          {file ? file.name : "Drag an image here, or"}
          <label className="ml-1 underline cursor-pointer">
            browse
            <input
              type="file"
              accept="image/*"
              aria-label="Attach a reference image"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex gap-2 items-center">
          <button onClick={askClarify} className="glass-pill text-xs px-3 py-2 min-h-[36px]" disabled={loadingClarify}>
            {loadingClarify ? "thinking..." : "✨ Ask AI to clarify"}
          </button>
          {clarifyError && (
            <button onClick={askClarify} className="glass-pill text-xs px-3 py-2 min-h-[36px]">Retry</button>
          )}
        </div>
        {clarify && (
          <div className="space-y-1">
            <p className="text-xs text-taupe/80 whitespace-pre-wrap">{clarify}</p>
            <button onClick={applyClarify} className="glass-pill text-[11px] px-3 py-1 min-h-[32px] flex items-center gap-1">
              <Sparkles size={11} aria-hidden="true" /> Apply summary to description
            </button>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="glass-pill text-sm px-3 py-2 min-h-[44px]">Cancel</button>
          <button onClick={submit} className="glass-button text-sm min-h-[44px]" disabled={saving}>
            {saving ? "Saving..." : "Submit idea"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

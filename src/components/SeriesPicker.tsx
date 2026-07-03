"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Layers } from "lucide-react";
import type { Series } from "@/lib/types";
import { SWATCH_KEYS, swatchColor } from "@/lib/palette";
import GlassSelect from "./GlassSelect";

export default function SeriesPicker({
  value,
  onChange,
  series,
  authorName,
  onSeriesCreated,
}: {
  value: string;
  onChange: (v: string) => void;
  series: Series[];
  authorName: string;
  onSeriesCreated: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SWATCH_KEYS[0]);
  const [saving, setSaving] = useState(false);

  async function createSeries() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, created_by: authorName || "Anon" }),
    });
    setSaving(false);
    if (!res.ok) return toast.error("Couldn't create series.");
    const created = await res.json();
    toast.success(`Series "${created.name}" created`);
    onSeriesCreated();
    onChange(created.id);
    setCreating(false);
    setName("");
  }

  if (creating) {
    return (
      <div className="glass-card p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-taupe/60" aria-hidden="true" />
          <input
            className="glass-input flex-1 text-sm min-h-[40px]"
            placeholder="Series name (e.g. AI Myths)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {SWATCH_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setColor(k)}
              aria-label={`Color ${k}`}
              aria-pressed={color === k}
              className={`w-6 h-6 rounded-full border-2 ${color === k ? "border-taupe" : "border-transparent"}`}
              style={{ background: swatchColor(k) }}
            />
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setCreating(false)} className="glass-pill text-xs px-3 py-1.5 min-h-[36px]">Cancel</button>
          <button onClick={createSeries} className="glass-button text-xs min-h-[36px]" disabled={saving}>
            {saving ? "Creating..." : "Create series"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <GlassSelect
          value={value}
          onChange={onChange}
          options={series.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="No series"
          ariaLabel="Series"
        />
      </div>
      <button
        onClick={() => setCreating(true)}
        aria-label="Create new series"
        className="glass-pill p-2 min-h-[44px]"
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

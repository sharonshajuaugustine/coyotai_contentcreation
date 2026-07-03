"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function GlassSelect({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value)?.label ?? placeholder;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="glass-input w-full text-sm min-h-[44px] flex items-center justify-between"
      >
        <span className={value ? "text-taupe" : "text-taupe/50"}>{current}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full glass-card p-1 max-h-48 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-white/40 text-taupe/60"
          >
            {placeholder}
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-white/40 ${o.value === value ? "font-semibold text-taupe" : "text-taupe/80"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

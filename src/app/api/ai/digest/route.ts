import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { askOpenRouter } from "@/lib/openrouter";

export async function POST() {
  const sb = supabaseServer();
  const { data: ideas, error } = await sb
    .from("ideas")
    .select("title, status, format, submitted_by")
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = (ideas ?? [])
    .map((i) => `- [${i.status}] ${i.title} (${i.format ?? "no format"}, by ${i.submitted_by})`)
    .join("\n");

  try {
    const digest = await askOpenRouter([
      {
        role: "system",
        content:
          "You write a short, friendly weekly digest for a small Instagram content team's shared idea board. " +
          "Summarize what's new, what's in progress, and what's ready to post. Keep it under 120 words, plain text, no markdown headers.",
      },
      { role: "user", content: `Current board:\n${list || "(empty)"}` },
    ]);
    return NextResponse.json({ digest });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 502 });
  }
}

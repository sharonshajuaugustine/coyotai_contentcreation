import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

function nonNegativeIntOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return Math.floor(n);
}

export async function POST(req: Request) {
  const body = await req.json();
  const views = nonNegativeIntOrNull(body.views);
  const likes = nonNegativeIntOrNull(body.likes);
  const saves = nonNegativeIntOrNull(body.saves);
  if ([views, likes, saves].some((n) => Number.isNaN(n))) {
    return NextResponse.json({ error: "views/likes/saves must be non-negative numbers" }, { status: 400 });
  }

  const sb = supabaseServer();
  const { data, error } = await sb
    .from("performance_logs")
    .insert({
      idea_id: body.idea_id,
      logged_by: body.logged_by,
      views,
      likes,
      saves,
      comments_count: body.comments_count ?? null,
      note: body.note ?? null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

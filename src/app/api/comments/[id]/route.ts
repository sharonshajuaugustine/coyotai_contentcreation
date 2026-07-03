import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const sb = supabaseServer();
  const update: Record<string, unknown> = {};
  if (body.body !== undefined) {
    update.body = body.body;
    update.edited_at = new Date().toISOString();
  }
  if (body.reactions !== undefined) update.reactions = body.reactions;
  if (body.resolved !== undefined) update.resolved = body.resolved;

  const { data, error } = await sb.from("comments").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = supabaseServer();
  const { error } = await sb.from("comments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

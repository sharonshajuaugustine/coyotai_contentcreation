import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// Fetched lazily per-idea (not joined into the main /api/ideas list) so a
// missing idea_handoffs table can't take down the whole board for everyone
// before the migration adding it has been run.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("idea_handoffs")
    .select("*")
    .eq("idea_id", id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Reassigns an idea to someone and records the handoff ("sharon -> alex")
// so the team can see who passed an idea to whom, and when.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const to = (body.to ?? "").trim();
  const changedBy = body.changed_by || "Anon";
  if (!to) return NextResponse.json({ error: "to is required" }, { status: 400 });

  const sb = supabaseServer();
  const { data: idea, error: fetchError } = await sb.from("ideas").select("assigned_to").eq("id", id).single();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  const { error: updateError } = await sb
    .from("ideas")
    .update({ assigned_to: to, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  const { data: handoff, error: handoffError } = await sb
    .from("idea_handoffs")
    .insert({ idea_id: id, from_name: idea.assigned_to, to_name: to, changed_by: changedBy })
    .select()
    .single();
  if (handoffError) return NextResponse.json({ error: handoffError.message }, { status: 500 });

  return NextResponse.json(handoff);
}

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("ideas")
    .select("*, comments(*), performance_logs(*)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("ideas")
    .insert({
      submitted_by: body.submitted_by,
      title: body.title,
      description: body.description ?? "",
      format: body.format ?? null,
      images: body.images ?? [],
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

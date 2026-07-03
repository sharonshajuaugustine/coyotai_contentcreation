import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb.from("series").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("series")
    .insert({
      name: body.name,
      description: body.description ?? "",
      color: body.color ?? "pale-sky",
      created_by: body.created_by,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

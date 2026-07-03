import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("comments")
    .insert({
      idea_id: body.idea_id,
      parent_id: body.parent_id ?? null,
      author: body.author,
      body: body.body ?? "",
      images: body.images ?? [],
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

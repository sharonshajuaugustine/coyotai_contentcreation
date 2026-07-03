import { supabaseServer } from "@/lib/supabase";
import { streamOpenRouter } from "@/lib/openrouter";

// Per-idea Q&A, scoped to just that idea's context (title, description, comments).
export async function POST(req: Request) {
  const { idea_id, question } = await req.json();
  const sb = supabaseServer();
  const { data: idea, error } = await sb
    .from("ideas")
    .select("*, comments(*)")
    .eq("id", idea_id)
    .single();
  if (error || !idea) return new Response("Idea not found.", { status: 404 });

  const context = [
    `Title: ${idea.title}`,
    `Description: ${idea.description}`,
    `Format: ${idea.format ?? "none"}`,
    ...idea.comments.map((c: { author: string; body: string }) => `Comment (${c.author}): ${c.body}`),
  ].join("\n");

  try {
    const stream = await streamOpenRouter([
      {
        role: "system",
        content:
          "You help a video maker understand one Instagram video idea from a shared idea board. " +
          "Answer only using the context given. If asked, you can produce a short shot list or summary. Keep answers short and practical.",
      },
      { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` },
    ]);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Model": process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      },
    });
  } catch {
    return new Response("AI request failed. Try again.", { status: 502 });
  }
}

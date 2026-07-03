import { streamOpenRouter } from "@/lib/openrouter";

export async function POST(req: Request) {
  const { title, description } = await req.json();
  try {
    const stream = await streamOpenRouter([
      {
        role: "system",
        content:
          "You help a small Instagram content team turn rough video-idea notes into something clear. " +
          "Given a title and rough description, respond with: 1) a tightened one-paragraph summary, and " +
          "2) up to 2 short clarifying questions the submitter could answer to make the idea more filmable " +
          "(e.g. hook, length, format). Keep it very short and plain, no markdown headers.",
      },
      { role: "user", content: `Title: ${title}\nDescription: ${description}` },
    ]);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch {
    return new Response("AI request failed. Try again.", { status: 502 });
  }
}

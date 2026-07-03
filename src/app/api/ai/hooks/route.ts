import { NextResponse } from "next/server";
import { askOpenRouter } from "@/lib/openrouter";

export async function POST(req: Request) {
  const { title, description } = await req.json();
  try {
    const result = await askOpenRouter([
      {
        role: "system",
        content:
          "Given a short-form video idea, write 3 punchy first-3-seconds hook lines a creator could say on camera " +
          "to stop the scroll. One per line, no numbering, no extra commentary.",
      },
      { role: "user", content: `Title: ${title}\nDescription: ${description}` },
    ]);
    return NextResponse.json({ hooks: String(result).split("\n").map((s: string) => s.trim()).filter(Boolean) });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 502 });
  }
}

import { NextResponse } from "next/server";
import { askOpenRouter } from "@/lib/openrouter";
import { FORMATS } from "@/lib/types";

export async function POST(req: Request) {
  const { title, description } = await req.json();
  try {
    const raw = await askOpenRouter([
      {
        role: "system",
        content:
          `Pick exactly one of these format values that best fits the idea: ${FORMATS.map((f) => f.value).join(", ")}. ` +
          "Reply with only the value, nothing else.",
      },
      { role: "user", content: `Title: ${title}\nDescription: ${description}` },
    ]);
    const value = FORMATS.find((f) => raw.includes(f.value))?.value ?? null;
    return NextResponse.json({ format: value });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 502 });
  }
}

import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin";
import { generateFounderChatResponse } from "@/lib/agents/founderAgent";
import type { FounderChatMessage } from "@/types";

export async function POST(request: Request) {
  const email = request.headers.get("x-founder-email");
  if (!verifyAdminAccess(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { message, history = [] } = body as {
      message: string;
      history?: FounderChatMessage[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await generateFounderChatResponse(message, history);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Founder chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate founder agent response" },
      { status: 500 }
    );
  }
}

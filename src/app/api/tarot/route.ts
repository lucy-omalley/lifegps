import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { generateJsonFromAI } from "@/lib/discovery/ai";
import { generateMockTarotReading } from "@/lib/discovery/mock";
import {
  SELF_DISCOVERY_SYSTEM_PROMPT,
  TAROT_INTERPRETATION_PROMPT,
} from "@/lib/discovery/prompts";
import { drawTarotCards } from "@/lib/discovery/tarot";
import { tarotFromRow, tarotToRow } from "@/lib/supabase/discovery-mappers";
import type { TarotReading, TarotSpreadType } from "@/types/discovery";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase || !user) {
    return NextResponse.json({ reading: null });
  }

  const { data, error } = await supabase
    .from("tarot_readings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to load reading" }, { status: 500 });
  }

  return NextResponse.json({
    reading: data ? tarotFromRow(data) : null,
  });
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const body = await request.json();
    const { question, spreadType, userId: bodyUserId } = body as {
      question?: string;
      spreadType?: TarotSpreadType;
      userId?: string;
    };

    if (!question?.trim()) {
      return NextResponse.json(
        { error: "Please enter a question for reflection" },
        { status: 400 }
      );
    }

    const spread = spreadType ?? "three-card";
    const userId = user?.id ?? bodyUserId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cards = drawTarotCards(spread);

    let aiInterpretation: string;
    let actionReflection: string;

    if (process.env.OPENAI_API_KEY) {
      const result = await generateJsonFromAI<{
        aiInterpretation: string;
        actionReflection: string;
      }>(
        SELF_DISCOVERY_SYSTEM_PROMPT,
        TAROT_INTERPRETATION_PROMPT(question, cards)
      );
      aiInterpretation = result.aiInterpretation;
      actionReflection = result.actionReflection;
    } else {
      const mock = generateMockTarotReading(userId, question, cards, spread);
      aiInterpretation = mock.aiInterpretation;
      actionReflection = mock.actionReflection;
    }

    const reading: TarotReading = {
      id: crypto.randomUUID(),
      userId,
      question: question.trim(),
      spreadType: spread,
      cards,
      aiInterpretation,
      actionReflection,
      createdAt: new Date().toISOString(),
    };

    if (supabase && user) {
      const { error } = await supabase.from("tarot_readings").insert(tarotToRow(reading));
      if (error) console.error("Tarot save error:", error);
      await updateDiscoveryProgress(supabase, user.id, "tarot");
    }

    return NextResponse.json({ reading, persisted: Boolean(supabase && user) });
  } catch (error) {
    console.error("Tarot reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate tarot reading" },
      { status: 500 }
    );
  }
}

async function updateDiscoveryProgress(
  supabase: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>["supabase"]>,
  userId: string,
  moduleId: string
) {
  const { data } = await supabase
    .from("discovery_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const completed = (data?.completed_modules as string[] | null) ?? [];
  if (!completed.includes(moduleId)) completed.push(moduleId);

  await supabase.from("discovery_progress").upsert({
    user_id: userId,
    completed_modules: completed,
    free_module_used: data?.free_module_used || completed.length > 0,
    updated_at: new Date().toISOString(),
  });
}

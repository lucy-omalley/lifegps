import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { generateJsonFromAI } from "@/lib/discovery/ai";
import { generateMockNumerologySummary } from "@/lib/discovery/mock";
import {
  calculateExpressionNumber,
  calculateLifePathNumber,
  calculatePersonalYearNumber,
  calculateSoulNumber,
  LIFE_PATH_THEMES,
} from "@/lib/discovery/numerology";
import {
  NUMEROLOGY_SUMMARY_PROMPT,
  SELF_DISCOVERY_SYSTEM_PROMPT,
} from "@/lib/discovery/prompts";
import { numerologyFromRow, numerologyToRow } from "@/lib/supabase/discovery-mappers";
import type { NumerologyReading } from "@/types/discovery";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase || !user) {
    return NextResponse.json({ reading: null });
  }

  const { data, error } = await supabase
    .from("numerology_readings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to load reading" }, { status: 500 });
  }

  return NextResponse.json({
    reading: data ? numerologyFromRow(data) : null,
  });
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const body = await request.json();
    const { birthDate, fullName, userId: bodyUserId } = body as {
      birthDate?: string;
      fullName?: string;
      userId?: string;
    };

    if (!birthDate) {
      return NextResponse.json(
        { error: "Birth date is required" },
        { status: 400 }
      );
    }

    const userId = user?.id ?? bodyUserId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lifePathNumber = calculateLifePathNumber(birthDate);
    const personalYearNumber = calculatePersonalYearNumber(birthDate);
    const expressionNumber = fullName?.trim()
      ? calculateExpressionNumber(fullName)
      : undefined;
    const soulNumber = fullName?.trim()
      ? calculateSoulNumber(fullName)
      : undefined;
    const lifePathTheme =
      LIFE_PATH_THEMES[lifePathNumber] ?? "Personal growth and discovery";

    let aiSummary: string;

    if (process.env.OPENAI_API_KEY) {
      const result = await generateJsonFromAI<{ aiSummary: string }>(
        SELF_DISCOVERY_SYSTEM_PROMPT,
        NUMEROLOGY_SUMMARY_PROMPT({
          fullName,
          birthDate,
          lifePathNumber,
          expressionNumber,
          soulNumber,
          personalYearNumber,
          lifePathTheme,
        })
      );
      aiSummary = result.aiSummary;
    } else {
      const mock = generateMockNumerologySummary(userId, {
        fullName,
        birthDate,
        lifePathNumber,
        expressionNumber,
        soulNumber,
        personalYearNumber,
      });
      aiSummary = mock.aiSummary;
    }

    const reading: NumerologyReading = {
      id: crypto.randomUUID(),
      userId,
      fullName: fullName?.trim() || undefined,
      birthDate,
      lifePathNumber,
      expressionNumber,
      soulNumber,
      personalYearNumber,
      aiSummary,
      createdAt: new Date().toISOString(),
    };

    if (supabase && user) {
      const { error } = await supabase
        .from("numerology_readings")
        .insert(numerologyToRow(reading));
      if (error) console.error("Numerology save error:", error);
      await updateDiscoveryProgress(supabase, user.id, "numerology");
    }

    return NextResponse.json({ reading, persisted: Boolean(supabase && user) });
  } catch (error) {
    console.error("Numerology error:", error);
    return NextResponse.json(
      { error: "Failed to generate numerology reading" },
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

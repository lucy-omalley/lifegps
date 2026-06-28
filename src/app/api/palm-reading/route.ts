import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { generateJsonFromVision } from "@/lib/discovery/ai";
import { generateMockPalmReading } from "@/lib/discovery/mock";
import { PALM_READING_PROMPT, SELF_DISCOVERY_SYSTEM_PROMPT } from "@/lib/discovery/prompts";
import { palmFromRow, palmToRow } from "@/lib/supabase/discovery-mappers";
import type { PalmReading } from "@/types/discovery";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase || !user) {
    return NextResponse.json({ reading: null });
  }

  const { data, error } = await supabase
    .from("palm_readings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to load reading" }, { status: 500 });
  }

  return NextResponse.json({
    reading: data ? palmFromRow(data) : null,
  });
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const body = await request.json();
    const {
      leftHandImage,
      rightHandImage,
      userId: bodyUserId,
    } = body as {
      leftHandImage?: string;
      rightHandImage?: string;
      userId?: string;
    };

    if (!leftHandImage && !rightHandImage) {
      return NextResponse.json(
        { error: "Please upload at least one hand image" },
        { status: 400 }
      );
    }

    const userId = user?.id ?? bodyUserId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const imageUrls = [leftHandImage, rightHandImage].filter(Boolean) as string[];

    let readingData: Omit<PalmReading, "id" | "userId" | "createdAt">;

    if (process.env.OPENAI_API_KEY) {
      const result = await generateJsonFromVision<{
        extractedFeatures: Record<string, string>;
        aiSummary: string;
        strengths: string[];
        blindSpots: string[];
        careerInsights: string[];
        relationshipInsights: string[];
      }>(
        SELF_DISCOVERY_SYSTEM_PROMPT,
        PALM_READING_PROMPT,
        imageUrls
      );
      readingData = {
        leftHandImageUrl: leftHandImage,
        rightHandImageUrl: rightHandImage,
        ...result,
      };
    } else {
      const mock = generateMockPalmReading(userId);
      readingData = {
        leftHandImageUrl: leftHandImage,
        rightHandImageUrl: rightHandImage,
        extractedFeatures: mock.extractedFeatures,
        aiSummary: mock.aiSummary,
        strengths: mock.strengths,
        blindSpots: mock.blindSpots,
        careerInsights: mock.careerInsights,
        relationshipInsights: mock.relationshipInsights,
      };
    }

    const reading: PalmReading = {
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
      ...readingData,
    };

    if (supabase && user) {
      const { error } = await supabase.from("palm_readings").insert(palmToRow(reading));
      if (error) {
        console.error("Palm reading save error:", error);
      }
      await updateDiscoveryProgress(supabase, user.id, "palm");
    }

    return NextResponse.json({ reading, persisted: Boolean(supabase && user) });
  } catch (error) {
    console.error("Palm reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate palm reading. Please try again with a clearer image." },
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
  if (!completed.includes(moduleId)) {
    completed.push(moduleId);
  }

  await supabase.from("discovery_progress").upsert({
    user_id: userId,
    completed_modules: completed,
    free_module_used: data?.free_module_used || completed.length > 0,
    updated_at: new Date().toISOString(),
  });
}

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { generateJsonFromVision } from "@/lib/discovery/ai";
import { generateMockFaceReading } from "@/lib/discovery/mock";
import { FACE_READING_PROMPT, SELF_DISCOVERY_SYSTEM_PROMPT } from "@/lib/discovery/prompts";
import { faceFromRow, faceToRow } from "@/lib/supabase/discovery-mappers";
import type { FaceReading } from "@/types/discovery";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase || !user) {
    return NextResponse.json({ reading: null });
  }

  const { data, error } = await supabase
    .from("face_readings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to load reading" }, { status: 500 });
  }

  return NextResponse.json({
    reading: data ? faceFromRow(data) : null,
  });
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const body = await request.json();
    const { faceImage, userId: bodyUserId } = body as {
      faceImage?: string;
      userId?: string;
    };

    if (!faceImage) {
      return NextResponse.json(
        { error: "Please upload a front-facing photo" },
        { status: 400 }
      );
    }

    const userId = user?.id ?? bodyUserId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let readingData: Omit<FaceReading, "id" | "userId" | "createdAt">;

    if (process.env.OPENAI_API_KEY) {
      const result = await generateJsonFromVision<{
        extractedFeatures: Record<string, string>;
        aiSummary: string;
        confidenceInsights: string[];
        communicationInsights: string[];
        leadershipInsights: string[];
        stressPattern: string[];
      }>(
        SELF_DISCOVERY_SYSTEM_PROMPT,
        FACE_READING_PROMPT,
        [faceImage]
      );
      readingData = {
        faceImageUrl: faceImage,
        ...result,
      };
    } else {
      const mock = generateMockFaceReading(userId);
      readingData = {
        faceImageUrl: faceImage,
        extractedFeatures: mock.extractedFeatures,
        aiSummary: mock.aiSummary,
        confidenceInsights: mock.confidenceInsights,
        communicationInsights: mock.communicationInsights,
        leadershipInsights: mock.leadershipInsights,
        stressPattern: mock.stressPattern,
      };
    }

    const reading: FaceReading = {
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
      ...readingData,
    };

    if (supabase && user) {
      const { error } = await supabase.from("face_readings").insert(faceToRow(reading));
      if (error) console.error("Face reading save error:", error);
      await updateDiscoveryProgress(supabase, user.id, "face");
    }

    return NextResponse.json({ reading, persisted: Boolean(supabase && user) });
  } catch (error) {
    console.error("Face reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate face reading. Please try again with a clearer photo." },
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

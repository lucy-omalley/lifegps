import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { generateJsonFromAI } from "@/lib/discovery/ai";
import { generateMockUnifiedProfile } from "@/lib/discovery/mock";
import {
  SELF_DISCOVERY_SYSTEM_PROMPT,
  UNIFIED_PROFILE_PROMPT,
} from "@/lib/discovery/prompts";
import { calculateModuleWeights } from "@/lib/discovery/weights";
import {
  faceFromRow,
  numerologyFromRow,
  palmFromRow,
  tarotFromRow,
  unifiedFromRow,
  unifiedToRow,
} from "@/lib/supabase/discovery-mappers";
import type { DiscoveryModuleId, UnifiedProfile } from "@/types/discovery";
import type { CompassAssessment } from "@/types";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase || !user) {
    return NextResponse.json({ profile: null, progress: null });
  }

  const [profileRes, progressRes] = await Promise.all([
    supabase
      .from("unified_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("discovery_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    profile: profileRes.data ? unifiedFromRow(profileRes.data) : null,
    progress: progressRes.data
      ? {
          completedModules: (progressRes.data.completed_modules as DiscoveryModuleId[]) ?? [],
          freeModuleUsed: progressRes.data.free_module_used ?? false,
          isPremium: progressRes.data.is_premium ?? false,
        }
      : { completedModules: [], freeModuleUsed: false, isPremium: false },
  });
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const body = await request.json();
    const {
      userId: bodyUserId,
      palm,
      face,
      numerology,
      tarot,
      quiz,
      completedModules: bodyCompleted,
    } = body as {
      userId?: string;
      palm?: unknown;
      face?: unknown;
      numerology?: unknown;
      tarot?: unknown;
      quiz?: CompassAssessment;
      completedModules?: DiscoveryModuleId[];
    };

    const userId = user?.id ?? bodyUserId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let moduleData = { palm, face, numerology, tarot, quiz };
    let completedModules = bodyCompleted ?? [];

    if (supabase && user) {
      const [palmRes, faceRes, numRes, tarotRes, assessRes, progressRes] =
        await Promise.all([
          supabase
            .from("palm_readings")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("face_readings")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("numerology_readings")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("tarot_readings")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("assessments")
            .select("data")
            .eq("user_id", user.id)
            .order("completed_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("discovery_progress")
            .select("completed_modules")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

      moduleData = {
        palm: palmRes.data ? palmFromRow(palmRes.data) : palm,
        face: faceRes.data ? faceFromRow(faceRes.data) : face,
        numerology: numRes.data ? numerologyFromRow(numRes.data) : numerology,
        tarot: tarotRes.data ? tarotFromRow(tarotRes.data) : tarot,
        quiz: assessRes.data?.data ?? quiz,
      };
      completedModules =
        (progressRes.data?.completed_modules as DiscoveryModuleId[]) ??
        completedModules;
    }

    const detected: DiscoveryModuleId[] = [];
    if (moduleData.palm) detected.push("palm");
    if (moduleData.face) detected.push("face");
    if (moduleData.numerology) detected.push("numerology");
    if (moduleData.tarot) detected.push("tarot");
    if (moduleData.quiz) detected.push("quiz");

    const completed =
      completedModules.length > 0 ? completedModules : detected;

    if (completed.length === 0) {
      return NextResponse.json(
        { error: "Complete at least one self-discovery module first" },
        { status: 400 }
      );
    }

    const weights = calculateModuleWeights(completed);

    let profileContent: Omit<
      UnifiedProfile,
      "id" | "userId" | "completedModules" | "weights" | "createdAt" | "updatedAt"
    >;

    if (process.env.OPENAI_API_KEY) {
      profileContent = await generateJsonFromAI(
        SELF_DISCOVERY_SYSTEM_PROMPT,
        UNIFIED_PROFILE_PROMPT({ weights, ...moduleData })
      );
    } else {
      const mock = generateMockUnifiedProfile(
        userId,
        completed,
        weights,
        moduleData as Parameters<typeof generateMockUnifiedProfile>[3]
      );
      profileContent = {
        unifiedSummary: mock.unifiedSummary,
        topStrengths: mock.topStrengths,
        blindSpots: mock.blindSpots,
        careerDirection: mock.careerDirection,
        relationshipStyle: mock.relationshipStyle,
        moneyStyle: mock.moneyStyle,
        growthRecommendations: mock.growthRecommendations,
        stressPattern: mock.stressPattern,
        blueprintConfidenceScore: mock.blueprintConfidenceScore,
      };
    }

    const now = new Date().toISOString();
    const profile: UnifiedProfile = {
      id: crypto.randomUUID(),
      userId,
      completedModules: completed,
      weights: weights as UnifiedProfile["weights"],
      createdAt: now,
      updatedAt: now,
      ...profileContent,
    };

    if (supabase && user) {
      const { error } = await supabase.from("unified_profiles").insert(
        unifiedToRow(profile)
      );
      if (error) console.error("Unified profile save error:", error);
    }

    return NextResponse.json({ profile, persisted: Boolean(supabase && user) });
  } catch (error) {
    console.error("Unified profile error:", error);
    return NextResponse.json(
      { error: "Failed to generate unified profile" },
      { status: 500 }
    );
  }
}

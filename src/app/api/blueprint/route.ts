import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai/client";
import {
  LIFEGPS_SYSTEM_PROMPT,
  BLUEPRINT_USER_PROMPT,
  BLUEPRINT_REFINE_PROMPT,
} from "@/lib/openai/prompts";
import { formatDimensionScoresForDisplay } from "@/lib/compass/scoring";
import { canGenerateFullBlueprint } from "@/lib/features";
import { blueprintFromRow, blueprintToRow } from "@/lib/supabase/mappers";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import type { CompassAssessment, LifeBlueprint } from "@/types";
import type { DiscoveryProgress, UnifiedProfile } from "@/types/discovery";

function generateMockBlueprint(
  assessment: CompassAssessment,
  userId: string,
  unifiedProfile?: UnifiedProfile | null
): LifeBlueprint {
  const results = assessment.results!;
  const id = crypto.randomUUID();
  const firstOutcome =
    assessment.answers.find((a) => a.questionId === 50)?.selectedAnswer ??
    unifiedProfile?.growthRecommendations[0] ??
    "More clarity";

  const showSideBusiness =
    results.sideBusinessReadiness.includes("High") ||
    results.sideBusinessReadiness.includes("Active") ||
    results.sideBusinessReadiness.includes("Exploring");

  const showCommunication =
    results.dimensionScores.communicationConfidence < 65 ||
    results.topGrowthAreas.some((g) => g.includes("Communication"));

  const showBurnout =
    results.burnoutRisk === "Medium" || results.burnoutRisk === "High";

  const showFinancial =
    results.dimensionScores.financialFreedom >= 50 ||
    results.financialFreedomReadiness.includes("Developing") ||
    results.financialFreedomReadiness.includes("Strong");

  const unifiedNote = unifiedProfile
    ? ` Your self-discovery profile (${unifiedProfile.completedModules.length} modules) reinforces themes around ${unifiedProfile.topStrengths.slice(0, 2).join(" and ")}.`
    : "";

  return {
    id,
    userId,
    assessmentId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    archetype: results.archetype,
    archetypeSummary: `As ${results.archetype}, ${results.archetypeDescription} Your Compass profile shows strengths in ${results.topStrengths.join(" and ")}, with growth opportunities in ${results.topGrowthAreas.join(" and ")}.${unifiedNote}`,
    compassScoreOverview: formatDimensionScoresForDisplay(
      results.dimensionScores
    ),
    futureSelfSummary: `In five years, you have moved from uncertainty toward ${firstOutcome.toLowerCase()}. Your ${results.archetype.replace("The ", "").toLowerCase()} energy has guided you to build a life aligned with your values — with clearer direction, stronger habits, and meaningful progress in your priority areas.`,
    currentStateAnalysis: `Your Compass assessment reveals a ${results.burnoutRisk.toLowerCase()} burnout risk profile. ${results.executionStyle}. Career energy scores ${results.dimensionScores.careerEnergy}/100, while energy & lifestyle sits at ${results.dimensionScores.energyLifestyle}/100. You are ${results.financialFreedomReadiness.toLowerCase()} regarding financial freedom, and ${results.sideBusinessReadiness.toLowerCase()} on side business exploration.`,
    dreamLifeVision: `Your dream life centres on ${results.topStrengths[0]?.toLowerCase() ?? "purpose"} while addressing ${results.topGrowthAreas[0]?.toLowerCase() ?? "key growth areas"}. The first outcome you want from your blueprint is: ${firstOutcome}.`,
    gapAnalysis: `Key gaps exist between your current scores and your desired future. Focus areas: ${results.topGrowthAreas.join(" and ")}. Your ${results.burnoutRisk.toLowerCase()} burnout risk suggests ${showBurnout ? "energy recovery should be prioritised alongside goal pursuit" : "you have reasonable energy to pursue ambitious goals"}.`,
    fiveYearRoadmap: [
      "Year 1: Stabilise energy, clarify direction, establish core habits",
      "Year 2: Build skills in growth areas, explore side income options",
      "Year 3: Accelerate career or business transition, deepen confidence",
      "Year 4: Scale what works, reduce dependence on unsatisfying work",
      "Year 5: Achieve your primary life outcome with sustainable systems",
    ],
    twelveMonthPlan: [
      "Q1: Complete Compass-aligned goals audit and 90-day sprint",
      "Q2: Launch one experiment in your top growth area",
      "Q3: Build accountability systems and refine weekly rhythm",
      "Q4: Evaluate progress and plan Year 2 transition",
    ],
    ninetyDayActionPlan: [
      "Week 1-2: Define your top 3 priorities from Compass growth areas",
      "Week 3-4: Block protected time for your highest-leverage habit",
      "Week 5-8: Take one bold action toward your first desired outcome",
      "Week 9-10: Review dimension scores and adjust your approach",
      "Week 11-12: Celebrate wins and set next 90-day focus",
    ],
    sevenDayStarterPlan: [
      "Days 1-2: Write your one-sentence vision and share it with someone you trust",
      "Days 3-4: Complete one small action in your weakest Compass dimension",
      "Days 5-7: Establish one daily habit from your blueprint and track it",
    ],
    dailyHabits: [
      "10-minute morning intention aligned with your archetype",
      "One focused block on your top growth area",
      "Evening reflection: one win, one lesson, one tomorrow priority",
    ],
    weeklyCheckInQuestions: [
      "What progress did I make on my top growth area this week?",
      "What drained my energy, and how can I protect against it?",
      "What is the one priority that would make next week a success?",
    ],
    weeklyPriorities: [
      "Protect 2 hours for deep work on personal goals",
      "Complete one learning or practice session in a growth area",
      "Have one meaningful conversation about your future direction",
    ],
    sideBusinessDirection: showSideBusiness
      ? "Based on your side business readiness, start with a low-risk experiment: validate one idea with 5 conversations before building anything. Focus on your preferred working style from the assessment."
      : "",
    communicationGrowthPlan: showCommunication
      ? "Practice one communication skill weekly: start with speaking up once in every meeting, or rehearsing key messages before important conversations. Consider a communication coach or course."
      : "",
    burnoutRecoveryActions: showBurnout
      ? "Prioritise recovery: set one non-negotiable boundary this week, schedule daily 15-minute breaks, and reduce one draining commitment. Seek professional support if burnout feels unmanageable."
      : "",
    financialFreedomNotes: showFinancial
      ? "Build your financial foundation: track spending for 30 days, establish or grow an emergency fund, and explore one side income stream aligned with your skills. Consult a qualified financial adviser for personalised investment guidance."
      : "",
    recommendedFirstStep: `Today: identify the smallest action toward "${firstOutcome}" that you can complete in the next 24 hours. Write it down and schedule it.`,
  };
}

function generateMockBlueprintFromProfile(
  userId: string,
  unifiedProfile: UnifiedProfile
): LifeBlueprint {
  return {
    id: crypto.randomUUID(),
    userId,
    assessmentId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    archetype: "The Purpose Explorer",
    archetypeSummary: unifiedProfile.unifiedSummary,
    compassScoreOverview: `Self-discovery confidence score: ${unifiedProfile.blueprintConfidenceScore}/100. Modules completed: ${unifiedProfile.completedModules.join(", ")}.`,
    futureSelfSummary: `In five years, you embody the strengths reflected in your self-discovery journey — particularly ${unifiedProfile.topStrengths[0]?.toLowerCase() ?? "personal growth"}.`,
    currentStateAnalysis: `Your blind spots may include ${unifiedProfile.blindSpots.join(" and ").toLowerCase()}. Stress patterns suggest ${unifiedProfile.stressPattern[0]?.toLowerCase() ?? "awareness of energy management"}.`,
    dreamLifeVision: unifiedProfile.careerDirection[0] ?? "A life aligned with your authentic strengths",
    gapAnalysis: `Focus growth on ${unifiedProfile.growthRecommendations.join("; ")}.`,
    fiveYearRoadmap: [
      "Year 1: Build foundational habits and clarify direction",
      "Year 2: Develop skills in priority growth areas",
      "Year 3: Expand career and relationship alignment",
      "Year 4: Scale what works and release what doesn't",
      "Year 5: Live with intentional balance and purpose",
    ],
    twelveMonthPlan: unifiedProfile.growthRecommendations.slice(0, 4).length >= 4
      ? unifiedProfile.growthRecommendations.slice(0, 4)
      : [
          "Q1: Establish core reflection and planning habits",
          "Q2: Pursue one career or skill experiment",
          "Q3: Strengthen relationships and communication",
          "Q4: Review and refine your life direction",
        ],
    ninetyDayActionPlan: unifiedProfile.growthRecommendations,
    sevenDayStarterPlan: [
      "Days 1-2: Review your unified self-discovery profile",
      "Days 3-4: Choose one strength to lean into this week",
      "Days 5-7: Take one small action on a growth recommendation",
    ],
    dailyHabits: [
      "5-minute morning intention setting",
      "One focused block on a growth priority",
      "Evening gratitude and reflection",
    ],
    weeklyCheckInQuestions: [
      "What did I learn about myself this week?",
      "What pattern do I want to change?",
      "What is my one priority for next week?",
    ],
    weeklyPriorities: unifiedProfile.growthRecommendations.slice(0, 3),
    recommendedFirstStep: unifiedProfile.growthRecommendations[0] ?? "Review your self-discovery profile and choose one action for today.",
  };
}

function limitBlueprintForPreview(blueprint: LifeBlueprint): LifeBlueprint {
  return {
    ...blueprint,
    fiveYearRoadmap: blueprint.fiveYearRoadmap.slice(0, 2),
    twelveMonthPlan: blueprint.twelveMonthPlan.slice(0, 2),
    ninetyDayActionPlan: blueprint.ninetyDayActionPlan.slice(0, 2),
    sevenDayStarterPlan: blueprint.sevenDayStarterPlan.slice(0, 1),
    dailyHabits: blueprint.dailyHabits.slice(0, 2),
    archetypeSummary: blueprint.archetypeSummary.slice(0, 400) + "...",
  };
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!supabase || !user) {
    return NextResponse.json({ blueprint: null, source: "none" });
  }

  const { data, error } = await supabase
    .from("life_blueprints")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Load blueprint error:", error);
    return NextResponse.json(
      { error: "Failed to load blueprint" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ blueprint: null, source: "database" });
  }

  return NextResponse.json({
    blueprint: blueprintFromRow(data),
    source: "database",
  });
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const body = await request.json();
    const {
      assessment,
      unifiedProfile,
      feedback,
      userId: bodyUserId,
      progress,
    } = body as {
      assessment?: CompassAssessment;
      unifiedProfile?: UnifiedProfile;
      feedback?: string;
      userId?: string;
      progress?: DiscoveryProgress;
    };

    const userId = user?.id ?? bodyUserId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasAssessment =
      assessment?.results && assessment.answers.length >= 50;
    const hasProfile = Boolean(unifiedProfile);

    if (!hasAssessment && !hasProfile) {
      return NextResponse.json(
        { error: "Complete self-discovery modules or the personality quiz first" },
        { status: 400 }
      );
    }

    const isFullBlueprint = canGenerateFullBlueprint(progress);
    const isPreview = !isFullBlueprint;

    let blueprintData: Omit<
      LifeBlueprint,
      "id" | "userId" | "assessmentId" | "createdAt" | "archetype"
    >;

    if (process.env.OPENAI_API_KEY && hasAssessment) {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: LIFEGPS_SYSTEM_PROMPT },
          {
            role: "user",
            content: BLUEPRINT_USER_PROMPT(
              assessment!,
              unifiedProfile,
              feedback,
              isPreview
            ),
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from OpenAI");
      blueprintData = JSON.parse(content);
    } else if (hasAssessment) {
      const mock = generateMockBlueprint(assessment!, userId, unifiedProfile);
      const {
        id: _id,
        userId: _uid,
        assessmentId: _aid,
        createdAt: _ca,
        archetype: _arch,
        ...rest
      } = mock;
      blueprintData = rest;
    } else {
      const mock = generateMockBlueprintFromProfile(userId, unifiedProfile!);
      const {
        id: _id,
        userId: _uid,
        assessmentId: _aid,
        createdAt: _ca,
        archetype: _arch,
        ...rest
      } = mock;
      blueprintData = rest;
    }

    const assessmentId = crypto.randomUUID();
    let blueprint: LifeBlueprint = {
      id: crypto.randomUUID(),
      userId,
      assessmentId,
      createdAt: new Date().toISOString(),
      archetype:
        assessment?.results?.archetype ?? ("The Purpose Explorer" as const),
      ...blueprintData,
    };

    if (isPreview) {
      blueprint = limitBlueprintForPreview(blueprint);
    }

    if (supabase && user) {
      if (hasAssessment) {
        const { error: assessmentError } = await supabase
          .from("assessments")
          .insert({
            id: assessmentId,
            user_id: user.id,
            data: assessment,
            is_complete: true,
            completed_at: assessment!.completedAt ?? new Date().toISOString(),
          });

        if (assessmentError) {
          console.error("Assessment insert error:", assessmentError);
        }
      }

      const row = blueprintToRow(blueprint, assessmentId);
      const { error: blueprintError } = await supabase
        .from("life_blueprints")
        .insert(row);

      if (blueprintError) {
        console.error("Blueprint insert error:", blueprintError);
        throw new Error("Failed to save blueprint");
      }

      await supabase.from("compass_sessions").delete().eq("user_id", user.id);
    }

    return NextResponse.json({
      blueprint,
      persisted: Boolean(supabase && user),
      isPreview,
    });
  } catch (error) {
    console.error("Blueprint generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate life blueprint" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const body = await request.json();
    const { blueprint, feedback, progress } = body as {
      blueprint: LifeBlueprint;
      feedback: string;
      progress?: DiscoveryProgress;
    };

    if (!blueprint || !feedback?.trim()) {
      return NextResponse.json(
        { error: "Blueprint and feedback are required" },
        { status: 400 }
      );
    }

    if (!canGenerateFullBlueprint(progress)) {
      return NextResponse.json(
        { error: "Blueprint refinement is a premium feature" },
        { status: 403 }
      );
    }

    let refinedData: Omit<
      LifeBlueprint,
      "id" | "userId" | "assessmentId" | "createdAt" | "archetype"
    >;

    if (process.env.OPENAI_API_KEY) {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: LIFEGPS_SYSTEM_PROMPT },
          {
            role: "user",
            content: BLUEPRINT_REFINE_PROMPT(blueprint, feedback),
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from OpenAI");
      refinedData = JSON.parse(content);
    } else {
      refinedData = {
        archetypeSummary: blueprint.archetypeSummary + ` (Refined based on: ${feedback})`,
        compassScoreOverview: blueprint.compassScoreOverview,
        futureSelfSummary: blueprint.futureSelfSummary,
        currentStateAnalysis: blueprint.currentStateAnalysis,
        dreamLifeVision: blueprint.dreamLifeVision,
        gapAnalysis: blueprint.gapAnalysis,
        fiveYearRoadmap: blueprint.fiveYearRoadmap,
        twelveMonthPlan: blueprint.twelveMonthPlan,
        ninetyDayActionPlan: blueprint.ninetyDayActionPlan,
        sevenDayStarterPlan: blueprint.sevenDayStarterPlan,
        dailyHabits: blueprint.dailyHabits,
        weeklyCheckInQuestions: blueprint.weeklyCheckInQuestions,
        weeklyPriorities: blueprint.weeklyPriorities,
        sideBusinessDirection: blueprint.sideBusinessDirection,
        communicationGrowthPlan: blueprint.communicationGrowthPlan,
        burnoutRecoveryActions: blueprint.burnoutRecoveryActions,
        financialFreedomNotes: blueprint.financialFreedomNotes,
        recommendedFirstStep: blueprint.recommendedFirstStep,
      };
    }

    const refined: LifeBlueprint = {
      ...blueprint,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      archetype: blueprint.archetype,
      ...refinedData,
    };

    if (supabase && user) {
      const row = blueprintToRow(refined, blueprint.assessmentId);
      await supabase.from("life_blueprints").insert(row);
    }

    return NextResponse.json({ blueprint: refined });
  } catch (error) {
    console.error("Blueprint refine error:", error);
    return NextResponse.json(
      { error: "Failed to refine blueprint" },
      { status: 500 }
    );
  }
}

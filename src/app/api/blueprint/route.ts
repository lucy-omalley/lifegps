import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai/client";
import {
  LIFEGPS_SYSTEM_PROMPT,
  BLUEPRINT_USER_PROMPT,
} from "@/lib/openai/prompts";
import { formatDimensionScoresForDisplay } from "@/lib/compass/scoring";
import { blueprintFromRow, blueprintToRow } from "@/lib/supabase/mappers";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import type { CompassAssessment, LifeBlueprint } from "@/types";

function generateMockBlueprint(
  assessment: CompassAssessment,
  userId: string
): LifeBlueprint {
  const results = assessment.results!;
  const id = crypto.randomUUID();
  const firstOutcome =
    assessment.answers.find((a) => a.questionId === 50)?.selectedAnswer ??
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

  return {
    id,
    userId,
    assessmentId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    archetype: results.archetype,
    archetypeSummary: `As ${results.archetype}, ${results.archetypeDescription} Your Compass profile shows strengths in ${results.topStrengths.join(" and ")}, with growth opportunities in ${results.topGrowthAreas.join(" and ")}.`,
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
    const { assessment, userId: bodyUserId } = body as {
      assessment: CompassAssessment;
      userId?: string;
    };

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment data is required" },
        { status: 400 }
      );
    }

    if (!assessment.results || assessment.answers.length < 50) {
      return NextResponse.json(
        { error: "Complete Compass assessment with results is required" },
        { status: 400 }
      );
    }

    const userId = user?.id ?? bodyUserId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let blueprintData: Omit<
      LifeBlueprint,
      "id" | "userId" | "assessmentId" | "createdAt" | "archetype"
    >;

    if (process.env.OPENAI_API_KEY) {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: LIFEGPS_SYSTEM_PROMPT },
          { role: "user", content: BLUEPRINT_USER_PROMPT(assessment) },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      blueprintData = JSON.parse(content);
    } else {
      const mock = generateMockBlueprint(assessment, userId);
      blueprintData = {
        archetypeSummary: mock.archetypeSummary,
        compassScoreOverview: mock.compassScoreOverview,
        futureSelfSummary: mock.futureSelfSummary,
        currentStateAnalysis: mock.currentStateAnalysis,
        dreamLifeVision: mock.dreamLifeVision,
        gapAnalysis: mock.gapAnalysis,
        fiveYearRoadmap: mock.fiveYearRoadmap,
        twelveMonthPlan: mock.twelveMonthPlan,
        ninetyDayActionPlan: mock.ninetyDayActionPlan,
        sevenDayStarterPlan: mock.sevenDayStarterPlan,
        dailyHabits: mock.dailyHabits,
        weeklyCheckInQuestions: mock.weeklyCheckInQuestions,
        weeklyPriorities: mock.weeklyPriorities,
        sideBusinessDirection: mock.sideBusinessDirection,
        communicationGrowthPlan: mock.communicationGrowthPlan,
        burnoutRecoveryActions: mock.burnoutRecoveryActions,
        financialFreedomNotes: mock.financialFreedomNotes,
        recommendedFirstStep: mock.recommendedFirstStep,
      };
    }

    const assessmentId = crypto.randomUUID();
    const blueprint: LifeBlueprint = {
      id: crypto.randomUUID(),
      userId,
      assessmentId,
      createdAt: new Date().toISOString(),
      archetype: assessment.results.archetype,
      ...blueprintData,
    };

    if (supabase && user) {
      const { error: assessmentError } = await supabase
        .from("assessments")
        .insert({
          id: assessmentId,
          user_id: user.id,
          data: assessment,
          is_complete: true,
          completed_at: assessment.completedAt ?? new Date().toISOString(),
        });

      if (assessmentError) {
        console.error("Assessment insert error:", assessmentError);
        throw new Error("Failed to save assessment");
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

    return NextResponse.json({ blueprint, persisted: Boolean(supabase && user) });
  } catch (error) {
    console.error("Blueprint generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate life blueprint" },
      { status: 500 }
    );
  }
}

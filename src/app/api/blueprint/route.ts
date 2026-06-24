import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai/client";
import {
  LIFEGPS_SYSTEM_PROMPT,
  BLUEPRINT_USER_PROMPT,
} from "@/lib/openai/prompts";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AssessmentData, LifeBlueprint } from "@/types";

function generateMockBlueprint(
  assessment: AssessmentData,
  userId: string
): LifeBlueprint {
  const id = crypto.randomUUID();
  return {
    id,
    userId,
    assessmentId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    futureSelfSummary: `${assessment.name || "You"} have transformed from ${assessment.currentJob || "your current role"} into someone living ${assessment.desiredCareer || "your dream career"}. In five years, you've built the life you described: ${assessment.idealLife?.slice(0, 120) || "a balanced, fulfilling life"}... You've escaped the burnout cycle and now operate with clarity and purpose.`,
    currentStateAnalysis: `You're currently working as ${assessment.currentJob || "a professional"} with career satisfaction at ${assessment.careerSatisfaction}/10 and energy/burnout at ${assessment.energyBurnout}/10. Your strengths in ${assessment.keyStrengths || "your core skills"} position you well, though ${assessment.weaknesses || "some challenges"} need attention. Financially: ${assessment.financialSituation || "stable but seeking growth"}.`,
    dreamLifeVision: assessment.idealLife || `A life where you thrive in ${assessment.desiredCareer}, earning ${assessment.desiredIncome}, with ${assessment.workLifeBalance} work-life balance. Your biggest dream: ${assessment.biggestDream}.`,
    gapAnalysis: `Key gaps: ${assessment.skillsGaps || "skill development needed"}. Barriers include ${assessment.whatIsStopping || "uncertainty"}. Time constraints: ${assessment.timeConstraints || "limited bandwidth"}. Confidence: ${assessment.confidenceIssues || "building self-belief"}.`,
    fiveYearRoadmap: [
      "Year 1: Stabilize energy, clarify direction, start side exploration",
      "Year 2: Build skills, launch side project, improve communication",
      "Year 3: Transition or scale side business, increase income 30%",
      "Year 4: Establish new career path, build passive income streams",
      `Year 5: Achieve ${assessment.earlyRetirementGoal || "financial independence milestone"}`,
    ],
    twelveMonthPlan: [
      "Q1: Complete skills audit, reduce burnout, define 90-day goals",
      "Q2: Launch first side business experiment, network actively",
      "Q3: Refine offering, improve work-life boundaries",
      "Q4: Evaluate progress, plan Year 2 transition",
    ],
    ninetyDayActionPlan: [
      "Week 1-2: Block 30 min daily for life planning and reflection",
      `Research ${assessment.sideBusinessIdeas || "side business options"} — talk to 3 people doing it`,
      "Identify one skill gap and enroll in a course or mentorship",
      "Set one boundary to improve work-life balance this month",
      "Take one small action toward your biggest dream today",
    ].slice(0, 5) as string[],
    weeklyPriorities: [
      "Protect 2 hours for deep work on personal goals",
      "Complete one learning module or skill practice session",
      "Have one meaningful conversation about your future direction",
    ],
    dailyHabits: [
      "10-minute morning intention setting",
      "30-minute walk or movement break",
      "Evening reflection: one win, one lesson",
      "Read 15 minutes on career or business growth",
    ],
    recommendedFirstStep: `Start today: write down your version of "${assessment.biggestDream || "your dream"}" in one sentence, then identify the smallest possible action you can take in the next 24 hours.`,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assessment, userId } = body as {
      assessment: AssessmentData;
      userId: string;
    };

    if (!assessment || !userId) {
      return NextResponse.json(
        { error: "Assessment data and userId are required" },
        { status: 400 }
      );
    }

    let blueprintData: Omit<
      LifeBlueprint,
      "id" | "userId" | "assessmentId" | "createdAt"
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
        futureSelfSummary: mock.futureSelfSummary,
        currentStateAnalysis: mock.currentStateAnalysis,
        dreamLifeVision: mock.dreamLifeVision,
        gapAnalysis: mock.gapAnalysis,
        fiveYearRoadmap: mock.fiveYearRoadmap,
        twelveMonthPlan: mock.twelveMonthPlan,
        ninetyDayActionPlan: mock.ninetyDayActionPlan,
        weeklyPriorities: mock.weeklyPriorities,
        dailyHabits: mock.dailyHabits,
        recommendedFirstStep: mock.recommendedFirstStep,
      };
    }

    const assessmentId = crypto.randomUUID();
    const blueprint: LifeBlueprint = {
      id: crypto.randomUUID(),
      userId,
      assessmentId,
      createdAt: new Date().toISOString(),
      ...blueprintData,
    };

    // TODO: Persist to Supabase when configured
    const supabase = createServerSupabaseClient();
    if (supabase) {
      await supabase.from("assessments").insert({
        id: assessmentId,
        user_id: userId,
        data: assessment,
      });
      await supabase.from("life_blueprints").insert({
        id: blueprint.id,
        user_id: userId,
        assessment_id: assessmentId,
        future_self_summary: blueprint.futureSelfSummary,
        current_state_analysis: blueprint.currentStateAnalysis,
        dream_life_vision: blueprint.dreamLifeVision,
        gap_analysis: blueprint.gapAnalysis,
        five_year_roadmap: blueprint.fiveYearRoadmap,
        twelve_month_plan: blueprint.twelveMonthPlan,
        ninety_day_action_plan: blueprint.ninetyDayActionPlan,
        weekly_priorities: blueprint.weeklyPriorities,
        daily_habits: blueprint.dailyHabits,
        recommended_first_step: blueprint.recommendedFirstStep,
      });
    }

    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error("Blueprint generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate life blueprint" },
      { status: 500 }
    );
  }
}

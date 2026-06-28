import { getOpenAIClient } from "@/lib/openai/client";
import {
  LIFEGPS_SYSTEM_PROMPT,
  BLUEPRINT_USER_PROMPT,
  COACH_USER_PROMPT,
} from "@/lib/openai/prompts";
import { formatDimensionScoresForDisplay } from "@/lib/compass/scoring";
import type { CompassAssessment, LifeBlueprint } from "@/types";

export type CheckinInput = {
  progress: string;
  blockers: string;
  supportNeeded: string;
  nextPriority: string;
};

export function generateMockBlueprint(
  assessment: CompassAssessment,
  userId: string
): LifeBlueprint {
  const results = assessment.results!;
  const id = crypto.randomUUID();
  const firstOutcome =
    assessment.answers.find((a) => a.questionId === 19)?.selectedAnswer ??
    "More clarity";

  const showSideBusiness =
    results.adaptiveSignals?.sideBusiness ||
    results.sideBusinessReadiness.includes("High") ||
    results.sideBusinessReadiness.includes("Exploring");

  const showCommunication =
    results.dimensionScores.communication < 65 ||
    results.topGrowthAreas.some((g) => g.includes("Communication"));

  const showBurnout =
    results.burnoutRisk === "Medium" || results.burnoutRisk === "High";

  const showFinancial =
    results.dimensionScores.freedom >= 50 ||
    results.adaptiveSignals?.earlyRetirement ||
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
    futureSelfSummary: `In five years, you have moved from uncertainty toward ${firstOutcome.toLowerCase()}.`,
    currentStateAnalysis: `Burnout risk: ${results.burnoutRisk}. ${results.executionStyle}.`,
    dreamLifeVision: `Your dream life centres on ${results.topStrengths[0]?.toLowerCase() ?? "purpose"}. First outcome wanted: ${firstOutcome}.`,
    gapAnalysis: `Focus areas: ${results.topGrowthAreas.join(" and ")}.`,
    fiveYearRoadmap: [
      "Year 1: Stabilise energy and clarify direction",
      "Year 2: Build skills in growth areas",
      "Year 3: Accelerate career or business transition",
      "Year 4: Scale what works",
      "Year 5: Achieve primary life outcome",
    ],
    twelveMonthPlan: ["Q1: Audit", "Q2: Experiment", "Q3: Accountability", "Q4: Evaluate"],
    ninetyDayActionPlan: [
      "Define top 3 priorities",
      "Block protected habit time",
      "Take one bold action",
      "Review scores",
      "Celebrate wins",
    ],
    sevenDayStarterPlan: [
      "Days 1-2: Write one-sentence vision",
      "Days 3-4: One action in weakest dimension",
      "Days 5-7: Start one daily habit",
    ],
    dailyHabits: [
      "10-minute morning intention",
      "One focused growth block",
      "Evening reflection",
    ],
    weeklyCheckInQuestions: [
      "What progress on my growth area?",
      "What drained my energy?",
      "What makes next week a success?",
    ],
    weeklyPriorities: [
      "Protect 2 hours for personal goals",
      "One learning session",
      "One future-direction conversation",
    ],
    sideBusinessDirection: showSideBusiness
      ? "Validate one side business idea with 5 conversations before building."
      : "",
    communicationGrowthPlan: showCommunication
      ? "Practice speaking up once per meeting this week."
      : "",
    burnoutRecoveryActions: showBurnout
      ? "Set one non-negotiable boundary and schedule daily 15-minute breaks."
      : "",
    financialFreedomNotes: showFinancial
      ? "Track spending 30 days and grow emergency fund. Consult a qualified adviser for investments."
      : "",
    recommendedFirstStep: `Today: smallest action toward "${firstOutcome}" in 24 hours.`,
  };
}

export async function generateBlueprint(
  assessment: CompassAssessment
): Promise<
  Omit<LifeBlueprint, "id" | "userId" | "assessmentId" | "createdAt" | "archetype">
> {
  if (!process.env.OPENAI_API_KEY) {
    const mock = generateMockBlueprint(assessment, "mock");
    const { id, userId, assessmentId, createdAt, archetype, ...data } = mock;
    void id;
    void userId;
    void assessmentId;
    void createdAt;
    void archetype;
    return data;
  }

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
  if (!content) throw new Error("No response from OpenAI");
  return JSON.parse(content);
}

export function generateMockCoachResponse(checkin: CheckinInput): string {
  return `**Great work showing up this week!**

Progress: ${checkin.progress || "Staying committed"}.

**Blockers:** ${checkin.blockers || "General resistance"} — try a 15-minute micro-action.

**Support:** ${checkin.supportNeeded || "More clarity"} — consider an accountability partner.

**Next week:** ${checkin.nextPriority || "One concrete blueprint step"}. Block time on your calendar now.

Keep navigating forward. 🧭`;
}

export async function generateCoachResponse(
  checkin: CheckinInput
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return generateMockCoachResponse(checkin);
  }

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: LIFEGPS_SYSTEM_PROMPT },
      { role: "user", content: COACH_USER_PROMPT(checkin) },
    ],
    temperature: 0.8,
  });

  return (
    completion.choices[0]?.message?.content ||
    generateMockCoachResponse(checkin)
  );
}

/** TODO: Recalculate blueprint from user feedback ratings and reflection */
export async function recalculateBlueprintFromFeedback(_params: {
  assessment: CompassAssessment;
  previousBlueprint: LifeBlueprint;
  feedback: {
    overallRating: number;
    sectionRatings: Record<string, number>;
    reflection?: string;
  };
}): Promise<LifeBlueprint> {
  throw new Error(
    "Blueprint recalculation not yet implemented — TODO in lifegpsCoachAgent"
  );
}

/** TODO: Multi-turn blueprint chat support */
export async function generateBlueprintChatResponse(_params: {
  blueprint: LifeBlueprint;
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
}): Promise<string> {
  throw new Error(
    "Blueprint chat not yet implemented — TODO in lifegpsCoachAgent"
  );
}

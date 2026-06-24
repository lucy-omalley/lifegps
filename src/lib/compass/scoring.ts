import { ARCHETYPES } from "@/lib/compass/archetypes";
import { DIMENSION_LABELS, DIMENSION_ORDER } from "@/lib/compass/dimensions";
import { COMPASS_QUESTIONS, getQuestionById } from "@/lib/compass/questions";
import type {
  BurnoutRisk,
  CompassAnswer,
  CompassDimension,
  CompassResults,
  DimensionScores,
  LifeGPSArchetype,
} from "@/types";

function getAnswerScore(answer: CompassAnswer): number {
  if (typeof answer.answerValue === "number") {
    // Scale questions — inverted for Q24 (confidence limiting life)
    if (answer.questionId === 24) {
      return (11 - answer.answerValue) * 10;
    }
    return answer.answerValue * 10;
  }

  if (Array.isArray(answer.answerValue)) {
    const question = getQuestionById(answer.questionId);
    if (!question?.options) return 50;
    const selected = answer.answerValue as string[];
    const scores = selected
      .map((val) => question.options!.find((o) => o.value === val)?.score ?? 50)
      .filter(Boolean);
    return scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 50;
  }

  const question = getQuestionById(answer.questionId);
  const option = question?.options?.find((o) => o.value === answer.answerValue);
  return option?.score ?? 50;
}

export function calculateDimensionScores(
  answers: CompassAnswer[]
): DimensionScores {
  const buckets: Record<CompassDimension, number[]> = {
    purpose: [],
    careerEnergy: [],
    growth: [],
    communicationConfidence: [],
    businessCreativity: [],
    financialFreedom: [],
    energyLifestyle: [],
    execution: [],
  };

  for (const answer of answers) {
    buckets[answer.dimension].push(getAnswerScore(answer));
  }

  const scores = {} as DimensionScores;
  for (const dim of DIMENSION_ORDER) {
    const values = buckets[dim];
    scores[dim] =
      values.length > 0
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 50;
  }

  return scores;
}

export function getTopStrengths(scores: DimensionScores): string[] {
  return [...DIMENSION_ORDER]
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, 2)
    .map((d) => DIMENSION_LABELS[d]);
}

export function getTopGrowthAreas(scores: DimensionScores): string[] {
  return [...DIMENSION_ORDER]
    .sort((a, b) => scores[a] - scores[b])
    .slice(0, 2)
    .map((d) => DIMENSION_LABELS[d]);
}

export function calculateBurnoutRisk(
  scores: DimensionScores,
  answers: CompassAnswer[]
): BurnoutRisk {
  const q7 = answers.find((a) => a.questionId === 7);
  const q8 = answers.find((a) => a.questionId === 8);
  const q37 = answers.find((a) => a.questionId === 37);

  let riskScore = 0;
  riskScore += 100 - scores.energyLifestyle;
  riskScore += 100 - scores.careerEnergy;

  const burnoutAnswers = [
    q7?.selectedAnswer,
    q8?.selectedAnswer,
    q37?.selectedAnswer,
  ];
  if (burnoutAnswers.some((a) => a?.toLowerCase().includes("burn"))) {
    riskScore += 40;
  }
  if (q8?.selectedAnswer === "Almost every day") riskScore += 30;
  if (q37?.selectedAnswer === "Burned out") riskScore += 35;

  const avg = riskScore / 2.5;
  if (avg >= 65) return "High";
  if (avg >= 40) return "Medium";
  return "Low";
}

export function deriveExecutionStyle(answers: CompassAnswer[]): string {
  const q17 = answers.find((a) => a.questionId === 17)?.selectedAnswer ?? "";
  const q45 = answers.find((a) => a.questionId === 45)?.selectedAnswer ?? "";
  const q47 = answers.find((a) => a.questionId === 47)?.selectedAnswer ?? "";

  if (q17.includes("consistent once I have structure")) {
    return "Structure-driven — you thrive with clear systems and routines";
  }
  if (q17.includes("take action quickly")) {
    return "Action-first — you learn by doing and need momentum";
  }
  if (q17.includes("research a lot")) {
    return "Analytical — you need clarity before committing";
  }
  if (q45.includes("Human coach") || q45.includes("Weekly check-ins")) {
    return "Accountability-supported — external check-ins keep you on track";
  }
  if (q47.includes("Daily checklist")) {
    return "Daily rhythm — small daily wins build your consistency";
  }
  if (q47.includes("Detailed roadmap")) {
    return "Roadmap planner — you need a clear sequence of milestones";
  }
  return "Adaptive executor — you adjust plans as you learn";
}

export function deriveFinancialFreedomReadiness(
  scores: DimensionScores
): string {
  if (scores.financialFreedom >= 75) return "Strong — ready to build wealth strategies";
  if (scores.financialFreedom >= 55) return "Developing — foundations in place, needs a plan";
  if (scores.financialFreedom >= 35) return "Early stage — focus on savings and clarity first";
  return "Needs attention — prioritise financial stability before aggressive growth";
}

export function deriveSideBusinessReadiness(
  scores: DimensionScores,
  answers: CompassAnswer[]
): string {
  const q25 = answers.find((a) => a.questionId === 25)?.selectedAnswer ?? "";
  const q28 = answers.find((a) => a.questionId === 28);
  const hoursScore =
    typeof q28?.answerValue === "number" ? q28.answerValue * 10 : 50;

  if (q25.includes("already have one") && scores.businessCreativity >= 60) {
    return "Active — already building, ready to scale";
  }
  if (scores.businessCreativity >= 70 && hoursScore >= 60) {
    return "High — strong interest and time commitment";
  }
  if (scores.businessCreativity >= 50) {
    return "Exploring — ideas present, needs focused first step";
  }
  if (q25.includes("not currently")) {
    return "Not a priority right now — focus on core life areas first";
  }
  return "Early curiosity — explore lightly before committing";
}

export function assignArchetype(
  scores: DimensionScores,
  answers: CompassAnswer[],
  burnoutRisk: BurnoutRisk
): LifeGPSArchetype {
  const q4 = answers.find((a) => a.questionId === 4)?.selectedAnswer ?? "";
  const q25 = answers.find((a) => a.questionId === 25)?.selectedAnswer ?? "";

  const candidates: { archetype: LifeGPSArchetype; weight: number }[] = [];

  if (burnoutRisk === "High" || q4.includes("escape burnout")) {
    candidates.push({ archetype: "The Burnout Escaper", weight: 100 });
  }
  if (scores.purpose <= 50) {
    candidates.push({ archetype: "The Purpose Explorer", weight: 85 });
  }
  if (scores.careerEnergy <= 45 && scores.growth >= 50) {
    candidates.push({ archetype: "The Career Changer", weight: 80 });
  }
  if (
    scores.financialFreedom >= 60 &&
    (q4.includes("freedom") || scores.purpose >= 55)
  ) {
    candidates.push({ archetype: "The Freedom Seeker", weight: 75 });
  }
  if (scores.communicationConfidence >= 55 && scores.communicationConfidence <= 75) {
    candidates.push({ archetype: "The Confident Communicator", weight: 70 });
  }
  if (
    scores.businessCreativity >= 60 &&
    !q25.includes("not currently")
  ) {
    candidates.push({ archetype: "The Creative Starter", weight: 75 });
  }
  if (
    scores.purpose >= 65 &&
    scores.execution >= 60 &&
    scores.growth >= 60
  ) {
    candidates.push({ archetype: "The Strategic Builder", weight: 90 });
  }

  candidates.push({ archetype: "The Steady Optimiser", weight: 40 });

  candidates.sort((a, b) => b.weight - a.weight);
  return candidates[0]?.archetype ?? "The Steady Optimiser";
}

export function computeCompassResults(
  answers: CompassAnswer[]
): CompassResults {
  const dimensionScores = calculateDimensionScores(answers);
  const burnoutRisk = calculateBurnoutRisk(dimensionScores, answers);
  const archetype = assignArchetype(dimensionScores, answers, burnoutRisk);

  return {
    dimensionScores,
    topStrengths: getTopStrengths(dimensionScores),
    topGrowthAreas: getTopGrowthAreas(dimensionScores),
    burnoutRisk,
    executionStyle: deriveExecutionStyle(answers),
    financialFreedomReadiness: deriveFinancialFreedomReadiness(dimensionScores),
    sideBusinessReadiness: deriveSideBusinessReadiness(dimensionScores, answers),
    archetype,
    archetypeDescription: ARCHETYPES[archetype].description,
    completedAt: new Date().toISOString(),
  };
}

export function buildAnswer(
  questionId: number,
  selectedLabels: string[],
  selectedValues: (string | number)[]
): CompassAnswer | null {
  const question = COMPASS_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return null;

  const isMulti = question.type === "multiChoice";
  const isScale = question.type === "scale1to10";

  return {
    questionId: question.id,
    questionText: question.text,
    selectedAnswer: selectedLabels.join(", "),
    answerValue: isScale
      ? (selectedValues[0] as number)
      : isMulti
        ? (selectedValues as string[])
        : (selectedValues[0] as string),
    dimension: question.dimension,
  };
}

export function formatDimensionScoresForDisplay(
  scores: DimensionScores
): string {
  return DIMENSION_ORDER.map(
    (d) => `${DIMENSION_LABELS[d]}: ${scores[d]}/100`
  ).join("\n");
}

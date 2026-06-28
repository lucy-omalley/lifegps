import { ARCHETYPES } from "@/lib/compass/archetypes";
import { DIMENSION_LABELS, DIMENSION_ORDER } from "@/lib/compass/dimensions";
import { COMPASS_QUESTIONS, getQuestionById } from "@/lib/compass/questions";
import type {
  AdaptiveSignals,
  BurnoutRisk,
  CompassAnswer,
  CompassDimension,
  CompassResults,
  DimensionScores,
  LifeGPSArchetype,
} from "@/types";

const REQUIRED_QUESTION_COUNT = 20;

function getAnswerScore(answer: CompassAnswer): number {
  if (typeof answer.answerValue === "number") {
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

  if (typeof answer.answerValue === "string" && answer.answerValue.length === 0) {
    return 50;
  }

  const question = getQuestionById(answer.questionId);
  const option = question?.options?.find((o) => o.value === answer.answerValue);
  return option?.score ?? 50;
}

/** Infer dimension scores from fewer answers — weighted by signal strength */
export function calculateDimensionScores(
  answers: CompassAnswer[]
): DimensionScores {
  const buckets: Record<CompassDimension, number[]> = {
    purpose: [],
    career: [],
    energy: [],
    communication: [],
    freedom: [],
    execution: [],
  };

  for (const answer of answers) {
    if (answer.questionId === 21) continue;
    buckets[answer.dimension].push(getAnswerScore(answer));
  }

  // Cross-dimension inference from high-signal answers
  const q1 = answers.find((a) => a.questionId === 1);
  const q3 = answers.find((a) => a.questionId === 3);
  const q7 = answers.find((a) => a.questionId === 7);
  const q10 = answers.find((a) => a.questionId === 10);
  const q14 = answers.find((a) => a.questionId === 14);
  const q18 = answers.find((a) => a.questionId === 18);

  if (q3 && typeof q3.answerValue === "number") {
    buckets.purpose.push(q3.answerValue * 10);
  }
  if (q7 && typeof q7.answerValue === "number") {
    buckets.career.push(q7.answerValue * 10);
  }
  if (q10) {
    buckets.energy.push(getAnswerScore(q10));
  }
  if (q14 && typeof q14.answerValue === "number") {
    buckets.freedom.push(q14.answerValue * 10);
  }
  if (q18 && typeof q18.answerValue === "number") {
    buckets.execution.push(q18.answerValue * 10);
  }
  if (q1?.selectedAnswer?.includes("burned out")) {
    buckets.energy.push(15);
    buckets.career.push(30);
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

export function extractAdaptiveSignals(
  answers: CompassAnswer[]
): AdaptiveSignals {
  const contains = (answer: CompassAnswer | undefined, needle: string) =>
    answer?.selectedAnswer?.toLowerCase().includes(needle.toLowerCase()) ??
    false;

  const multiContains = (answer: CompassAnswer | undefined, needle: string) => {
    if (!answer) return false;
    const normalized = needle.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    if (Array.isArray(answer.answerValue)) {
      return (answer.answerValue as string[]).some((v) =>
        v.includes(normalized)
      );
    }
    return contains(answer, needle);
  };

  const q1 = answers.find((a) => a.questionId === 1);
  const q2 = answers.find((a) => a.questionId === 2);
  const q9 = answers.find((a) => a.questionId === 9);
  const q12 = answers.find((a) => a.questionId === 12);
  const q13 = answers.find((a) => a.questionId === 13);
  const q10 = answers.find((a) => a.questionId === 10);
  const q19 = answers.find((a) => a.questionId === 19);
  const q20 = answers.find((a) => a.questionId === 20);

  return {
    sideBusiness:
      multiContains(q2, "side business") ||
      contains(q9, "own business") ||
      contains(q12, "build a business") ||
      contains(q19, "side business"),
    earlyRetirement:
      multiContains(q2, "early retirement") ||
      multiContains(q13, "early retirement") ||
      contains(q19, "early retirement"),
    careerChange:
      contains(q9, "new career") || contains(q19, "career roadmap"),
    burnoutRecovery:
      contains(q1, "burned out") ||
      contains(q10, "burned out") ||
      contains(q19, "burnout recovery"),
    wantsAccountability:
      contains(q20, "accountability") || contains(q20, "guide me"),
  };
}

export function calculateBurnoutRisk(
  scores: DimensionScores,
  answers: CompassAnswer[]
): BurnoutRisk {
  const q1 = answers.find((a) => a.questionId === 1);
  const q10 = answers.find((a) => a.questionId === 10);
  const q11 = answers.find((a) => a.questionId === 11);

  let riskScore = 0;
  riskScore += 100 - scores.energy;
  riskScore += 100 - scores.career;

  if (q1?.selectedAnswer?.includes("burned out")) riskScore += 35;
  if (q1?.selectedAnswer?.includes("stuck")) riskScore += 15;
  if (q10?.selectedAnswer?.includes("Burned out")) riskScore += 40;
  if (q10?.selectedAnswer?.includes("Often tired")) riskScore += 20;
  if (multiDrainIncludes(q11, "work")) riskScore += 15;
  if (multiDrainIncludes(q11, "too many commitments")) riskScore += 10;

  const avg = riskScore / 2.5;
  if (avg >= 65) return "High";
  if (avg >= 40) return "Medium";
  return "Low";
}

function multiDrainIncludes(
  answer: CompassAnswer | undefined,
  needle: string
): boolean {
  if (!answer || !Array.isArray(answer.answerValue)) return false;
  const normalized = needle.replace(/\s+/g, "_");
  return (answer.answerValue as string[]).some((v) => v.includes(normalized));
}

export function deriveExecutionStyle(answers: CompassAnswer[]): string {
  const q4 = answers.find((a) => a.questionId === 4)?.selectedAnswer ?? "";
  const q6 = answers.find((a) => a.questionId === 6)?.selectedAnswer ?? "";
  const q20 = answers.find((a) => a.questionId === 20)?.selectedAnswer ?? "";

  if (q4.includes("detailed plan") || q6.includes("Analyse")) {
    return "Structure-driven — you thrive with clear systems and routines";
  }
  if (q4.includes("Jump straight") || q6.includes("quick choice")) {
    return "Action-first — you learn by doing and need momentum";
  }
  if (q4.includes("Research") || q6.includes("Analyse")) {
    return "Analytical — you need clarity before committing";
  }
  if (q20.includes("accountability") || q20.includes("guide me")) {
    return "Accountability-supported — external check-ins keep you on track";
  }
  if (q20.includes("too many ideas")) {
    return "Explorer — narrow focus to one path at a time";
  }
  if (q20.includes("don't know where")) {
    return "Guided starter — small steps and direction unlock momentum";
  }
  return "Adaptive executor — you adjust plans as you learn";
}

export function deriveFinancialFreedomReadiness(
  scores: DimensionScores,
  answers: CompassAnswer[]
): string {
  const q15 = answers.find((a) => a.questionId === 15)?.selectedAnswer ?? "";
  const hasRetirementGoal = extractAdaptiveSignals(answers).earlyRetirement;

  if (scores.freedom >= 75 && (q15.includes("Invest") || hasRetirementGoal)) {
    return "Strong — ready to build wealth strategies";
  }
  if (scores.freedom >= 55) {
    return "Developing — foundations in place, needs a plan";
  }
  if (scores.freedom >= 35) {
    return "Early stage — focus on savings and clarity first";
  }
  return "Needs attention — prioritise financial stability before aggressive growth";
}

export function deriveSideBusinessReadiness(
  scores: DimensionScores,
  answers: CompassAnswer[]
): string {
  const signals = extractAdaptiveSignals(answers);
  const q15 = answers.find((a) => a.questionId === 15)?.selectedAnswer ?? "";

  if (
    signals.sideBusiness &&
    scores.execution >= 65 &&
    (q15.includes("Start a business") || scores.freedom >= 60)
  ) {
    return "High — strong interest and readiness to act";
  }
  if (signals.sideBusiness && scores.execution >= 50) {
    return "Exploring — ideas present, needs focused first step";
  }
  if (q15.includes("Start a business") || containsGoal(answers, "side business")) {
    return "Curious — validate one idea before committing";
  }
  return "Not a priority right now — focus on core life areas first";
}

function containsGoal(answers: CompassAnswer[], needle: string): boolean {
  const q2 = answers.find((a) => a.questionId === 2);
  if (!q2 || !Array.isArray(q2.answerValue)) return false;
  const normalized = needle.replace(/\s+/g, "_");
  return (q2.answerValue as string[]).some((v) => v.includes(normalized));
}

export function assignArchetype(
  scores: DimensionScores,
  answers: CompassAnswer[],
  burnoutRisk: BurnoutRisk
): LifeGPSArchetype {
  const signals = extractAdaptiveSignals(answers);
  const q1 = answers.find((a) => a.questionId === 1)?.selectedAnswer ?? "";

  const candidates: { archetype: LifeGPSArchetype; weight: number }[] = [];

  if (burnoutRisk === "High" || signals.burnoutRecovery) {
    candidates.push({ archetype: "The Burnout Escaper", weight: 100 });
  }
  if (scores.purpose <= 50 || q1.includes("searching")) {
    candidates.push({ archetype: "The Purpose Explorer", weight: 85 });
  }
  if (signals.careerChange || (scores.career <= 45 && scores.communication >= 50)) {
    candidates.push({ archetype: "The Career Changer", weight: 80 });
  }
  if (scores.freedom >= 60 || signals.earlyRetirement) {
    candidates.push({ archetype: "The Freedom Seeker", weight: 75 });
  }
  if (scores.communication <= 55 || scores.communication >= 70) {
    candidates.push({ archetype: "The Confident Communicator", weight: 65 });
  }
  if (signals.sideBusiness && scores.execution >= 55) {
    candidates.push({ archetype: "The Creative Starter", weight: 75 });
  }
  if (
    scores.purpose >= 65 &&
    scores.execution >= 60 &&
    scores.career >= 55
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
  const adaptiveSignals = extractAdaptiveSignals(answers);
  const burnoutRisk = calculateBurnoutRisk(dimensionScores, answers);
  const archetype = assignArchetype(dimensionScores, answers, burnoutRisk);
  const optionalNote = answers.find((a) => a.questionId === 21);

  return {
    dimensionScores,
    topStrengths: getTopStrengths(dimensionScores),
    topGrowthAreas: getTopGrowthAreas(dimensionScores),
    burnoutRisk,
    executionStyle: deriveExecutionStyle(answers),
    financialFreedomReadiness: deriveFinancialFreedomReadiness(
      dimensionScores,
      answers
    ),
    sideBusinessReadiness: deriveSideBusinessReadiness(
      dimensionScores,
      answers
    ),
    archetype,
    archetypeDescription: ARCHETYPES[archetype].description,
    adaptiveSignals,
    optionalReflection:
      typeof optionalNote?.answerValue === "string" &&
      optionalNote.answerValue.trim()
        ? optionalNote.answerValue.trim()
        : undefined,
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

  if (question.type === "optionalText") {
    const text = (selectedLabels[0] ?? "").trim();
    return {
      questionId: question.id,
      questionText: question.text,
      selectedAnswer: text,
      answerValue: text,
      dimension: question.dimension,
    };
  }

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

export function hasRequiredAnswers(answers: CompassAnswer[]): boolean {
  const answeredIds = new Set(
    answers.filter((a) => a.questionId !== 21).map((a) => a.questionId)
  );
  for (let id = 1; id <= REQUIRED_QUESTION_COUNT; id++) {
    if (!answeredIds.has(id)) return false;
  }
  return true;
}

export function formatDimensionScoresForDisplay(
  scores: DimensionScores
): string {
  return DIMENSION_ORDER.map(
    (d) => `${DIMENSION_LABELS[d]}: ${scores[d]}/100`
  ).join("\n");
}

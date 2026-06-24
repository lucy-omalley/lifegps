export type QuestionType =
  | "singleChoice"
  | "scale1to10"
  | "multiChoice"
  | "scenarioChoice";

export type CompassDimension =
  | "purpose"
  | "careerEnergy"
  | "growth"
  | "communicationConfidence"
  | "businessCreativity"
  | "financialFreedom"
  | "energyLifestyle"
  | "execution";

export type BurnoutRisk = "Low" | "Medium" | "High";

export type LifeGPSArchetype =
  | "The Strategic Builder"
  | "The Burnout Escaper"
  | "The Career Changer"
  | "The Freedom Seeker"
  | "The Purpose Explorer"
  | "The Confident Communicator"
  | "The Creative Starter"
  | "The Steady Optimiser";

export interface CompassQuestionOption {
  label: string;
  value: string;
  score: number;
}

export interface CompassQuestion {
  id: number;
  dimension: CompassDimension;
  text: string;
  type: QuestionType;
  options?: CompassQuestionOption[];
}

export interface CompassAnswer {
  questionId: number;
  questionText: string;
  selectedAnswer: string;
  answerValue: number | string | string[];
  dimension: CompassDimension;
}

export interface DimensionScores {
  purpose: number;
  careerEnergy: number;
  growth: number;
  communicationConfidence: number;
  businessCreativity: number;
  financialFreedom: number;
  energyLifestyle: number;
  execution: number;
}

export interface CompassResults {
  dimensionScores: DimensionScores;
  topStrengths: string[];
  topGrowthAreas: string[];
  burnoutRisk: BurnoutRisk;
  executionStyle: string;
  financialFreedomReadiness: string;
  sideBusinessReadiness: string;
  archetype: LifeGPSArchetype;
  archetypeDescription: string;
  completedAt: string;
}

export interface CompassAssessment {
  answers: CompassAnswer[];
  results: CompassResults | null;
  completedAt?: string;
}

/** @deprecated Use CompassAssessment — kept for migration reference */
export interface AssessmentData {
  name: string;
  ageRange: string;
  location: string;
  currentJob: string;
  familySituation: string;
  mbtiType: string;
  keyStrengths: string;
  weaknesses: string;
  communicationStyle: string;
  careerSatisfaction: number;
  energyBurnout: number;
  financialSituation: string;
  healthLifestyle: string;
  workLifeBalance: string;
  idealLife: string;
  desiredCareer: string;
  desiredIncome: string;
  sideBusinessIdeas: string;
  earlyRetirementGoal: string;
  biggestDream: string;
  whatIsStopping: string;
  timeConstraints: string;
  confidenceIssues: string;
  skillsGaps: string;
  financialPressure: string;
}

export interface LifeBlueprint {
  id: string;
  userId: string;
  assessmentId: string;
  createdAt: string;
  archetype: LifeGPSArchetype;
  archetypeSummary: string;
  compassScoreOverview: string;
  futureSelfSummary: string;
  currentStateAnalysis: string;
  dreamLifeVision: string;
  gapAnalysis: string;
  fiveYearRoadmap: string[];
  twelveMonthPlan: string[];
  ninetyDayActionPlan: string[];
  sevenDayStarterPlan: string[];
  dailyHabits: string[];
  weeklyCheckInQuestions: string[];
  weeklyPriorities: string[];
  sideBusinessDirection?: string;
  communicationGrowthPlan?: string;
  burnoutRecoveryActions?: string;
  financialFreedomNotes?: string;
  recommendedFirstStep: string;
}

export interface WeeklyCheckin {
  id: string;
  userId: string;
  progress: string;
  blockers: string;
  supportNeeded: string;
  nextPriority: string;
  aiResponse: string;
  createdAt: string;
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
}

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

export type AssessmentPhase =
  | "intro"
  | "questions"
  | "analysing"
  | "creating-archetype"
  | "building-blueprint"
  | "archetype-reveal";

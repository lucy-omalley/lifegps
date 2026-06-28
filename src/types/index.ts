export type QuestionType =
  | "singleChoice"
  | "scale1to10"
  | "multiChoice"
  | "scenarioChoice"
  | "optionalText";

export type CompassDimension =
  | "purpose"
  | "career"
  | "energy"
  | "communication"
  | "freedom"
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
  sectionId: number;
  sectionTitle: string;
  dimension: CompassDimension;
  text: string;
  type: QuestionType;
  options?: CompassQuestionOption[];
  maxSelections?: number;
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
  career: number;
  energy: number;
  communication: number;
  freedom: number;
  execution: number;
}

export interface AdaptiveSignals {
  sideBusiness: boolean;
  earlyRetirement: boolean;
  careerChange: boolean;
  burnoutRecovery: boolean;
  wantsAccountability: boolean;
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
  adaptiveSignals: AdaptiveSignals;
  optionalReflection?: string;
  completedAt: string;
}

export interface CompassAssessment {
  answers: CompassAnswer[];
  results: CompassResults | null;
  completedAt?: string;
  version?: "compass-v2";
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

// --- Founder Agent / Feedback types ---

export interface SectionRatings {
  [sectionName: string]: number;
}

export interface BlueprintFeedback {
  id: string;
  blueprintId: string;
  overallRating: number;
  sectionRatings: SectionRatings;
  reflection?: string;
  missingContext?: string;
  unrealisticParts?: string;
  willingnessToPay?: "yes" | "maybe" | "no";
  isRecalculation?: boolean;
  createdAt: string;
}

export interface FeedbackAnalysis {
  topThemes: string[];
  lowestRatedSections: { section: string; averageRating: number }[];
  commonMissingContext: string[];
  commonUnrealisticRecommendations: string[];
  recommendedProductFixes: string[];
  recommendedPromptImprovements: string[];
}

export interface FounderMetrics {
  totalAssessments: number;
  totalBlueprints: number;
  totalRecalculatedBlueprints: number;
  averageBlueprintRating: number | null;
  lowestRatedSections: { section: string; averageRating: number }[];
  topFeedbackThemes: string[];
  mostRequestedFocusAreas: string[];
  willingnessToPaySignals: { yes: number; maybe: number; no: number };
  topArchetypes: { archetype: string; count: number }[];
  topGrowthAreas: { area: string; count: number }[];
  topUserGoals: { goal: string; count: number }[];
  checkInSummaries: string[];
  source: "database" | "mock";
}

export interface FounderProductContext {
  metrics: FounderMetrics;
  feedbackAnalysis: FeedbackAnalysis;
  recentReflections: string[];
}

export interface FounderWeeklyPlan {
  productImprovements: string[];
  marketingActions: string[];
  userInterviewQuestions: string[];
  pricingExperiment: string;
  retentionExperiment: string;
  doNotBuildYet: string;
}

export interface FounderChatMessage {
  role: "user" | "assistant";
  content: string;
}

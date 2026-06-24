export interface AssessmentData {
  // Step 1: About You
  name: string;
  ageRange: string;
  location: string;
  currentJob: string;
  familySituation: string;

  // Step 2: Personality & Strengths
  mbtiType: string;
  keyStrengths: string;
  weaknesses: string;
  communicationStyle: string;

  // Step 3: Current Life
  careerSatisfaction: number;
  energyBurnout: number;
  financialSituation: string;
  healthLifestyle: string;
  workLifeBalance: string;

  // Step 4: Dream Life
  idealLife: string;
  desiredCareer: string;
  desiredIncome: string;
  sideBusinessIdeas: string;
  earlyRetirementGoal: string;
  biggestDream: string;

  // Step 5: Barriers
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
  futureSelfSummary: string;
  currentStateAnalysis: string;
  dreamLifeVision: string;
  gapAnalysis: string;
  fiveYearRoadmap: string[];
  twelveMonthPlan: string[];
  ninetyDayActionPlan: string[];
  weeklyPriorities: string[];
  dailyHabits: string[];
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

import type {
  CompassAssessment,
  CompassAnswer,
  LifeBlueprint,
  LifeGPSArchetype,
  WeeklyCheckin,
} from "@/types";

export interface BlueprintRow {
  id: string;
  user_id: string;
  assessment_id: string | null;
  archetype: string | null;
  archetype_summary: string | null;
  compass_score_overview: string | null;
  future_self_summary: string | null;
  current_state_analysis: string | null;
  dream_life_vision: string | null;
  gap_analysis: string | null;
  five_year_roadmap: string[] | null;
  twelve_month_plan: string[] | null;
  ninety_day_action_plan: string[] | null;
  seven_day_starter_plan: string[] | null;
  weekly_priorities: string[] | null;
  daily_habits: string[] | null;
  weekly_check_in_questions: string[] | null;
  side_business_direction: string | null;
  communication_growth_plan: string | null;
  burnout_recovery_actions: string | null;
  financial_freedom_notes: string | null;
  recommended_first_step: string | null;
  created_at: string;
}

export interface CompassSessionRow {
  user_id: string;
  answers: CompassAnswer[];
  current_question: number;
  phase: string;
  updated_at: string;
}

export function blueprintFromRow(row: BlueprintRow): LifeBlueprint {
  return {
    id: row.id,
    userId: row.user_id,
    assessmentId: row.assessment_id ?? "",
    createdAt: row.created_at,
    archetype: (row.archetype as LifeGPSArchetype) ?? "The Steady Optimiser",
    archetypeSummary: row.archetype_summary ?? "",
    compassScoreOverview: row.compass_score_overview ?? "",
    futureSelfSummary: row.future_self_summary ?? "",
    currentStateAnalysis: row.current_state_analysis ?? "",
    dreamLifeVision: row.dream_life_vision ?? "",
    gapAnalysis: row.gap_analysis ?? "",
    fiveYearRoadmap: row.five_year_roadmap ?? [],
    twelveMonthPlan: row.twelve_month_plan ?? [],
    ninetyDayActionPlan: row.ninety_day_action_plan ?? [],
    sevenDayStarterPlan: row.seven_day_starter_plan ?? [],
    dailyHabits: row.daily_habits ?? [],
    weeklyCheckInQuestions: row.weekly_check_in_questions ?? [],
    weeklyPriorities: row.weekly_priorities ?? [],
    sideBusinessDirection: row.side_business_direction ?? undefined,
    communicationGrowthPlan: row.communication_growth_plan ?? undefined,
    burnoutRecoveryActions: row.burnout_recovery_actions ?? undefined,
    financialFreedomNotes: row.financial_freedom_notes ?? undefined,
    recommendedFirstStep: row.recommended_first_step ?? "",
  };
}

export function blueprintToRow(
  blueprint: LifeBlueprint,
  assessmentId: string
): Omit<BlueprintRow, "created_at"> {
  return {
    id: blueprint.id,
    user_id: blueprint.userId,
    assessment_id: assessmentId,
    archetype: blueprint.archetype,
    archetype_summary: blueprint.archetypeSummary,
    compass_score_overview: blueprint.compassScoreOverview,
    future_self_summary: blueprint.futureSelfSummary,
    current_state_analysis: blueprint.currentStateAnalysis,
    dream_life_vision: blueprint.dreamLifeVision,
    gap_analysis: blueprint.gapAnalysis,
    five_year_roadmap: blueprint.fiveYearRoadmap,
    twelve_month_plan: blueprint.twelveMonthPlan,
    ninety_day_action_plan: blueprint.ninetyDayActionPlan,
    seven_day_starter_plan: blueprint.sevenDayStarterPlan,
    weekly_priorities: blueprint.weeklyPriorities,
    daily_habits: blueprint.dailyHabits,
    weekly_check_in_questions: blueprint.weeklyCheckInQuestions,
    side_business_direction: blueprint.sideBusinessDirection ?? null,
    communication_growth_plan: blueprint.communicationGrowthPlan ?? null,
    burnout_recovery_actions: blueprint.burnoutRecoveryActions ?? null,
    financial_freedom_notes: blueprint.financialFreedomNotes ?? null,
    recommended_first_step: blueprint.recommendedFirstStep,
  };
}

export interface CheckinRow {
  id: string;
  user_id: string;
  progress: string | null;
  blockers: string | null;
  support_needed: string | null;
  next_priority: string | null;
  ai_response: string | null;
  created_at: string;
}

export function checkinFromRow(row: CheckinRow): WeeklyCheckin {
  return {
    id: row.id,
    userId: row.user_id,
    progress: row.progress ?? "",
    blockers: row.blockers ?? "",
    supportNeeded: row.support_needed ?? "",
    nextPriority: row.next_priority ?? "",
    aiResponse: row.ai_response ?? "",
    createdAt: row.created_at,
  };
}

export interface AssessmentRow {
  id: string;
  user_id: string;
  data: CompassAssessment;
  is_complete: boolean;
  completed_at: string | null;
  created_at: string;
}

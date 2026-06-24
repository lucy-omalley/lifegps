import type { CompassAssessment, LifeBlueprint, WeeklyCheckin } from "@/types";

const BLUEPRINT_KEY = "lifegps_blueprint";
const ASSESSMENT_KEY = "lifegps_assessment";
const COMPASS_SESSION_KEY = "lifegps_compass_session";
const CHECKINS_KEY = "lifegps_checkins";

export function saveCompassSession(data: {
  answers: CompassAssessment["answers"];
  currentQuestion: number;
  phase: string;
}) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPASS_SESSION_KEY, JSON.stringify(data));
}

export function getCompassSession(): {
  answers: CompassAssessment["answers"];
  currentQuestion: number;
  phase: string;
} | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(COMPASS_SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearCompassSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COMPASS_SESSION_KEY);
}

export function saveAssessment(data: CompassAssessment) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
}

export function getAssessment(): CompassAssessment | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(ASSESSMENT_KEY);
  return stored ? (JSON.parse(stored) as CompassAssessment) : null;
}

export function saveBlueprint(blueprint: LifeBlueprint) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BLUEPRINT_KEY, JSON.stringify(blueprint));
}

export function getBlueprint(): LifeBlueprint | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(BLUEPRINT_KEY);
  if (!stored) return null;
  const parsed = JSON.parse(stored) as Partial<LifeBlueprint> & LifeBlueprint;
  // Migrate legacy blueprints missing new Compass fields
  return {
    ...parsed,
    archetype: parsed.archetype ?? "The Steady Optimiser",
    archetypeSummary:
      parsed.archetypeSummary ?? parsed.futureSelfSummary ?? "",
    compassScoreOverview: parsed.compassScoreOverview ?? "",
    sevenDayStarterPlan: parsed.sevenDayStarterPlan ?? [],
    weeklyCheckInQuestions: parsed.weeklyCheckInQuestions ?? [],
  };
}

export function saveCheckin(checkin: WeeklyCheckin) {
  if (typeof window === "undefined") return;
  const existing = getCheckins();
  existing.unshift(checkin);
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(existing));
}

export function getCheckins(): WeeklyCheckin[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(CHECKINS_KEY);
  return stored ? (JSON.parse(stored) as WeeklyCheckin[]) : [];
}

import type { AssessmentData, LifeBlueprint, WeeklyCheckin } from "@/types";

const BLUEPRINT_KEY = "lifegps_blueprint";
const ASSESSMENT_KEY = "lifegps_assessment";
const CHECKINS_KEY = "lifegps_checkins";

export function saveAssessment(data: AssessmentData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
}

export function getAssessment(): AssessmentData | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(ASSESSMENT_KEY);
  return stored ? (JSON.parse(stored) as AssessmentData) : null;
}

export function saveBlueprint(blueprint: LifeBlueprint) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BLUEPRINT_KEY, JSON.stringify(blueprint));
}

export function getBlueprint(): LifeBlueprint | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(BLUEPRINT_KEY);
  return stored ? (JSON.parse(stored) as LifeBlueprint) : null;
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

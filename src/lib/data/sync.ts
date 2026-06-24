import type { CompassAnswer, CompassAssessment, LifeBlueprint } from "@/types";
import { isDatabaseEnabled } from "@/lib/auth";

export async function syncCompassSessionToDatabase(data: {
  answers: CompassAnswer[];
  currentQuestion: number;
  phase: string;
}) {
  if (!isDatabaseEnabled()) return false;

  try {
    const response = await fetch("/api/assessment/session", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function loadCompassSessionFromDatabase(): Promise<{
  answers: CompassAnswer[];
  currentQuestion: number;
  phase: string;
} | null> {
  if (!isDatabaseEnabled()) return null;

  try {
    const response = await fetch("/api/assessment/session");
    if (!response.ok) return null;
    const { session } = await response.json();
    return session;
  } catch {
    return null;
  }
}

export async function clearCompassSessionFromDatabase() {
  if (!isDatabaseEnabled()) return;

  try {
    await fetch("/api/assessment/session", { method: "DELETE" });
  } catch {
    // Ignore — localStorage is still cleared
  }
}

export async function loadBlueprintFromDatabase(): Promise<LifeBlueprint | null> {
  if (!isDatabaseEnabled()) return null;

  try {
    const response = await fetch("/api/blueprint");
    if (!response.ok) return null;
    const { blueprint } = await response.json();
    return blueprint;
  } catch {
    return null;
  }
}

export async function loadAssessmentFromDatabase(): Promise<CompassAssessment | null> {
  if (!isDatabaseEnabled()) return null;

  try {
    const response = await fetch("/api/assessment");
    if (!response.ok) return null;
    const { assessment } = await response.json();
    return assessment;
  } catch {
    return null;
  }
}

export async function loadBlueprintWithFallback(): Promise<LifeBlueprint | null> {
  const { getBlueprint } = await import("@/lib/storage");
  const fromDb = await loadBlueprintFromDatabase();
  if (fromDb) {
    const { saveBlueprint } = await import("@/lib/storage");
    saveBlueprint(fromDb);
    return fromDb;
  }
  return getBlueprint();
}

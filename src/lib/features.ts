import type { DiscoveryModuleId, DiscoveryProgress } from "@/types/discovery";

/** Placeholder premium flag — wire to Stripe/RevenueCat when available */
export function getIsPremium(progress?: DiscoveryProgress | null): boolean {
  return progress?.isPremium ?? false;
}

export function canAccessFullProfile(
  progress?: DiscoveryProgress | null
): boolean {
  return getIsPremium(progress);
}

export function canGenerateFullBlueprint(
  progress?: DiscoveryProgress | null
): boolean {
  return getIsPremium(progress);
}

export function canUseFeedbackRefinement(
  progress?: DiscoveryProgress | null
): boolean {
  return getIsPremium(progress);
}

/** Free users get one module; premium unlocks all */
export function canStartModule(
  moduleId: DiscoveryModuleId,
  progress: DiscoveryProgress
): boolean {
  if (getIsPremium(progress)) return true;
  if (progress.completedModules.includes(moduleId)) return true;
  if (!progress.freeModuleUsed) return true;
  return false;
}

export function getModuleSummaryPreview(summary: string): string {
  const sentences = summary.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 2).join(" ");
}

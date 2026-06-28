import type { DiscoveryModuleId } from "@/types/discovery";
import { DEFAULT_WEIGHTS } from "./modules";

/** Redistribute weights proportionally across completed modules */
export function calculateModuleWeights(
  completedModules: DiscoveryModuleId[]
): Partial<Record<DiscoveryModuleId, number>> {
  if (completedModules.length === 0) return {};

  const totalDefault = completedModules.reduce(
    (sum, id) => sum + DEFAULT_WEIGHTS[id],
    0
  );

  const weights: Partial<Record<DiscoveryModuleId, number>> = {};
  for (const id of completedModules) {
    weights[id] = DEFAULT_WEIGHTS[id] / totalDefault;
  }
  return weights;
}

export function formatWeightPercent(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}

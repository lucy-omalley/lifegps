import type { CompassDimension } from "@/types";

export const DIMENSION_LABELS: Record<CompassDimension, string> = {
  purpose: "Purpose",
  career: "Career",
  energy: "Energy",
  communication: "Communication",
  freedom: "Freedom",
  execution: "Execution",
};

export const DIMENSION_ORDER: CompassDimension[] = [
  "purpose",
  "career",
  "energy",
  "communication",
  "freedom",
  "execution",
];

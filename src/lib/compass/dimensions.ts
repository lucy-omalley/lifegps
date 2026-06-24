import type { CompassDimension } from "@/types";

export const DIMENSION_LABELS: Record<CompassDimension, string> = {
  purpose: "Purpose & Direction",
  careerEnergy: "Career & Work Energy",
  growth: "Skills & Growth",
  communicationConfidence: "Communication & Confidence",
  businessCreativity: "Side Business & Creativity",
  financialFreedom: "Money & Freedom",
  energyLifestyle: "Energy, Burnout & Lifestyle",
  execution: "Execution & Habits",
};

export const DIMENSION_ORDER: CompassDimension[] = [
  "purpose",
  "careerEnergy",
  "growth",
  "communicationConfidence",
  "businessCreativity",
  "financialFreedom",
  "energyLifestyle",
  "execution",
];

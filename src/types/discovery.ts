export type DiscoveryModuleId =
  | "palm"
  | "face"
  | "numerology"
  | "tarot"
  | "quiz";

export interface DiscoveryModuleMeta {
  id: DiscoveryModuleId;
  label: string;
  description: string;
  href: string;
  defaultWeight: number;
  icon: string;
}

export interface PalmReading {
  id: string;
  userId: string;
  leftHandImageUrl?: string;
  rightHandImageUrl?: string;
  extractedFeatures: Record<string, string>;
  aiSummary: string;
  strengths: string[];
  blindSpots: string[];
  careerInsights: string[];
  relationshipInsights: string[];
  createdAt: string;
}

export interface FaceReading {
  id: string;
  userId: string;
  faceImageUrl?: string;
  extractedFeatures: Record<string, string>;
  aiSummary: string;
  confidenceInsights: string[];
  communicationInsights: string[];
  leadershipInsights: string[];
  stressPattern: string[];
  createdAt: string;
}

export interface NumerologyReading {
  id: string;
  userId: string;
  fullName?: string;
  birthDate: string;
  lifePathNumber: number;
  expressionNumber?: number;
  soulNumber?: number;
  personalYearNumber: number;
  aiSummary: string;
  createdAt: string;
}

export interface TarotCard {
  name: string;
  position: string;
  orientation: "upright" | "reversed";
}

export type TarotSpreadType = "single" | "three-card" | "five-card";

export interface TarotReading {
  id: string;
  userId: string;
  question: string;
  spreadType: TarotSpreadType;
  cards: TarotCard[];
  aiInterpretation: string;
  actionReflection: string;
  createdAt: string;
}

export interface UnifiedProfile {
  id: string;
  userId: string;
  completedModules: DiscoveryModuleId[];
  weights: Record<DiscoveryModuleId, number>;
  unifiedSummary: string;
  topStrengths: string[];
  blindSpots: string[];
  careerDirection: string[];
  relationshipStyle: string[];
  moneyStyle: string[];
  growthRecommendations: string[];
  stressPattern: string[];
  blueprintConfidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryProgress {
  completedModules: DiscoveryModuleId[];
  freeModuleUsed: boolean;
  isPremium: boolean;
}

export interface BlueprintFeedback {
  message: string;
  preset?: string;
}

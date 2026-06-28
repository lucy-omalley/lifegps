import type {
  DiscoveryModuleId,
  FaceReading,
  NumerologyReading,
  PalmReading,
  TarotReading,
  UnifiedProfile,
} from "@/types/discovery";
import { LIFE_PATH_THEMES } from "./numerology";

export function generateMockPalmReading(userId: string): PalmReading {
  return {
    id: crypto.randomUUID(),
    userId,
    extractedFeatures: {
      palmShape: "A balanced earth-influenced shape that may suggest grounded practicality",
      fingerProportion: "Even finger lengths that could reflect thoughtful decision-making",
      majorLines: "Clear major lines visible for symbolic reflection",
      lifeLine: "May suggest resilience and adaptability through life changes",
      headLine: "Could reflect analytical thinking combined with creative problem-solving",
      heartLine: "Symbolically indicates warmth and depth in emotional connections",
      fateLine: "A moderate fate line that may suggest self-directed career paths",
    },
    aiSummary:
      "Your palm patterns, viewed symbolically for self-reflection, may suggest a personality that balances practical thinking with emotional depth. The line formations could reflect someone who values both stability and meaningful growth. This reading invites you to notice how your natural tendencies show up in daily choices — for entertainment and reflection only.",
    strengths: [
      "Grounded approach to challenges",
      "Capacity for deep emotional connection",
      "Adaptability when circumstances change",
    ],
    blindSpots: [
      "May overthink before taking action",
      "Could hold back from expressing needs directly",
    ],
    careerInsights: [
      "May thrive in roles combining analysis with human connection",
      "Could benefit from structured goals with room for creativity",
    ],
    relationshipInsights: [
      "Likely values loyalty and authentic communication",
      "May need intentional space for independence within relationships",
    ],
    createdAt: new Date().toISOString(),
  };
}

export function generateMockFaceReading(userId: string): FaceReading {
  return {
    id: crypto.randomUUID(),
    userId,
    extractedFeatures: {
      expressionStyle: "Open and approachable, suggesting warmth in first impressions",
      communicationImpression: "May come across as thoughtful and attentive",
      confidenceImpression: "Could reflect quiet confidence that builds over time",
      leadershipImpression: "May suggest collaborative leadership rather than dominance",
      emotionalExpression: "Expressive eyes that could indicate emotional awareness",
    },
    aiSummary:
      "For self-reflection, your facial expression may suggest someone who communicates with intention and listens carefully. The overall impression could reflect a blend of approachability and inner resolve. Consider how you present yourself in important conversations — this is symbolic reflection, not a fixed assessment.",
    confidenceInsights: [
      "May grow confidence through preparation and practice",
      "Could reflect more self-assurance in familiar settings",
    ],
    communicationInsights: [
      "Likely benefits from clear, structured messaging",
      "May be perceived as trustworthy when speaking authentically",
    ],
    leadershipInsights: [
      "Could excel at leading through empathy and example",
      "May prefer influencing through collaboration over authority",
    ],
    stressPattern: [
      "Tension may show during high-pressure deadlines",
      "Could benefit from brief reset rituals between tasks",
    ],
    createdAt: new Date().toISOString(),
  };
}

export function generateMockNumerologySummary(
  userId: string,
  data: {
    fullName?: string;
    birthDate: string;
    lifePathNumber: number;
    expressionNumber?: number;
    soulNumber?: number;
    personalYearNumber: number;
  }
): NumerologyReading {
  const theme =
    LIFE_PATH_THEMES[data.lifePathNumber] ?? "Unique path of personal growth";
  return {
    id: crypto.randomUUID(),
    userId,
    fullName: data.fullName,
    birthDate: data.birthDate,
    lifePathNumber: data.lifePathNumber,
    expressionNumber: data.expressionNumber,
    soulNumber: data.soulNumber,
    personalYearNumber: data.personalYearNumber,
    aiSummary: `Your Life Path Number ${data.lifePathNumber} symbolically reflects ${theme.toLowerCase()}. This year (Personal Year ${data.personalYearNumber}) may invite focus on intentional growth and honest self-reflection. Strengths could include natural curiosity and the ability to learn from experience. Challenges may involve balancing ambition with rest. For career reflection, consider aligning daily work with values that energise you. In relationships, authentic communication may deepen connection. Your suggested growth focus: choose one small habit that reinforces your strengths this month. For entertainment and self-reflection only.`,
    createdAt: new Date().toISOString(),
  };
}

export function generateMockTarotReading(
  userId: string,
  question: string,
  cards: TarotReading["cards"],
  spreadType: TarotReading["spreadType"]
): TarotReading {
  return {
    id: crypto.randomUUID(),
    userId,
    question,
    spreadType,
    cards,
    aiInterpretation: `Regarding "${question}", the cards drawn invite reflection rather than fixed prediction. ${cards[0]?.name} in the ${cards[0]?.position} position may symbolically suggest examining your current perspective with curiosity. The overall spread could reflect themes of growth, patience, and intentional choice. Consider what resonates personally rather than seeking certainty.`,
    actionReflection:
      "Take 10 minutes to journal what each card means to you personally. Identify one small action you can take this week that aligns with your reflection. Share your insights with someone you trust for additional perspective.",
    createdAt: new Date().toISOString(),
  };
}

export function generateMockUnifiedProfile(
  userId: string,
  completedModules: DiscoveryModuleId[],
  weights: Partial<Record<DiscoveryModuleId, number>>,
  modules: {
    palm?: PalmReading | null;
    face?: FaceReading | null;
    numerology?: NumerologyReading | null;
    tarot?: TarotReading | null;
    quiz?: unknown;
  }
): UnifiedProfile {
  const moduleCount = completedModules.length;
  const confidence = Math.min(95, 40 + moduleCount * 12);

  return {
    id: crypto.randomUUID(),
    userId,
    completedModules,
    weights: weights as UnifiedProfile["weights"],
    unifiedSummary: `Based on ${moduleCount} self-discovery module${moduleCount === 1 ? "" : "s"}, your profile symbolically suggests a person navigating growth with intention. Across your readings, themes of self-awareness, practical action, and authentic connection may emerge. This unified view is for reflection and life design — not prediction. Use these insights as conversation starters with yourself about who you are becoming.`,
    topStrengths: [
      "Thoughtful self-reflection",
      "Resilience through change",
      "Capacity for meaningful connection",
      "Willingness to explore new perspectives",
      "Practical problem-solving ability",
    ],
    blindSpots: [
      "May delay decisions while seeking perfect clarity",
      "Could underestimate existing strengths",
      "Might avoid difficult conversations too long",
    ],
    careerDirection: [
      "Roles that blend purpose with practical impact",
      "Growth through skill-building and experimentation",
      "Environments that value authentic communication",
    ],
    relationshipStyle: [
      "Values depth and loyalty in close relationships",
      "May need clear boundaries to maintain energy",
    ],
    moneyStyle: [
      "Likely prefers security with room for intentional spending",
      "Could benefit from simple tracking and goal-based saving",
    ],
    growthRecommendations: [
      "Complete remaining discovery modules for a richer profile",
      "Choose one weekly reflection practice",
      "Set one 90-day goal aligned with your top strength",
    ],
    stressPattern: [
      "Stress may build during periods of unclear priorities",
      "Recovery improves with movement, rest, and social support",
    ],
    blueprintConfidenceScore: confidence,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

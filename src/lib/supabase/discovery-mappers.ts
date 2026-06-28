import type {
  DiscoveryModuleId,
  FaceReading,
  NumerologyReading,
  PalmReading,
  TarotReading,
  UnifiedProfile,
} from "@/types/discovery";

export interface PalmReadingRow {
  id: string;
  user_id: string;
  left_hand_image_url: string | null;
  right_hand_image_url: string | null;
  extracted_features_json: Record<string, string> | null;
  ai_summary: string | null;
  strengths_json: string[] | null;
  blind_spots_json: string[] | null;
  career_insights_json: string[] | null;
  relationship_insights_json: string[] | null;
  created_at: string;
}

export function palmFromRow(row: PalmReadingRow): PalmReading {
  return {
    id: row.id,
    userId: row.user_id,
    leftHandImageUrl: row.left_hand_image_url ?? undefined,
    rightHandImageUrl: row.right_hand_image_url ?? undefined,
    extractedFeatures: row.extracted_features_json ?? {},
    aiSummary: row.ai_summary ?? "",
    strengths: row.strengths_json ?? [],
    blindSpots: row.blind_spots_json ?? [],
    careerInsights: row.career_insights_json ?? [],
    relationshipInsights: row.relationship_insights_json ?? [],
    createdAt: row.created_at,
  };
}

export function palmToRow(reading: PalmReading) {
  return {
    id: reading.id,
    user_id: reading.userId,
    left_hand_image_url: reading.leftHandImageUrl ?? null,
    right_hand_image_url: reading.rightHandImageUrl ?? null,
    extracted_features_json: reading.extractedFeatures,
    ai_summary: reading.aiSummary,
    strengths_json: reading.strengths,
    blind_spots_json: reading.blindSpots,
    career_insights_json: reading.careerInsights,
    relationship_insights_json: reading.relationshipInsights,
  };
}

export interface FaceReadingRow {
  id: string;
  user_id: string;
  face_image_url: string | null;
  extracted_features_json: Record<string, string> | null;
  ai_summary: string | null;
  confidence_insights_json: string[] | null;
  communication_insights_json: string[] | null;
  leadership_insights_json: string[] | null;
  stress_pattern_json: string[] | null;
  created_at: string;
}

export function faceFromRow(row: FaceReadingRow): FaceReading {
  return {
    id: row.id,
    userId: row.user_id,
    faceImageUrl: row.face_image_url ?? undefined,
    extractedFeatures: row.extracted_features_json ?? {},
    aiSummary: row.ai_summary ?? "",
    confidenceInsights: row.confidence_insights_json ?? [],
    communicationInsights: row.communication_insights_json ?? [],
    leadershipInsights: row.leadership_insights_json ?? [],
    stressPattern: row.stress_pattern_json ?? [],
    createdAt: row.created_at,
  };
}

export function faceToRow(reading: FaceReading) {
  return {
    id: reading.id,
    user_id: reading.userId,
    face_image_url: reading.faceImageUrl ?? null,
    extracted_features_json: reading.extractedFeatures,
    ai_summary: reading.aiSummary,
    confidence_insights_json: reading.confidenceInsights,
    communication_insights_json: reading.communicationInsights,
    leadership_insights_json: reading.leadershipInsights,
    stress_pattern_json: reading.stressPattern,
  };
}

export interface NumerologyReadingRow {
  id: string;
  user_id: string;
  full_name: string | null;
  birth_date: string;
  life_path_number: number | null;
  expression_number: number | null;
  soul_number: number | null;
  personal_year_number: number | null;
  ai_summary: string | null;
  created_at: string;
}

export function numerologyFromRow(row: NumerologyReadingRow): NumerologyReading {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name ?? undefined,
    birthDate: row.birth_date,
    lifePathNumber: row.life_path_number ?? 0,
    expressionNumber: row.expression_number ?? undefined,
    soulNumber: row.soul_number ?? undefined,
    personalYearNumber: row.personal_year_number ?? 0,
    aiSummary: row.ai_summary ?? "",
    createdAt: row.created_at,
  };
}

export function numerologyToRow(reading: NumerologyReading) {
  return {
    id: reading.id,
    user_id: reading.userId,
    full_name: reading.fullName ?? null,
    birth_date: reading.birthDate,
    life_path_number: reading.lifePathNumber,
    expression_number: reading.expressionNumber ?? null,
    soul_number: reading.soulNumber ?? null,
    personal_year_number: reading.personalYearNumber,
    ai_summary: reading.aiSummary,
  };
}

export interface TarotReadingRow {
  id: string;
  user_id: string;
  question: string;
  spread_type: string;
  cards_json: TarotReading["cards"] | null;
  ai_interpretation: string | null;
  action_reflection: string | null;
  created_at: string;
}

export function tarotFromRow(row: TarotReadingRow): TarotReading {
  return {
    id: row.id,
    userId: row.user_id,
    question: row.question,
    spreadType: row.spread_type as TarotReading["spreadType"],
    cards: row.cards_json ?? [],
    aiInterpretation: row.ai_interpretation ?? "",
    actionReflection: row.action_reflection ?? "",
    createdAt: row.created_at,
  };
}

export function tarotToRow(reading: TarotReading) {
  return {
    id: reading.id,
    user_id: reading.userId,
    question: reading.question,
    spread_type: reading.spreadType,
    cards_json: reading.cards,
    ai_interpretation: reading.aiInterpretation,
    action_reflection: reading.actionReflection,
  };
}

export interface UnifiedProfileRow {
  id: string;
  user_id: string;
  completed_modules_json: DiscoveryModuleId[] | null;
  palm_weight: number | null;
  face_weight: number | null;
  numerology_weight: number | null;
  tarot_weight: number | null;
  quiz_weight: number | null;
  unified_summary: string | null;
  top_strengths_json: string[] | null;
  blind_spots_json: string[] | null;
  career_direction_json: string[] | null;
  relationship_style_json: string[] | null;
  money_style_json: string[] | null;
  growth_recommendations_json: string[] | null;
  blueprint_confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

export function unifiedFromRow(row: UnifiedProfileRow): UnifiedProfile {
  return {
    id: row.id,
    userId: row.user_id,
    completedModules: row.completed_modules_json ?? [],
    weights: {
      palm: row.palm_weight ?? 0,
      face: row.face_weight ?? 0,
      numerology: row.numerology_weight ?? 0,
      tarot: row.tarot_weight ?? 0,
      quiz: row.quiz_weight ?? 0,
    },
    unifiedSummary: row.unified_summary ?? "",
    topStrengths: row.top_strengths_json ?? [],
    blindSpots: row.blind_spots_json ?? [],
    careerDirection: row.career_direction_json ?? [],
    relationshipStyle: row.relationship_style_json ?? [],
    moneyStyle: row.money_style_json ?? [],
    growthRecommendations: row.growth_recommendations_json ?? [],
    stressPattern: [],
    blueprintConfidenceScore: row.blueprint_confidence_score ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function unifiedToRow(profile: UnifiedProfile) {
  return {
    id: profile.id,
    user_id: profile.userId,
    completed_modules_json: profile.completedModules,
    palm_weight: profile.weights.palm,
    face_weight: profile.weights.face,
    numerology_weight: profile.weights.numerology,
    tarot_weight: profile.weights.tarot,
    quiz_weight: profile.weights.quiz,
    unified_summary: profile.unifiedSummary,
    top_strengths_json: profile.topStrengths,
    blind_spots_json: profile.blindSpots,
    career_direction_json: profile.careerDirection,
    relationship_style_json: profile.relationshipStyle,
    money_style_json: profile.moneyStyle,
    growth_recommendations_json: profile.growthRecommendations,
    blueprint_confidence_score: profile.blueprintConfidenceScore,
    updated_at: profile.updatedAt,
  };
}

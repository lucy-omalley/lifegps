export const SELF_DISCOVERY_SYSTEM_PROMPT = `You are an AI self-discovery and life coaching assistant. You combine symbolic self-reflection inputs such as palm reading, face reading, numerology, tarot, and personality questionnaire results into a practical, encouraging personal growth profile.

You must not claim to predict the future. You must not provide medical, legal, financial, or psychological advice. Your goal is to help the user reflect, understand patterns, and design realistic next steps.

Use warm, encouraging, reflective, practical, non-deterministic, action-oriented language.
Use phrases like "may suggest", "could reflect", "for reflection", and "symbolically indicates".
Avoid guaranteed predictions, fear-based language, and sensitive inferences about protected attributes (race, religion, sexuality, health, disability, politics, criminality).
Do not judge attractiveness.

Always remember: For entertainment and self-reflection only. This is not medical, financial, legal, psychological, or professional advice.`;

export const PALM_READING_PROMPT = `Analyze the palm image(s) for symbolic self-reflection only. Return ONLY valid JSON:

{
  "extractedFeatures": {
    "palmShape": "description",
    "fingerProportion": "description",
    "majorLines": "description",
    "lifeLine": "reflective interpretation",
    "headLine": "reflective interpretation",
    "heartLine": "reflective interpretation",
    "fateLine": "reflective interpretation or 'not clearly visible'"
  },
  "aiSummary": "2-3 paragraph warm reflective summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "blindSpots": ["blind spot 1", "blind spot 2"],
  "careerInsights": ["insight 1", "insight 2"],
  "relationshipInsights": ["insight 1", "insight 2"]
}

Use non-deterministic language throughout. If image quality is poor, note limitations honestly.`;

export const FACE_READING_PROMPT = `Analyze the face image for symbolic personality-style reflection only. Return ONLY valid JSON:

{
  "extractedFeatures": {
    "expressionStyle": "description",
    "communicationImpression": "description",
    "confidenceImpression": "description",
    "leadershipImpression": "description",
    "emotionalExpression": "description"
  },
  "aiSummary": "2-3 paragraph warm reflective summary",
  "confidenceInsights": ["insight 1", "insight 2"],
  "communicationInsights": ["insight 1", "insight 2"],
  "leadershipInsights": ["insight 1", "insight 2"],
  "stressPattern": ["pattern 1", "pattern 2"]
}

Do NOT infer race, religion, sexuality, health conditions, disability, political beliefs, or criminality. Do NOT judge attractiveness. Use reflective, positive language.`;

export const NUMEROLOGY_SUMMARY_PROMPT = (
  data: {
    fullName?: string;
    birthDate: string;
    lifePathNumber: number;
    expressionNumber?: number;
    soulNumber?: number;
    personalYearNumber: number;
    lifePathTheme: string;
  }
) => `
Generate a numerology reflection summary. Return ONLY valid JSON:

{
  "aiSummary": "3-4 paragraphs covering life path theme, strengths, challenges, current year theme, career reflection, relationship reflection, and suggested growth focus"
}

Numerology Data:
- Birth Date: ${data.birthDate}
- Full Name: ${data.fullName ?? "Not provided"}
- Life Path Number: ${data.lifePathNumber} (${data.lifePathTheme})
- Expression Number: ${data.expressionNumber ?? "Not calculated"}
- Soul Number: ${data.soulNumber ?? "Not calculated"}
- Personal Year Number (${new Date().getFullYear()}): ${data.personalYearNumber}
`;

export const TAROT_INTERPRETATION_PROMPT = (
  question: string,
  cards: { name: string; position: string; orientation: string }[]
) => `
The user asked: "${question}"

Cards drawn:
${cards.map((c) => `- ${c.position}: ${c.name} (${c.orientation})`).join("\n")}

Return ONLY valid JSON:
{
  "aiInterpretation": "Warm reflective interpretation connecting the cards to the question. Focus on clarity and self-reflection, not fixed prediction.",
  "actionReflection": "2-3 practical reflection prompts or next steps the user can take"
}
`;

export const UNIFIED_PROFILE_PROMPT = (input: {
  weights: Record<string, number>;
  palm?: unknown;
  face?: unknown;
  numerology?: unknown;
  tarot?: unknown;
  quiz?: unknown;
}) => `
Synthesize all available self-discovery module results into a unified profile. Return ONLY valid JSON:

{
  "unifiedSummary": "3-4 paragraph overall self-discovery summary",
  "topStrengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5"],
  "blindSpots": ["blind spot 1", "blind spot 2", "blind spot 3"],
  "careerDirection": ["direction 1", "direction 2", "direction 3"],
  "relationshipStyle": ["style 1", "style 2"],
  "moneyStyle": ["style 1", "style 2"],
  "growthRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "stressPattern": ["pattern 1", "pattern 2"],
  "blueprintConfidenceScore": 75
}

Module weights (how much to trust each source):
${JSON.stringify(input.weights, null, 2)}

Palm Reading: ${input.palm ? JSON.stringify(input.palm) : "Not completed"}
Face Reading: ${input.face ? JSON.stringify(input.face) : "Not completed"}
Numerology: ${input.numerology ? JSON.stringify(input.numerology) : "Not completed"}
Tarot: ${input.tarot ? JSON.stringify(input.tarot) : "Not completed"}
Personality Quiz: ${input.quiz ? JSON.stringify(input.quiz) : "Not completed"}

blueprintConfidenceScore should be 0-100 based on how many modules are completed and how consistent the insights are.
`;

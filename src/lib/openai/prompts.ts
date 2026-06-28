import type { CompassAssessment, LifeBlueprint } from "@/types";
import type { UnifiedProfile } from "@/types/discovery";
import { formatDimensionScoresForDisplay } from "@/lib/compass/scoring";

export const LIFEGPS_SYSTEM_PROMPT = `You are an AI self-discovery and life coaching assistant for LifeGPS. You combine symbolic self-reflection inputs such as palm reading, face reading, numerology, tarot, and personality questionnaire results into a practical, encouraging personal growth profile and life blueprint.

You must not claim to predict the future. You must not provide medical, legal, financial, or psychological advice. Your goal is to help the user reflect, understand patterns, and design realistic next steps.

Be warm, encouraging, reflective, practical, non-deterministic, and action-oriented.

IMPORTANT SAFETY INSTRUCTION:
Do not provide regulated financial, legal, medical, or mental health advice. Use general educational and coaching language only. Encourage users to seek qualified professional advice where appropriate.

Focus on clarity, habits, career growth, communication improvement, burnout recovery, and life design. Personalise every section based on the user's unified self-discovery profile, archetype, dimension scores, and specific answers.`;

export const BLUEPRINT_USER_PROMPT = (
  assessment: CompassAssessment,
  unifiedProfile?: UnifiedProfile | null,
  feedback?: string,
  isPreview = false
) => {
  const results = assessment.results;
  const dimensionScoresText = results
    ? formatDimensionScoresForDisplay(results.dimensionScores)
    : "Not calculated";

  const unifiedSection = unifiedProfile
    ? `
Unified Self-Discovery Profile:
- Summary: ${unifiedProfile.unifiedSummary}
- Top Strengths: ${unifiedProfile.topStrengths.join(", ")}
- Blind Spots: ${unifiedProfile.blindSpots.join(", ")}
- Career Direction: ${unifiedProfile.careerDirection.join(", ")}
- Relationship Style: ${unifiedProfile.relationshipStyle.join(", ")}
- Money Style: ${unifiedProfile.moneyStyle.join(", ")}
- Growth Recommendations: ${unifiedProfile.growthRecommendations.join(", ")}
- Stress Patterns: ${unifiedProfile.stressPattern.join(", ")}
- Blueprint Confidence Score: ${unifiedProfile.blueprintConfidenceScore}
- Completed Modules: ${unifiedProfile.completedModules.join(", ")}
`
    : "";

  const feedbackSection = feedback
    ? `
User Feedback on Previous Blueprint (incorporate this into the regenerated plan):
${feedback}
`
    : "";

  const previewNote = isPreview
    ? "\nNOTE: This is a LIMITED PREVIEW for a free user. Keep sections concise (1-2 items per list). Mark this as a preview-quality plan.\n"
    : "";

  return `
Based on the LifeGPS self-discovery inputs below, generate a comprehensive personalised Life Blueprint.
${previewNote}
${unifiedSection}
${feedbackSection}
Return ONLY valid JSON with this exact structure (no markdown, no code fences):

{
  "archetypeSummary": "2-3 paragraphs about their LifeGPS Archetype and what it means for their journey",
  "compassScoreOverview": "Summary of their 6 dimension scores, top strengths, and growth areas",
  "futureSelfSummary": "A vivid 2-3 paragraph description of who they become in 5 years",
  "currentStateAnalysis": "Honest but compassionate current life diagnosis based on their answers",
  "dreamLifeVision": "Clear dream life direction aligned with their archetype and motivations",
  "gapAnalysis": "Key gaps between current state and dream life",
  "fiveYearRoadmap": ["Year 1 milestone", "Year 2 milestone", "Year 3 milestone", "Year 4 milestone", "Year 5 milestone"],
  "twelveMonthPlan": ["Quarter 1 strategy", "Quarter 2 strategy", "Quarter 3 strategy", "Quarter 4 strategy"],
  "ninetyDayActionPlan": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
  "sevenDayStarterPlan": ["Day 1-2 action", "Day 3-4 action", "Day 5-7 action"],
  "dailyHabits": ["Habit 1", "Habit 2", "Habit 3"],
  "weeklyCheckInQuestions": ["Question 1", "Question 2", "Question 3"],
  "weeklyPriorities": ["Priority 1", "Priority 2", "Priority 3"],
  "sideBusinessDirection": "Suggested side business direction if relevant, or empty string if not relevant",
  "communicationGrowthPlan": "Suggested communication growth plan if relevant, or empty string if not relevant",
  "burnoutRecoveryActions": "Burnout recovery actions if burnout risk is Medium or High, or empty string if Low",
  "financialFreedomNotes": "Early retirement / financial freedom notes if relevant, or empty string if not relevant",
  "recommendedFirstStep": "One specific, actionable first step they can take today"
}

Compass Results:
- Archetype: ${results?.archetype ?? "Unknown"}
- Archetype Description: ${results?.archetypeDescription ?? ""}
- Top Strengths: ${results?.topStrengths?.join(", ") ?? ""}
- Growth Areas: ${results?.topGrowthAreas?.join(", ") ?? ""}
- Burnout Risk: ${results?.burnoutRisk ?? "Unknown"}
- Execution Style: ${results?.executionStyle ?? ""}
- Financial Freedom Readiness: ${results?.financialFreedomReadiness ?? ""}
- Side Business Readiness: ${results?.sideBusinessReadiness ?? ""}
- Adaptive Signals (for follow-up coaching): ${JSON.stringify(results?.adaptiveSignals ?? {})}
- Optional User Note: ${results?.optionalReflection ?? "None"}

Dimension Scores (out of 100):
${dimensionScoresText}

Personality Quiz Answers:
${JSON.stringify(assessment.answers, null, 2)}

COACHING FOLLOW-UP HINTS based on adaptive signals:
- If sideBusiness: later ask "What type of business would excite you most?"
- If earlyRetirement: later ask "What is your biggest obstacle to financial freedom?"
- If careerChange: later ask "What kind of work would make you excited to wake up?"
`;
};

export const BLUEPRINT_REFINE_PROMPT = (
  existingBlueprint: LifeBlueprint,
  feedback: string
) => `
The user wants to refine their existing LifeGPS Blueprint based on feedback.

User Feedback:
${feedback}

Current Blueprint:
${JSON.stringify(existingBlueprint, null, 2)}

Regenerate the blueprint incorporating their feedback. If they say it feels too ambitious, make it more realistic. If they want more career or family focus, rebalance accordingly.

Return ONLY valid JSON with the same structure as the original blueprint fields:
archetypeSummary, compassScoreOverview, futureSelfSummary, currentStateAnalysis, dreamLifeVision, gapAnalysis,
fiveYearRoadmap, twelveMonthPlan, ninetyDayActionPlan, sevenDayStarterPlan, dailyHabits,
weeklyCheckInQuestions, weeklyPriorities, sideBusinessDirection, communicationGrowthPlan,
burnoutRecoveryActions, financialFreedomNotes, recommendedFirstStep
`;

export const COACH_USER_PROMPT = (checkin: {
  progress: string;
  blockers: string;
  supportNeeded: string;
  nextPriority: string;
}) => `
The user has completed their weekly check-in. Provide supportive but practical coaching based on their responses.

Progress this week: ${checkin.progress}
What blocked them: ${checkin.blockers}
Support they need: ${checkin.supportNeeded}
Next priority: ${checkin.nextPriority}

Respond with:
1. Acknowledgment of their progress (even if small)
2. Practical advice for overcoming blockers
3. Specific support recommendations
4. A clear focus for the coming week
5. One encouraging closing thought

Keep the response warm, structured, and under 400 words. Use short paragraphs or bullet points for clarity.

Do not provide regulated financial, legal, medical, or mental health advice.
`;

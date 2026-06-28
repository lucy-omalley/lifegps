import { getOpenAIClient } from "@/lib/openai/client";
import { analyseFeedback } from "@/lib/founder/analyseFeedback";
import type { BlueprintFeedback, FeedbackAnalysis } from "@/types";

export const FEEDBACK_ANALYST_SYSTEM_PROMPT = `You are the LifeGPS Feedback Analyst Agent. You summarise user feedback on Life Blueprints, identify product improvements, and suggest AI prompt changes. Work only with anonymised aggregate data. Be concise and actionable. Do not expose individual user identities.`;

/** Rule-based analysis — primary implementation */
export function runFeedbackAnalysis(
  feedbackData: BlueprintFeedback[]
): FeedbackAnalysis {
  return analyseFeedback(feedbackData);
}

/** Optional AI-enhanced summary on top of rule-based analysis */
export async function generateFeedbackAnalysisReport(
  feedbackData: BlueprintFeedback[]
): Promise<FeedbackAnalysis & { aiSummary?: string }> {
  const base = runFeedbackAnalysis(feedbackData);

  if (!process.env.OPENAI_API_KEY || feedbackData.length === 0) {
    return base;
  }

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: FEEDBACK_ANALYST_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Summarise this anonymised feedback analysis in 3-4 sentences for the founder:\n${JSON.stringify(base, null, 2)}`,
      },
    ],
    temperature: 0.5,
  });

  return {
    ...base,
    aiSummary: completion.choices[0]?.message?.content ?? undefined,
  };
}

/** Suggest specific prompt edits based on feedback patterns */
export function suggestPromptImprovements(
  analysis: FeedbackAnalysis
): string[] {
  return analysis.recommendedPromptImprovements;
}

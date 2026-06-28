import { getOpenAIClient } from "@/lib/openai/client";
import {
  formatContextForAgent,
  getFounderProductContext,
} from "@/lib/founder/metrics";
import type {
  FeedbackAnalysis,
  FounderChatMessage,
  FounderProductContext,
  FounderWeeklyPlan,
} from "@/types";

export const FOUNDER_AGENT_SYSTEM_PROMPT = `You are the LifeGPS Founder Agent. You help the founder validate and grow LifeGPS. You analyse user assessments, blueprint feedback, ratings, reflection comments, and product usage patterns. Give practical startup advice. Focus on MVP validation, user retention, pricing, positioning, product roadmap, beta user feedback, and marketing. Be direct, evidence-based, and action-oriented.

IMPORTANT:
- Do not expose or invent individual user identities
- Work from aggregate and anonymised data only
- Do not provide regulated financial, legal, or investment advice
- TODO: Full role-based access control required before production`;

export async function generateFounderChatResponse(
  message: string,
  history: FounderChatMessage[],
  context?: FounderProductContext
): Promise<string> {
  const productContext = context ?? (await getFounderProductContext());
  const contextBlock = formatContextForAgent(productContext);

  const userPrompt = `
${contextBlock}

FOUNDER QUESTION:
${message}

Answer with specific, evidence-based recommendations referencing the data above where relevant.
`;

  if (!process.env.OPENAI_API_KEY) {
    return generateMockFounderResponse(message, productContext);
  }

  const openai = getOpenAIClient();
  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [
      { role: "system", content: FOUNDER_AGENT_SYSTEM_PROMPT },
      ...history.slice(-6).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userPrompt },
    ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
  });

  return (
    completion.choices[0]?.message?.content ||
    generateMockFounderResponse(message, productContext)
  );
}

export async function generateWeeklyFounderPlan(
  context?: FounderProductContext
): Promise<FounderWeeklyPlan> {
  const productContext = context ?? (await getFounderProductContext());
  const contextBlock = formatContextForAgent(productContext);

  const prompt = `
Based on this LifeGPS product data, generate a Weekly Founder Plan.

Return ONLY valid JSON:
{
  "productImprovements": ["improvement 1", "improvement 2", "improvement 3"],
  "marketingActions": ["action 1", "action 2", "action 3"],
  "userInterviewQuestions": ["question 1", "question 2", "question 3"],
  "pricingExperiment": "one specific pricing experiment",
  "retentionExperiment": "one specific retention experiment",
  "doNotBuildYet": "one thing NOT to build this week and why"
}

${contextBlock}
`;

  if (!process.env.OPENAI_API_KEY) {
    return generateMockWeeklyPlan(productContext.feedbackAnalysis);
  }

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: FOUNDER_AGENT_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return generateMockWeeklyPlan(productContext.feedbackAnalysis);
  return JSON.parse(content) as FounderWeeklyPlan;
}

function generateMockFounderResponse(
  message: string,
  context: FounderProductContext
): string {
  const { metrics, feedbackAnalysis } = context;
  const lower = message.toLowerCase();

  if (lower.includes("improve") || lower.includes("weak")) {
    return `Based on ${metrics.source} data (${metrics.totalAssessments} assessments):\n\n**Weakest sections:** ${metrics.lowestRatedSections.map((s) => `${s.section} (${s.averageRating}/5)`).join(", ") || "insufficient ratings"}\n\n**Recommended fixes:**\n${feedbackAnalysis.recommendedProductFixes.map((f) => `- ${f}`).join("\n")}\n\n**Prompt improvements:**\n${feedbackAnalysis.recommendedPromptImprovements.map((p) => `- ${p}`).join("\n")}`;
  }

  if (lower.includes("paid") || lower.includes("pricing") || lower.includes("beta")) {
    return `WTP signals: ${metrics.willingnessToPaySignals.yes} yes, ${metrics.willingnessToPaySignals.maybe} maybe, ${metrics.willingnessToPaySignals.no} no.\n\nWith ${metrics.totalBlueprints} blueprints generated, consider a **paid beta** only after fixing lowest-rated sections. Start with €9/month for 10 beta users who complete feedback.`;
  }

  if (lower.includes("segment") || lower.includes("archetype")) {
    return `Strongest segments by archetype:\n${metrics.topArchetypes.map((a) => `- ${a.archetype}: ${a.count} users`).join("\n")}\n\nTop growth areas requested:\n${metrics.topGrowthAreas.map((g) => `- ${g.area}`).join("\n")}`;
  }

  return `LifeGPS snapshot (${metrics.source}): ${metrics.totalAssessments} assessments, ${metrics.totalBlueprints} blueprints, avg rating ${metrics.averageBlueprintRating ?? "N/A"}/5.\n\nTop themes: ${metrics.topFeedbackThemes.join(", ")}.\n\nAsk me about improvements, pricing readiness, user segments, or what to build this week.`;
}

function generateMockWeeklyPlan(
  analysis: FeedbackAnalysis
): FounderWeeklyPlan {
  return {
    productImprovements: [
      analysis.recommendedProductFixes[0] ?? "Add blueprint rating UI",
      "Improve lowest-rated blueprint sections with more Compass-specific detail",
      "Add email capture after archetype reveal for beta waitlist",
    ],
    marketingActions: [
      "Post 1 LinkedIn story: 'I took the LifeGPS Compass — here's my archetype'",
      "DM 5 professionals who mention burnout and offer free Compass access",
      "Share anonymised archetype distribution chart",
    ],
    userInterviewQuestions: [
      "What would make you pay €9/month for LifeGPS?",
      "Which blueprint section felt most/least useful?",
      "Would you return weekly for coaching check-ins?",
    ],
    pricingExperiment:
      "Offer €9/month paid beta to next 10 users who complete assessment + rate blueprint",
    retentionExperiment:
      "Send automated Day 3 email with 7-day starter plan from their blueprint",
    doNotBuildYet:
      "Full habit tracking app — focus on blueprint quality and feedback loop first",
  };
}

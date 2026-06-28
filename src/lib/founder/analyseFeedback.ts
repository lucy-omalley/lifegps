import type {
  BlueprintFeedback,
  FeedbackAnalysis,
  FounderMetrics,
  SectionRatings,
} from "@/types";

export const BLUEPRINT_SECTIONS = [
  "archetypeSummary",
  "compassScoreOverview",
  "futureSelfSummary",
  "currentStateAnalysis",
  "dreamLifeVision",
  "gapAnalysis",
  "fiveYearRoadmap",
  "twelveMonthPlan",
  "ninetyDayActionPlan",
  "sevenDayStarterPlan",
  "dailyHabits",
  "weeklyCheckInQuestions",
  "sideBusinessDirection",
  "communicationGrowthPlan",
  "burnoutRecoveryActions",
  "financialFreedomNotes",
  "recommendedFirstStep",
] as const;

function extractThemes(text: string): string[] {
  const lower = text.toLowerCase();
  const themeKeywords: Record<string, string[]> = {
    "Too generic": ["generic", "vague", "broad", "not specific", "cookie cutter"],
    "Needs more career detail": ["career", "job", "work transition"],
    "Needs financial clarity": ["money", "financial", "income", "salary", "debt"],
    "Burnout support lacking": ["burnout", "exhausted", "tired", "overwhelmed"],
    "Side business too light": ["side business", "entrepreneur", "startup"],
    "Communication gaps": ["communication", "confidence", "speaking"],
    "Habits not actionable": ["habit", "daily", "routine", "actionable"],
    "Timeline unrealistic": ["unrealistic", "too ambitious", "timeline", "5 year"],
    "Missing local context": ["local", "country", "region", "context", "culture"],
    "Wants more accountability": ["accountability", "check-in", "coach", "follow up"],
  };

  return Object.entries(themeKeywords)
    .filter(([, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([theme]) => theme);
}

function aggregateSectionRatings(
  feedbackList: Pick<BlueprintFeedback, "sectionRatings">[]
): { section: string; averageRating: number }[] {
  const totals: Record<string, { sum: number; count: number }> = {};

  for (const fb of feedbackList) {
    const ratings = fb.sectionRatings as SectionRatings;
    for (const [section, rating] of Object.entries(ratings)) {
      if (typeof rating !== "number") continue;
      if (!totals[section]) totals[section] = { sum: 0, count: 0 };
      totals[section].sum += rating;
      totals[section].count += 1;
    }
  }

  return Object.entries(totals)
    .map(([section, { sum, count }]) => ({
      section,
      averageRating: Math.round((sum / count) * 10) / 10,
    }))
    .sort((a, b) => a.averageRating - b.averageRating);
}

/** Rule-based feedback analysis — anonymised, no PII */
export function analyseFeedback(
  feedbackData: BlueprintFeedback[]
): FeedbackAnalysis {
  if (feedbackData.length === 0) {
    return {
      topThemes: ["No feedback collected yet"],
      lowestRatedSections: [],
      commonMissingContext: [],
      commonUnrealisticRecommendations: [],
      recommendedProductFixes: [
        "Add blueprint rating UI after generation",
        "Collect section-level ratings",
        "Add optional reflection field",
      ],
      recommendedPromptImprovements: [
        "Personalise roadmap timelines based on user energy scores",
        "Add country/region context when location data is available",
      ],
    };
  }

  const themeCounts: Record<string, number> = {};
  const missingContextCounts: Record<string, number> = {};
  const unrealisticCounts: Record<string, number> = {};

  for (const fb of feedbackData) {
    const combined = [fb.reflection, fb.missingContext, fb.unrealisticParts]
      .filter(Boolean)
      .join(" ");

    for (const theme of extractThemes(combined)) {
      themeCounts[theme] = (themeCounts[theme] ?? 0) + 1;
    }

    if (fb.missingContext?.trim()) {
      const key = fb.missingContext.trim().slice(0, 80);
      missingContextCounts[key] = (missingContextCounts[key] ?? 0) + 1;
    }

    if (fb.unrealisticParts?.trim()) {
      const key = fb.unrealisticParts.trim().slice(0, 80);
      unrealisticCounts[key] = (unrealisticCounts[key] ?? 0) + 1;
    }
  }

  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);

  const lowestRatedSections = aggregateSectionRatings(feedbackData).slice(0, 5);

  const commonMissingContext = Object.entries(missingContextCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text]) => text);

  const commonUnrealisticRecommendations = Object.entries(unrealisticCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text]) => text);

  const recommendedProductFixes: string[] = [];
  const recommendedPromptImprovements: string[] = [];

  if (lowestRatedSections[0]?.averageRating < 3) {
    recommendedProductFixes.push(
      `Improve "${formatSectionLabel(lowestRatedSections[0].section)}" section quality and specificity`
    );
    recommendedPromptImprovements.push(
      `Add explicit instructions for ${lowestRatedSections[0].section} with concrete examples`
    );
  }

  if (topThemes.includes("Too generic")) {
    recommendedPromptImprovements.push(
      "Require AI to reference at least 3 specific Compass answers in each major section"
    );
  }

  if (topThemes.includes("Timeline unrealistic")) {
    recommendedPromptImprovements.push(
      "Scale 5-year roadmap ambition based on execution score and burnout risk"
    );
  }

  if (topThemes.includes("Habits not actionable")) {
    recommendedProductFixes.push(
      "Limit daily habits to ≤15 minutes each with trigger + reward format"
    );
  }

  if (recommendedProductFixes.length === 0) {
    recommendedProductFixes.push(
      "Continue collecting feedback — sample size is still small"
    );
  }

  if (recommendedPromptImprovements.length === 0) {
    recommendedPromptImprovements.push(
      "Monitor lowest-rated sections as feedback volume grows"
    );
  }

  return {
    topThemes: topThemes.length ? topThemes : ["Mixed feedback — need more data"],
    lowestRatedSections,
    commonMissingContext,
    commonUnrealisticRecommendations,
    recommendedProductFixes,
    recommendedPromptImprovements,
  };
}

export function formatSectionLabel(section: string): string {
  return section
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function averageOverallRating(
  feedbackData: Pick<BlueprintFeedback, "overallRating">[]
): number | null {
  if (feedbackData.length === 0) return null;
  const sum = feedbackData.reduce((acc, fb) => acc + fb.overallRating, 0);
  return Math.round((sum / feedbackData.length) * 10) / 10;
}

export function buildMockFounderMetrics(): FounderMetrics {
  const mockFeedback: BlueprintFeedback[] = [
    {
      id: "1",
      blueprintId: "bp-1",
      overallRating: 4,
      sectionRatings: {
        archetypeSummary: 5,
        gapAnalysis: 3,
        ninetyDayActionPlan: 4,
        fiveYearRoadmap: 2,
        dailyHabits: 4,
      },
      reflection: "Loved the archetype but the 5-year plan felt too generic",
      missingContext: "Did not mention my industry or country",
      willingnessToPay: "maybe",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      blueprintId: "bp-2",
      overallRating: 3,
      sectionRatings: {
        archetypeSummary: 4,
        burnoutRecoveryActions: 5,
        sideBusinessDirection: 2,
        twelveMonthPlan: 3,
      },
      reflection: "Burnout section was spot on. Side business advice too vague.",
      unrealisticParts: "Suggested leaving job in 6 months — not realistic",
      willingnessToPay: "yes",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      blueprintId: "bp-3",
      overallRating: 5,
      sectionRatings: {
        sevenDayStarterPlan: 5,
        dailyHabits: 5,
        dreamLifeVision: 4,
      },
      reflection: "7-day starter plan was immediately actionable",
      willingnessToPay: "yes",
      createdAt: new Date().toISOString(),
    },
  ];

  const analysis = analyseFeedback(mockFeedback);

  return {
    totalAssessments: 47,
    totalBlueprints: 42,
    totalRecalculatedBlueprints: 8,
    averageBlueprintRating: averageOverallRating(mockFeedback),
    lowestRatedSections: analysis.lowestRatedSections,
    topFeedbackThemes: analysis.topThemes,
    mostRequestedFocusAreas: [
      "Career direction",
      "Burnout recovery",
      "Side business planning",
      "Financial freedom",
      "Better habits",
    ],
    willingnessToPaySignals: { yes: 12, maybe: 18, no: 7 },
    topArchetypes: [
      { archetype: "The Burnout Escaper", count: 14 },
      { archetype: "The Purpose Explorer", count: 11 },
      { archetype: "The Strategic Builder", count: 9 },
      { archetype: "The Creative Starter", count: 8 },
    ],
    topGrowthAreas: [
      { area: "Energy, Burnout & Lifestyle", count: 22 },
      { area: "Execution & Habits", count: 19 },
      { area: "Communication & Confidence", count: 15 },
    ],
    topUserGoals: [
      { goal: "More clarity", count: 18 },
      { goal: "Career direction", count: 14 },
      { goal: "Less stress", count: 12 },
      { goal: "Side business idea", count: 9 },
    ],
    checkInSummaries: [
      "Users frequently blocked by lack of time and low energy",
      "Many want accountability and weekly check-in reminders",
      "Common next priority: one small habit for 7 days",
    ],
    source: "mock",
  };
}

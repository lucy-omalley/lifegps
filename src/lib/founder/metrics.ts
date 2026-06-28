import {
  analyseFeedback,
  averageOverallRating,
  buildMockFounderMetrics,
} from "@/lib/founder/analyseFeedback";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type {
  BlueprintFeedback,
  CompassAssessment,
  FounderMetrics,
  FounderProductContext,
} from "@/types";

interface FeedbackRow {
  id: string;
  blueprint_id: string | null;
  overall_rating: number | null;
  section_ratings: Record<string, number>;
  reflection: string | null;
  missing_context: string | null;
  unrealistic_parts: string | null;
  willingness_to_pay: string | null;
  is_recalculation: boolean;
  created_at: string;
}

function feedbackFromRow(row: FeedbackRow): BlueprintFeedback {
  return {
    id: row.id,
    blueprintId: row.blueprint_id ?? "",
    overallRating: row.overall_rating ?? 0,
    sectionRatings: row.section_ratings ?? {},
    reflection: row.reflection ?? undefined,
    missingContext: row.missing_context ?? undefined,
    unrealisticParts: row.unrealistic_parts ?? undefined,
    willingnessToPay: row.willingness_to_pay as BlueprintFeedback["willingnessToPay"],
    isRecalculation: row.is_recalculation,
    createdAt: row.created_at,
  };
}

function countByField<T extends string>(
  items: T[]
): { label: T; count: number }[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label: label as T, count }))
    .sort((a, b) => b.count - a.count);
}

export async function fetchFounderMetricsFromDatabase(): Promise<FounderMetrics | null> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return null;

  try {
    const [assessmentsRes, blueprintsRes, feedbackRes, checkinsRes] =
      await Promise.all([
        supabase
          .from("assessments")
          .select("id, data", { count: "exact" })
          .eq("is_complete", true),
        supabase
          .from("life_blueprints")
          .select("id, parent_blueprint_id, recalculation_count"),
        supabase
          .from("blueprint_feedback")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("weekly_checkins")
          .select("blockers, support_needed, next_priority")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

    if (assessmentsRes.error?.code === "42P01") return null;

    const assessments = (assessmentsRes.data ?? []) as {
      id: string;
      data: CompassAssessment;
    }[];
    const blueprints = blueprintsRes.data ?? [];
    const feedback = ((feedbackRes.data ?? []) as FeedbackRow[]).map(
      feedbackFromRow
    );
    const checkins = checkinsRes.data ?? [];
    const analysis = analyseFeedback(feedback);

    const archetypes: string[] = [];
    const growthAreas: string[] = [];
    const userGoals: string[] = [];

    for (const row of assessments) {
      const data = row.data;
      if (data?.results?.archetype) archetypes.push(data.results.archetype);
      if (data?.results?.topGrowthAreas) {
        growthAreas.push(...data.results.topGrowthAreas);
      }
      const goal = data?.answers?.find(
        (a) => a.questionId === 19
      )?.selectedAnswer;
      if (goal) userGoals.push(goal);
    }

    const wtp = { yes: 0, maybe: 0, no: 0 };
    for (const fb of feedback) {
      if (fb.willingnessToPay === "yes") wtp.yes++;
      else if (fb.willingnessToPay === "maybe") wtp.maybe++;
      else if (fb.willingnessToPay === "no") wtp.no++;
    }

    const recalculated = blueprints.filter(
      (b) =>
        (b as { parent_blueprint_id?: string }).parent_blueprint_id ||
        ((b as { recalculation_count?: number }).recalculation_count ?? 0) > 0
    ).length;

    return {
      totalAssessments: assessmentsRes.count ?? assessments.length,
      totalBlueprints: blueprints.length,
      totalRecalculatedBlueprints: recalculated || feedback.filter((f) => f.isRecalculation).length,
      averageBlueprintRating: averageOverallRating(feedback),
      lowestRatedSections: analysis.lowestRatedSections,
      topFeedbackThemes: analysis.topThemes,
      mostRequestedFocusAreas: countByField(growthAreas)
        .slice(0, 5)
        .map((x) => x.label),
      willingnessToPaySignals: wtp,
      topArchetypes: countByField(archetypes)
        .slice(0, 5)
        .map(({ label, count }) => ({ archetype: label, count })),
      topGrowthAreas: countByField(growthAreas)
        .slice(0, 5)
        .map(({ label, count }) => ({ area: label, count })),
      topUserGoals: countByField(userGoals)
        .slice(0, 5)
        .map(({ label, count }) => ({ goal: label, count })),
      checkInSummaries: summarizeCheckins(
        checkins as {
          blockers?: string;
          support_needed?: string;
          next_priority?: string;
        }[]
      ),
      source: "database",
    };
  } catch (error) {
    console.error("fetchFounderMetricsFromDatabase error:", error);
    return null;
  }
}

function summarizeCheckins(
  checkins: {
    blockers?: string;
    support_needed?: string;
    next_priority?: string;
  }[]
): string[] {
  if (checkins.length === 0) return ["No weekly check-ins recorded yet"];

  const themes = new Set<string>();
  for (const c of checkins) {
    const b = c.blockers ?? "";
    if (/time|busy|schedule/i.test(b))
      themes.add("Time constraints are a top blocker");
    if (/energy|tired|burnout/i.test(b))
      themes.add("Low energy frequently blocks progress");
    if (/confiden|fear|doubt/i.test(b))
      themes.add("Confidence gaps slow action");
  }

  if (themes.size === 0) {
    themes.add(`${checkins.length} check-ins submitted — review for patterns`);
  }

  return Array.from(themes).slice(0, 5);
}

function anonymiseReflection(text: string): string {
  return text
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "[user]")
    .replace(/\S+@\S+\.\S+/g, "[email]")
    .slice(0, 200);
}

export async function getFounderProductContext(): Promise<FounderProductContext> {
  const fromDb = await fetchFounderMetricsFromDatabase();
  const metrics = fromDb ?? buildMockFounderMetrics();

  const supabase = createServiceSupabaseClient();
  let feedback: BlueprintFeedback[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("blueprint_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) feedback = (data as FeedbackRow[]).map(feedbackFromRow);
  }

  const feedbackAnalysis = analyseFeedback(
    feedback.length > 0
      ? feedback
      : [
          {
            id: "mock-1",
            blueprintId: "mock",
            overallRating: 3,
            sectionRatings: { fiveYearRoadmap: 2, dailyHabits: 4 },
            reflection: "Generic 5-year plan",
            missingContext: "No industry context",
            createdAt: new Date().toISOString(),
          },
        ]
  );

  const recentReflections = feedback
    .map((f) => f.reflection)
    .filter(Boolean)
    .slice(0, 5)
    .map((r) => anonymiseReflection(r!));

  return {
    metrics,
    feedbackAnalysis,
    recentReflections:
      recentReflections.length > 0
        ? recentReflections
        : [
            "Loved the archetype but the 5-year plan felt too generic",
            "7-day starter plan was immediately actionable",
          ],
  };
}

export function formatContextForAgent(context: FounderProductContext): string {
  const { metrics, feedbackAnalysis, recentReflections } = context;

  return `
PRODUCT METRICS (anonymised aggregate):
- Assessments completed: ${metrics.totalAssessments}
- Blueprints generated: ${metrics.totalBlueprints}
- Recalculated blueprints: ${metrics.totalRecalculatedBlueprints}
- Average blueprint rating: ${metrics.averageBlueprintRating ?? "N/A"} / 5
- Data source: ${metrics.source}

TOP ARCHETYPES:
${metrics.topArchetypes.map((a) => `- ${a.archetype}: ${a.count}`).join("\n") || "None yet"}

TOP GROWTH AREAS:
${metrics.topGrowthAreas.map((g) => `- ${g.area}: ${g.count}`).join("\n") || "None yet"}

TOP USER GOALS (Q19):
${metrics.topUserGoals.map((g) => `- ${g.goal}: ${g.count}`).join("\n") || "None yet"}

WILLINGNESS TO PAY:
- Yes: ${metrics.willingnessToPaySignals.yes} | Maybe: ${metrics.willingnessToPaySignals.maybe} | No: ${metrics.willingnessToPaySignals.no}

LOWEST-RATED SECTIONS:
${metrics.lowestRatedSections.map((s) => `- ${s.section}: ${s.averageRating}/5`).join("\n") || "None yet"}

FEEDBACK THEMES: ${metrics.topFeedbackThemes.join(", ")}

MOST REQUESTED FOCUS AREAS:
${metrics.mostRequestedFocusAreas.map((f) => `- ${f}`).join("\n")}

CHECK-IN SUMMARIES:
${metrics.checkInSummaries.map((s) => `- ${s}`).join("\n")}

FEEDBACK ANALYSIS:
- Product fixes: ${feedbackAnalysis.recommendedProductFixes.join("; ")}
- Prompt improvements: ${feedbackAnalysis.recommendedPromptImprovements.join("; ")}
- Missing context: ${feedbackAnalysis.commonMissingContext.join("; ") || "None"}
- Unrealistic parts: ${feedbackAnalysis.commonUnrealisticRecommendations.join("; ") || "None"}

RECENT REFLECTIONS (anonymised):
${recentReflections.map((r) => `- "${r}"`).join("\n")}
`.trim();
}

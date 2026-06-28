import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin";
import { generateFeedbackAnalysisReport } from "@/lib/agents/feedbackAnalystAgent";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { BlueprintFeedback } from "@/types";

export async function GET(request: Request) {
  const email = request.headers.get("x-founder-email");
  if (!verifyAdminAccess(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceSupabaseClient();
  let feedback: BlueprintFeedback[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("blueprint_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) {
      feedback = data.map((row) => ({
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
      }));
    }
  }

  const analysis = await generateFeedbackAnalysisReport(feedback);
  return NextResponse.json({ analysis, feedbackCount: feedback.length });
}

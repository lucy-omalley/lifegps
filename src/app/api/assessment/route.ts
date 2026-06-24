import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import type { AssessmentRow } from "@/lib/supabase/mappers";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!supabase || !user) {
    return NextResponse.json({ assessment: null, source: "none" });
  }

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_complete", true)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Load assessment error:", error);
    return NextResponse.json(
      { error: "Failed to load assessment" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ assessment: null, source: "database" });
  }

  const row = data as AssessmentRow;
  return NextResponse.json({
    assessment: row.data,
    assessmentId: row.id,
    completedAt: row.completed_at,
    source: "database",
  });
}

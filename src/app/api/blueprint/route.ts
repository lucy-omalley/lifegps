import { NextResponse } from "next/server";
import {
  generateBlueprint,
  generateMockBlueprint,
} from "@/lib/agents/lifegpsCoachAgent";
import { blueprintFromRow, blueprintToRow } from "@/lib/supabase/mappers";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { hasRequiredAnswers } from "@/lib/compass/scoring";
import type { CompassAssessment, LifeBlueprint } from "@/types";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!supabase || !user) {
    return NextResponse.json({ blueprint: null, source: "none" });
  }

  const { data, error } = await supabase
    .from("life_blueprints")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Load blueprint error:", error);
    return NextResponse.json(
      { error: "Failed to load blueprint" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ blueprint: null, source: "database" });
  }

  return NextResponse.json({
    blueprint: blueprintFromRow(data),
    source: "database",
  });
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const body = await request.json();
    const { assessment, userId: bodyUserId } = body as {
      assessment: CompassAssessment;
      userId?: string;
    };

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment data is required" },
        { status: 400 }
      );
    }

    if (!assessment.results || !hasRequiredAnswers(assessment.answers)) {
      return NextResponse.json(
        { error: "Complete Compass assessment with results is required" },
        { status: 400 }
      );
    }

    const userId = user?.id ?? bodyUserId ?? crypto.randomUUID();

    const blueprintData = await generateBlueprint(assessment);

    const assessmentId = crypto.randomUUID();
    const blueprint: LifeBlueprint = {
      id: crypto.randomUUID(),
      userId,
      assessmentId,
      createdAt: new Date().toISOString(),
      archetype: assessment.results.archetype,
      ...blueprintData,
    };

    let persisted = false;

    if (supabase && user) {
      const { error: assessmentError } = await supabase
        .from("assessments")
        .insert({
          id: assessmentId,
          user_id: user.id,
          data: assessment,
          is_complete: true,
          completed_at: assessment.completedAt ?? new Date().toISOString(),
        });

      if (assessmentError) {
        console.error("Assessment insert error:", assessmentError);
      } else {
        const row = blueprintToRow(blueprint, assessmentId);
        const { error: blueprintError } = await supabase
          .from("life_blueprints")
          .insert(row);

        if (blueprintError) {
          console.error("Blueprint insert error:", blueprintError);
        } else {
          persisted = true;
          await supabase
            .from("compass_sessions")
            .delete()
            .eq("user_id", user.id);
        }
      }
    }

    return NextResponse.json({
      blueprint,
      persisted,
    });
  } catch (error) {
    console.error("Blueprint generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate life blueprint" },
      { status: 500 }
    );
  }
}

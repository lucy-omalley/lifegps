import { NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/agents/lifegpsCoachAgent";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const body = await request.json();
    const { progress, blockers, supportNeeded, nextPriority } = body as {
      progress: string;
      blockers: string;
      supportNeeded: string;
      nextPriority: string;
      userId?: string;
    };

    const userId = user?.id ?? body.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const checkin = { progress, blockers, supportNeeded, nextPriority };
    const aiResponse = await generateCoachResponse(checkin);

    const checkinId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    if (supabase && user) {
      const { error } = await supabase.from("weekly_checkins").insert({
        id: checkinId,
        user_id: user.id,
        progress,
        blockers,
        support_needed: supportNeeded,
        next_priority: nextPriority,
        ai_response: aiResponse,
      });

      if (error) console.error("Checkin insert error:", error);
    }

    return NextResponse.json({
      id: checkinId,
      aiResponse,
      createdAt,
      persisted: Boolean(supabase && user),
    });
  } catch (error) {
    console.error("Coach error:", error);
    return NextResponse.json(
      { error: "Failed to generate coaching response" },
      { status: 500 }
    );
  }
}

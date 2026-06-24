import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai/client";
import {
  LIFEGPS_SYSTEM_PROMPT,
  COACH_USER_PROMPT,
} from "@/lib/openai/prompts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function generateMockCoachResponse(checkin: {
  progress: string;
  blockers: string;
  supportNeeded: string;
  nextPriority: string;
}): string {
  return `**Great work showing up this week!**

I hear you made progress on: ${checkin.progress || "staying committed to your goals"}. Every step counts, even the small ones.

**On your blockers:** ${checkin.blockers || "General resistance"} is common when changing your life direction. Try breaking your next task into a 15-minute micro-action. Momentum beats perfection.

**Support you need:** ${checkin.supportNeeded || "More clarity"}. Consider finding an accountability partner or joining a community of people on similar journeys. You don't have to do this alone.

**Your focus for next week:** ${checkin.nextPriority || "Take one concrete step toward your blueprint"}. Block time on your calendar now — treat it like an important meeting with your future self.

Remember: you're building a life, not sprinting a race. Stay consistent, stay kind to yourself, and keep navigating forward. 🧭`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { progress, blockers, supportNeeded, nextPriority, userId } =
      body as {
        progress: string;
        blockers: string;
        supportNeeded: string;
        nextPriority: string;
        userId: string;
      };

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const checkin = { progress, blockers, supportNeeded, nextPriority };
    let aiResponse: string;

    if (process.env.OPENAI_API_KEY) {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: LIFEGPS_SYSTEM_PROMPT },
          { role: "user", content: COACH_USER_PROMPT(checkin) },
        ],
        temperature: 0.8,
      });
      aiResponse =
        completion.choices[0]?.message?.content ||
        generateMockCoachResponse(checkin);
    } else {
      aiResponse = generateMockCoachResponse(checkin);
    }

    const checkinId = crypto.randomUUID();

    // TODO: Persist to Supabase when configured
    const supabase = createServerSupabaseClient();
    if (supabase) {
      await supabase.from("weekly_checkins").insert({
        id: checkinId,
        user_id: userId,
        progress,
        blockers,
        support_needed: supportNeeded,
        next_priority: nextPriority,
        ai_response: aiResponse,
      });
    }

    return NextResponse.json({
      id: checkinId,
      aiResponse,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Coach error:", error);
    return NextResponse.json(
      { error: "Failed to generate coaching response" },
      { status: 500 }
    );
  }
}

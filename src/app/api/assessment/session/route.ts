import { NextResponse } from "next/server";
import type { CompassAnswer } from "@/types";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import type { CompassSessionRow } from "@/lib/supabase/mappers";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!supabase || !user) {
    return NextResponse.json({ session: null, source: "none" });
  }

  const { data, error } = await supabase
    .from("compass_sessions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Load compass session error:", error);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ session: null, source: "database" });
  }

  const row = data as CompassSessionRow;
  return NextResponse.json({
    session: {
      answers: row.answers,
      currentQuestion: row.current_question,
      phase: row.phase,
      updatedAt: row.updated_at,
    },
    source: "database",
  });
}

export async function PUT(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!supabase || !user) {
    return NextResponse.json(
      { error: "Database not configured or user not authenticated" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { answers, currentQuestion, phase } = body as {
    answers: CompassAnswer[];
    currentQuestion: number;
    phase: string;
  };

  const { error } = await supabase.from("compass_sessions").upsert(
    {
      user_id: user.id,
      answers,
      current_question: currentQuestion,
      phase,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Save compass session error:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!supabase || !user) {
    return NextResponse.json({ ok: true });
  }

  await supabase.from("compass_sessions").delete().eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}

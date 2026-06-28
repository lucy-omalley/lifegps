import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin";
import { generateWeeklyFounderPlan } from "@/lib/agents/founderAgent";

export async function POST(request: Request) {
  const email = request.headers.get("x-founder-email");
  if (!verifyAdminAccess(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const plan = await generateWeeklyFounderPlan();
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Weekly plan error:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly founder plan" },
      { status: 500 }
    );
  }
}

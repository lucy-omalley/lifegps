import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import type { DiscoveryModuleId } from "@/types/discovery";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase || !user) {
    return NextResponse.json({
      progress: {
        completedModules: [] as DiscoveryModuleId[],
        freeModuleUsed: false,
        isPremium: false,
      },
    });
  }

  const { data, error } = await supabase
    .from("discovery_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }

  if (!data) {
    const { data: assessment } = await supabase
      .from("assessments")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    const completed: DiscoveryModuleId[] = assessment ? ["quiz"] : [];

    return NextResponse.json({
      progress: {
        completedModules: completed,
        freeModuleUsed: completed.length > 0,
        isPremium: false,
      },
    });
  }

  return NextResponse.json({
    progress: {
      completedModules: (data.completed_modules as DiscoveryModuleId[]) ?? [],
      freeModuleUsed: data.free_module_used ?? false,
      isPremium: data.is_premium ?? false,
    },
  });
}

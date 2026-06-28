import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin";
import {
  getFounderProductContext,
} from "@/lib/founder/metrics";

function getAdminEmailFromRequest(request: Request): string | null {
  return request.headers.get("x-founder-email");
}

export async function GET(request: Request) {
  const email = getAdminEmailFromRequest(request);
  if (!verifyAdminAccess(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const context = await getFounderProductContext();
  return NextResponse.json(context);
}

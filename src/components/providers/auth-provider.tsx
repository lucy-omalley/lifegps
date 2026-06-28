"use client";

import { useEffect } from "react";
import { ensureAuthenticatedUser } from "@/lib/auth";

/** Runs anonymous Supabase sign-in after mount — does not block render (avoids hydration mismatch). */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void ensureAuthenticatedUser();
  }, []);

  return <>{children}</>;
}

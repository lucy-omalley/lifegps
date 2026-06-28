"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ensureAuthenticatedUser,
  getAuthMode,
  isPublicAuthPath,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type AuthState = "checking" | "ready";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (!isSupabaseConfigured() || getAuthMode() === "local") {
        if (!cancelled) setState("ready");
        return;
      }

      if (isPublicAuthPath(pathname)) {
        if (!cancelled) setState("ready");
        return;
      }

      const result = await ensureAuthenticatedUser();

      if (cancelled) return;

      if (result.status === "authenticated" || result.status === "local_fallback") {
        setState("ready");
        return;
      }

      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }

    setState("checking");
    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (state === "checking" && !isPublicAuthPath(pathname)) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ensureAuthenticatedUser, isPublicAuthPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type AuthState = "checking" | "allowed" | "needs_login";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (isPublicAuthPath(pathname)) {
        if (!cancelled) setAuthState("allowed");
        return;
      }

      if (!isSupabaseConfigured()) {
        if (!cancelled) setAuthState("allowed");
        return;
      }

      const result = await ensureAuthenticatedUser();
      if (cancelled) return;

      if (result.status === "authenticated") {
        setAuthState("allowed");
        return;
      }

      setAuthState("needs_login");
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }

    setAuthState("checking");
    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const isProtectedRoute = !isPublicAuthPath(pathname) && isSupabaseConfigured();

  if (isProtectedRoute && (authState === "checking" || authState === "needs_login")) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {authState === "needs_login" ? "Redirecting to sign in..." : "Loading..."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

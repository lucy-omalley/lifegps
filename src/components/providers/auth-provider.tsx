"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ensureAuthenticatedUser,
  isPublicAuthPath,
  setGuestSession,
} from "@/lib/auth";
import { GUEST_COOKIE_NAME } from "@/lib/auth/paths";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type AuthState = "checking" | "allowed" | "needs_login";

function hasGuestSession(): boolean {
  if (typeof document !== "undefined") {
    if (document.cookie.includes(`${GUEST_COOKIE_NAME}=1`)) return true;
  }
  if (typeof window !== "undefined") {
    if (sessionStorage.getItem(GUEST_COOKIE_NAME) === "1") return true;
  }
  return false;
}

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
        if (hasGuestSession()) {
          if (!cancelled) setAuthState("allowed");
          return;
        }
        if (!cancelled) {
          setAuthState("needs_login");
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
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

  const requiresAuth =
    !isPublicAuthPath(pathname) &&
    (isSupabaseConfigured() || !hasGuestSession());

  if (requiresAuth && (authState === "checking" || authState === "needs_login")) {
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

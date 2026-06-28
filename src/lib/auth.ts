import type { MockUser } from "@/types";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

const MOCK_USER_KEY = "lifegps_mock_user";
const AUTH_MODE_KEY = "lifegps_auth_mode";

function getFallbackMockUser(): MockUser {
  if (typeof window === "undefined") {
    return { id: "mock-user-1", email: "demo@lifegps.app", name: "Demo User" };
  }

  const stored = localStorage.getItem(MOCK_USER_KEY);
  if (stored) {
    return JSON.parse(stored) as MockUser;
  }

  const user: MockUser = {
    id: `user-${crypto.randomUUID().slice(0, 8)}`,
    email: "demo@lifegps.app",
    name: "Demo User",
  };
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  return user;
}

function setLocalAuthMode() {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_MODE_KEY, "local");
  }
}

function setSupabaseAuthMode() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_MODE_KEY);
  }
}

/** Whether the client should sync data to Supabase (requires a live auth session). */
export function getAuthMode(): "supabase" | "local" {
  if (!isSupabaseConfigured()) return "local";
  if (typeof window === "undefined") return "supabase";
  return localStorage.getItem(AUTH_MODE_KEY) === "local" ? "local" : "supabase";
}

export function enableLocalStorageOnly() {
  setLocalAuthMode();
}

export function isDatabaseEnabled(): boolean {
  return isSupabaseConfigured() && getAuthMode() === "supabase";
}

export function mapSupabaseUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): MockUser {
  return {
    id: user.id,
    email: user.email ?? "anonymous@lifegps.app",
    name: (user.user_metadata?.name as string | undefined) ?? "LifeGPS User",
  };
}

/** Returns the current Supabase session user without signing in. */
export async function getExistingAuthUser(): Promise<MockUser | null> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase || getAuthMode() === "local") return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    setSupabaseAuthMode();
    return mapSupabaseUser(user);
  }

  return null;
}

export type EnsureAuthResult =
  | { status: "authenticated"; user: MockUser }
  | { status: "unauthenticated" }
  | { status: "local_fallback"; user: MockUser };

/** Check auth state. Does not sign in automatically. */
export async function ensureAuthenticatedUser(): Promise<EnsureAuthResult> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase || getAuthMode() === "local") {
    return { status: "local_fallback", user: getFallbackMockUser() };
  }

  const user = await getExistingAuthUser();
  if (user) {
    return { status: "authenticated", user };
  }

  return { status: "unauthenticated" };
}

/** Convenience wrapper — returns a user when authenticated or in local mode. */
export async function ensureAuthenticatedUserLegacy(): Promise<MockUser> {
  const result = await ensureAuthenticatedUser();
  if (result.status === "unauthenticated") {
    throw new Error("Not authenticated");
  }
  return result.user;
}

export async function sendMagicLink(
  email: string,
  options?: { captchaToken?: string; next?: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  if (typeof window === "undefined") {
    return { ok: false, error: "Magic link must be sent from the browser" };
  }

  const next = options?.next ?? "/journey";
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: callbackUrl.toString(),
      ...(options?.captchaToken
        ? { captchaToken: options.captchaToken }
        : {}),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/** @deprecated Use ensureAuthenticatedUser */
export function getMockUser(): MockUser {
  return getFallbackMockUser();
}

export function updateMockUserName(name: string) {
  const user = getFallbackMockUser();
  user.name = name;
  if (typeof window !== "undefined") {
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  }
  return user;
}

export async function signOutUser() {
  const supabase = createBrowserSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(MOCK_USER_KEY);
    localStorage.removeItem(AUTH_MODE_KEY);
  }
}

export const PUBLIC_AUTH_PATHS = ["/", "/login", "/auth/callback"];

export function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith("/auth/callback")
  );
}

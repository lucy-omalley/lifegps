import type { MockUser } from "@/types";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { isCaptchaError } from "@/lib/auth/captcha";

const MOCK_USER_KEY = "lifegps_mock_user";
const AUTH_MODE_KEY = "lifegps_auth_mode";

let anonymousFailureLogged = false;

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

function logAnonymousAuthUnavailable(errorMessage?: string) {
  if (anonymousFailureLogged) return;
  anonymousFailureLogged = true;

  if (isCaptchaError(errorMessage)) {
    console.info(
      "LifeGPS: Supabase CAPTCHA is required for sign-in. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY to .env.local and configure the Turnstile secret in Supabase → Authentication → Bot and Abuse Protection. Or disable CAPTCHA there for development."
    );
    return;
  }

  console.info(
    "LifeGPS: Supabase anonymous sign-in is unavailable. Using local storage for this browser. Enable Anonymous Sign-Ins in Supabase → Authentication → Providers, or configure CAPTCHA if enabled."
  );
}

function mapSupabaseUser(user: {
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

  return user ? mapSupabaseUser(user) : null;
}

export type EnsureAuthResult =
  | { status: "authenticated"; user: MockUser }
  | { status: "captcha_required" }
  | { status: "local_fallback"; user: MockUser };

/**
 * Ensure a Supabase session exists (anonymous sign-in).
 * When Supabase CAPTCHA is enabled, pass captchaToken from Cloudflare Turnstile.
 */
export async function ensureAuthenticatedUser(options?: {
  captchaToken?: string;
}): Promise<EnsureAuthResult> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase || getAuthMode() === "local") {
    return { status: "local_fallback", user: getFallbackMockUser() };
  }

  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  if (existingUser) {
    setSupabaseAuthMode();
    return {
      status: "authenticated",
      user: mapSupabaseUser(existingUser),
    };
  }

  const { data, error } = await supabase.auth.signInAnonymously(
    options?.captchaToken
      ? { options: { captchaToken: options.captchaToken } }
      : undefined
  );

  if (error || !data.user) {
    if (isCaptchaError(error?.message) && !options?.captchaToken) {
      logAnonymousAuthUnavailable(error?.message);
      return { status: "captcha_required" };
    }

    logAnonymousAuthUnavailable(error?.message);
    setLocalAuthMode();
    return { status: "local_fallback", user: getFallbackMockUser() };
  }

  setSupabaseAuthMode();
  return {
    status: "authenticated",
    user: mapSupabaseUser(data.user),
  };
}

/** Convenience wrapper — returns a user in all cases (legacy callers). */
export async function ensureAuthenticatedUserLegacy(
  captchaToken?: string
): Promise<MockUser> {
  const result = await ensureAuthenticatedUser(
    captchaToken ? { captchaToken } : undefined
  );
  if (result.status === "captcha_required") {
    return getFallbackMockUser();
  }
  return result.user;
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
    anonymousFailureLogged = false;
  }
}

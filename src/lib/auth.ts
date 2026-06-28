import type { MockUser } from "@/types";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

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

export function isDatabaseEnabled(): boolean {
  return isSupabaseConfigured() && getAuthMode() === "supabase";
}

function logAnonymousAuthUnavailable() {
  if (anonymousFailureLogged) return;
  anonymousFailureLogged = true;
  console.info(
    "LifeGPS: Supabase anonymous sign-in is unavailable. Using local storage for this browser. To enable cloud sync, turn on Anonymous Sign-Ins in Supabase → Authentication → Providers."
  );
}

/** Ensure a Supabase session exists (anonymous sign-in). Falls back to mock user. */
export async function ensureAuthenticatedUser(): Promise<MockUser> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase || getAuthMode() === "local") {
    return getFallbackMockUser();
  }

  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  if (existingUser) {
    setSupabaseAuthMode();
    return {
      id: existingUser.id,
      email: existingUser.email ?? "anonymous@lifegps.app",
      name:
        (existingUser.user_metadata?.name as string | undefined) ??
        "LifeGPS User",
    };
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    logAnonymousAuthUnavailable();
    setLocalAuthMode();
    return getFallbackMockUser();
  }

  setSupabaseAuthMode();
  return {
    id: data.user.id,
    email: data.user.email ?? "anonymous@lifegps.app",
    name: "LifeGPS User",
  };
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

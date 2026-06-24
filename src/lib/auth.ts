import type { MockUser } from "@/types";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

const MOCK_USER_KEY = "lifegps_mock_user";

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

export function isDatabaseEnabled(): boolean {
  return isSupabaseConfigured();
}

/** Ensure a Supabase session exists (anonymous sign-in). Falls back to mock user. */
export async function ensureAuthenticatedUser(): Promise<MockUser> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    return getFallbackMockUser();
  }

  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  if (existingUser) {
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
    console.warn("Supabase anonymous sign-in failed:", error?.message);
    return getFallbackMockUser();
  }

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
  }
}

import type { MockUser } from "@/types";

const MOCK_USER_KEY = "lifegps_mock_user";

// TODO: Replace with Supabase Auth (signInWithOAuth, signInWithPassword, etc.)
export function getMockUser(): MockUser {
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

export function updateMockUserName(name: string) {
  const user = getMockUser();
  user.name = name;
  if (typeof window !== "undefined") {
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  }
  return user;
}

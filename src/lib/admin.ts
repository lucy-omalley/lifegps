/**
 * Admin access for Founder Agent routes.
 * TODO: Replace with role-based access control (Supabase Auth + admin role) before production.
 */

export function getAdminEmail(): string | undefined {
  return process.env.ADMIN_EMAIL?.trim() || undefined;
}

export function verifyAdminAccess(email?: string | null): boolean {
  const adminEmail = getAdminEmail();

  if (!adminEmail) {
    // Allow local testing when ADMIN_EMAIL is not configured
    return process.env.NODE_ENV === "development";
  }

  if (!email?.trim()) return false;
  return email.trim().toLowerCase() === adminEmail.toLowerCase();
}

export function getAdminAccessHeaders(email: string): HeadersInit {
  return { "x-founder-email": email.trim() };
}

/** Routes that do not require sign-in. */
export const PUBLIC_AUTH_PATHS = ["/", "/login", "/auth/callback"];

export const GUEST_COOKIE_NAME = "lifegps_guest";

export function isPublicAuthPath(pathname: string): boolean {
  return (
    PUBLIC_AUTH_PATHS.some(
      (path) => pathname === path || pathname.startsWith("/auth/callback")
    ) || pathname.startsWith("/api/")
  );
}

export function isProtectedAuthPath(pathname: string): boolean {
  return !isPublicAuthPath(pathname);
}

"use client";

import { useEffect, useState } from "react";
import { ensureAuthenticatedUser } from "@/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureAuthenticatedUser().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}

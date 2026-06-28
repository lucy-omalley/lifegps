"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getExistingAuthUser, signOutUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import type { MockUser } from "@/types";

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    void getExistingAuthUser().then((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  if (loading || !isSupabaseConfigured()) {
    return (
      <ButtonLink href="/login" size="sm" variant="ghost" className="hidden sm:inline-flex">
        Sign in
      </ButtonLink>
    );
  }

  if (!user) {
    return (
      <ButtonLink
        href="/login"
        size="sm"
        className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md hover:from-teal-600 hover:to-indigo-700"
      >
        Sign in
      </ButtonLink>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:inline">
        {user.email}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void handleSignOut()}
        className="hidden sm:inline-flex"
      >
        <LogOut className="mr-1 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}

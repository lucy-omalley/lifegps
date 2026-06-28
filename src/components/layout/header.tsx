import Link from "next/link";
import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { UserMenu } from "@/components/layout/user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 shadow-lg shadow-teal-500/20">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">LifeGPS</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Discover Yourself
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/journey"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Journey
          </Link>
          <Link
            href="/profile"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Profile
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink
            href="/coach"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Coach
          </ButtonLink>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

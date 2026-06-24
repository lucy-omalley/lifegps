import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium">LifeGPS</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Navigate your future with AI.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/assessment" className="hover:text-foreground">
              Assessment
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/coach" className="hover:text-foreground">
              Weekly Coach
            </Link>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-foreground">RemoteGeek Hub</span>.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BlueprintDisplay } from "@/components/blueprint/blueprint-display";
import { getBlueprint } from "@/lib/storage";
import type { LifeBlueprint } from "@/types";
import { ButtonLink } from "@/components/ui/button-link";

export default function BlueprintPage() {
  const [blueprint, setBlueprint] = useState<LifeBlueprint | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setBlueprint(getBlueprint());
    setLoaded(true);
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {!loaded ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="text-muted-foreground">Loading your blueprint...</p>
            </div>
          ) : blueprint ? (
            <BlueprintDisplay blueprint={blueprint} />
          ) : (
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20">
                <Compass className="h-8 w-8 text-teal-600" />
              </div>
              <h1 className="text-2xl font-bold">No Blueprint Found</h1>
              <p className="mt-2 text-muted-foreground">
                Complete the assessment to generate your personalized Life
                Blueprint.
              </p>
              <ButtonLink
                href="/assessment"
                className="mt-6 bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
              >
                Start Assessment
              </ButtonLink>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

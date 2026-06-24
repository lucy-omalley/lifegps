"use client";

import { Loader2, Sparkles } from "lucide-react";
import { ARCHETYPES } from "@/lib/compass/archetypes";
import type { AssessmentPhase, CompassResults } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LOADING_MESSAGES: Record<
  Exclude<AssessmentPhase, "intro" | "questions" | "archetype-reveal">,
  string
> = {
  analysing: "Analysing your Compass responses...",
  "creating-archetype": "Creating your LifeGPS Archetype...",
  "building-blueprint": "Building your personalised Life Blueprint...",
};

interface CompassRevealProps {
  phase: AssessmentPhase;
  results: CompassResults | null;
  error: string | null;
  onViewBlueprint: () => void;
}

export function CompassReveal({
  phase,
  results,
  error,
  onViewBlueprint,
}: CompassRevealProps) {
  const isLoading = [
    "analysing",
    "creating-archetype",
    "building-blueprint",
  ].includes(phase);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-indigo-500/20">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        </div>
        <p className="text-center text-lg font-medium">
          {LOADING_MESSAGES[phase as keyof typeof LOADING_MESSAGES]}
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          This usually takes a few seconds
        </p>
      </div>
    );
  }

  if (phase === "archetype-reveal" && results) {
    const archetype = ARCHETYPES[results.archetype];

    return (
      <div className="mx-auto max-w-xl animate-in fade-in zoom-in-95 duration-700">
        <Card className="overflow-hidden border-teal-500/30 shadow-xl">
          <div className="bg-gradient-to-br from-teal-500/15 via-indigo-500/10 to-transparent px-6 py-10 text-center sm:px-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-sm text-teal-700 dark:text-teal-300">
              <Sparkles className="h-4 w-4" />
              Your LifeGPS Archetype
            </div>
            <CardHeader className="space-y-4 p-0">
              <CardTitle className="text-2xl font-bold sm:text-3xl">
                {archetype.title}
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {archetype.description}
              </CardDescription>
            </CardHeader>
          </div>

          <CardContent className="space-y-6 px-6 py-8 sm:px-10">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Top Strengths
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {results.topStrengths.map((s) => (
                    <li key={s} className="font-medium text-teal-700 dark:text-teal-300">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Growth Areas
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {results.topGrowthAreas.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-muted px-3 py-1">
                Burnout risk: {results.burnoutRisk}
              </span>
              <span className="rounded-full bg-muted px-3 py-1">
                Side business: {results.sideBusinessReadiness.split(" —")[0]}
              </span>
            </div>

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <Button
              onClick={onViewBlueprint}
              size="lg"
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700"
            >
              View My Life Blueprint
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { ARCHETYPES } from "@/lib/compass/archetypes";
import {
  DIMENSION_LABELS,
  DIMENSION_ORDER,
} from "@/lib/compass/dimensions";
import type {
  AssessmentPhase,
  CompassResults,
  DimensionScores,
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LOADING_MESSAGES: Record<
  Exclude<AssessmentPhase, "intro" | "questions" | "archetype-reveal">,
  string
> = {
  analysing: "Understanding your answers...",
  "creating-archetype": "Creating your LifeGPS Archetype...",
  "building-blueprint": "Building your personalised Life Blueprint...",
};

interface CompassRevealProps {
  phase: AssessmentPhase;
  results: CompassResults | null;
  error: string | null;
  onViewBlueprint: () => void;
}

function AnimatedScoreBar({
  label,
  score,
  delayMs,
}: {
  label: string;
  score: number;
  delayMs: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), delayMs);
    return () => clearTimeout(timer);
  }, [score, delayMs]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{score}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-1000 ease-out"
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function CompassScores({ scores }: { scores: DimensionScores }) {
  return (
    <div className="space-y-4">
      {DIMENSION_ORDER.map((dim, i) => (
        <AnimatedScoreBar
          key={dim}
          label={DIMENSION_LABELS[dim]}
          score={scores[dim]}
          delayMs={200 + i * 120}
        />
      ))}
    </div>
  );
}

function ReadinessBadge({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant?: "warning" | "success" | "neutral";
}) {
  const short = value.split(" —")[0];
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        variant === "warning" && "border-amber-500/30 bg-amber-500/5",
        variant === "success" && "border-teal-500/30 bg-teal-500/5",
        variant === "neutral" && "border-border/50 bg-muted/30"
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{short}</p>
      <p className="mt-1 text-xs text-muted-foreground">{value}</p>
    </div>
  );
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
      <div className="mx-auto flex max-w-md flex-col items-center justify-center py-24 animate-in fade-in duration-500">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-indigo-500/20">
          <Loader2 className="h-11 w-11 animate-spin text-teal-600" />
        </div>
        <p className="text-center text-lg font-medium">
          {LOADING_MESSAGES[phase as keyof typeof LOADING_MESSAGES]}
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          LifeGPS is building your starting profile
        </p>
      </div>
    );
  }

  if (phase === "archetype-reveal" && results) {
    const archetype = ARCHETYPES[results.archetype];
    const burnoutVariant =
      results.burnoutRisk === "High"
        ? "warning"
        : results.burnoutRisk === "Low"
          ? "success"
          : "neutral";

    return (
      <div className="mx-auto max-w-2xl space-y-6 px-2 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-sm text-teal-700 dark:text-teal-300">
            <Sparkles className="h-4 w-4" />
            Assessment complete
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Here&apos;s what LifeGPS sees in you
          </h1>
          <p className="mt-2 text-muted-foreground">
            A starting hypothesis — your coach will keep learning from here.
          </p>
        </div>

        <Card className="overflow-hidden border-teal-500/30 shadow-xl">
          <div className="bg-gradient-to-br from-teal-500/15 via-indigo-500/10 to-transparent px-6 py-8 text-center sm:px-10">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-teal-700/80 dark:text-teal-300/80">
              Your LifeGPS Archetype
            </p>
            <CardHeader className="space-y-3 p-0">
              <CardTitle className="text-2xl font-bold sm:text-3xl">
                {archetype.title}
              </CardTitle>
              <CardDescription className="mx-auto max-w-lg text-base leading-relaxed">
                {archetype.description}
              </CardDescription>
            </CardHeader>
          </div>

          <CardContent className="space-y-8 px-6 py-8 sm:px-10">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                <h3 className="font-semibold">Compass Scores</h3>
              </div>
              <CompassScores scores={results.dimensionScores} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Top Strengths
                </p>
                <ul className="mt-3 space-y-2">
                  {results.topStrengths.map((s) => (
                    <li
                      key={s}
                      className="font-medium text-teal-700 dark:text-teal-300"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Growth Opportunities
                </p>
                <ul className="mt-3 space-y-2">
                  {results.topGrowthAreas.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ReadinessBadge
                label="Burnout Risk"
                value={`${results.burnoutRisk} — ${burnoutLabel(results.burnoutRisk)}`}
                variant={burnoutVariant}
              />
              <ReadinessBadge
                label="Side Business Readiness"
                value={results.sideBusinessReadiness}
                variant={
                  results.sideBusinessReadiness.includes("High")
                    ? "success"
                    : "neutral"
                }
              />
              <ReadinessBadge
                label="Financial Freedom Readiness"
                value={results.financialFreedomReadiness}
                variant={
                  results.financialFreedomReadiness.includes("Strong")
                    ? "success"
                    : "neutral"
                }
              />
              <ReadinessBadge
                label="Execution Style"
                value={results.executionStyle}
                variant="neutral"
              />
            </div>

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <Button
              onClick={onViewBlueprint}
              size="lg"
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 text-base text-white hover:from-teal-600 hover:to-indigo-700"
            >
              View My Personalised AI Blueprint
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

function burnoutLabel(risk: string): string {
  if (risk === "High") return "prioritise recovery and boundaries";
  if (risk === "Medium") return "watch energy levels closely";
  return "energy looks manageable";
}

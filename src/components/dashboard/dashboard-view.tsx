"use client";

import { useEffect, useState } from "react";
import {
  Compass,
  Target,
  ListChecks,
  Sunrise,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { getBlueprint } from "@/lib/storage";
import type { LifeBlueprint } from "@/types";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DashboardView() {
  const [blueprint, setBlueprint] = useState<LifeBlueprint | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setBlueprint(getBlueprint());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20">
          <Compass className="h-8 w-8 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold">No Blueprint Yet</h1>
        <p className="mt-2 text-muted-foreground">
          Complete your life assessment to generate your personalized blueprint.
        </p>
        <ButtonLink
          href="/assessment"
          className="mt-6 bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
        >
          Start Assessment
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Track your progress toward your dream life.
        </p>
      </div>

      <Card className="border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-indigo-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-teal-600" />
            Dream Life Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">
            {blueprint.dreamLifeVision}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-teal-600" />
            90-Day Goals
          </CardTitle>
          <CardDescription>Your current action plan</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {blueprint.ninetyDayActionPlan.map((goal, i) => (
              <li key={i} className="flex items-start gap-3">
                <Badge
                  variant="secondary"
                  className="mt-0.5 h-6 w-6 shrink-0 justify-center rounded-full p-0"
                >
                  {i + 1}
                </Badge>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5 text-teal-600" />
              Weekly Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {blueprint.weeklyPriorities.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  {p}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sunrise className="h-5 w-5 text-teal-600" />
              Daily Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {blueprint.dailyHabits.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {h}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20">
              <MessageCircle className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="font-medium">Weekly Progress Check-in</p>
              <p className="text-sm text-muted-foreground">
                Reflect on your week and get AI coaching
              </p>
            </div>
          </div>
          <ButtonLink
            href="/coach"
            className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
          >
            Start Check-in
            <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}

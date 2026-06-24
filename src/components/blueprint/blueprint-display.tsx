"use client";

import {
  Sparkles,
  Target,
  Calendar,
  ListChecks,
  Sunrise,
  ArrowRight,
  Map,
} from "lucide-react";
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

function TextCard({
  title,
  content,
  icon: Icon,
  highlight,
}: {
  title: string;
  content: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        highlight
          ? "border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-indigo-500/5"
          : "border-border/50"
      }
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-teal-600" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}

function ListCard({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: React.ElementType;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-teal-600" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <Badge
                variant="secondary"
                className="mt-0.5 h-6 w-6 shrink-0 justify-center rounded-full p-0"
              >
                {i + 1}
              </Badge>
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export function BlueprintDisplay({ blueprint }: { blueprint: LifeBlueprint }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-sm text-teal-700 dark:text-teal-300">
          <Sparkles className="h-4 w-4" />
          Your Life Blueprint is Ready
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Navigate Your Future
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generated {new Date(blueprint.createdAt).toLocaleDateString()}
        </p>
      </div>

      <TextCard
        title="Future Self Summary"
        content={blueprint.futureSelfSummary}
        icon={Sparkles}
        highlight
      />

      <div className="grid gap-6 md:grid-cols-2">
        <TextCard
          title="Current State Analysis"
          content={blueprint.currentStateAnalysis}
          icon={Target}
        />
        <TextCard
          title="Dream Life Vision"
          content={blueprint.dreamLifeVision}
          icon={Map}
        />
      </div>

      <TextCard
        title="Gap Analysis"
        content={blueprint.gapAnalysis}
        icon={Target}
      />

      <ListCard
        title="5-Year Roadmap"
        items={blueprint.fiveYearRoadmap}
        icon={Calendar}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ListCard
          title="12-Month Plan"
          items={blueprint.twelveMonthPlan}
          icon={Calendar}
        />
        <ListCard
          title="90-Day Action Plan"
          items={blueprint.ninetyDayActionPlan}
          icon={ListChecks}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ListCard
          title="Weekly Priorities"
          items={blueprint.weeklyPriorities}
          icon={ListChecks}
        />
        <ListCard
          title="Daily Habits"
          items={blueprint.dailyHabits}
          icon={Sunrise}
        />
      </div>

      <Card className="border-teal-500/30 bg-gradient-to-r from-teal-500/10 to-indigo-500/10">
        <CardHeader>
          <CardTitle className="text-xl">Recommended First Step</CardTitle>
          <CardDescription>Start here — today</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            {blueprint.recommendedFirstStep}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/dashboard"
              className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/coach" variant="outline">
              Talk to Weekly Coach
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

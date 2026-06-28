"use client";

import {
  BarChart3,
  Compass,
  RefreshCw,
  Star,
  Target,
  Wallet,
} from "lucide-react";
import type { FeedbackAnalysis, FounderMetrics } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSectionLabel } from "@/lib/founder/analyseFeedback";

function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription>{title}</CardDescription>
          <Icon className="h-4 w-4 text-teal-600" />
        </div>
        <CardTitle className="text-3xl">{value}</CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
    </Card>
  );
}

export function FounderDashboard({
  metrics,
  feedbackAnalysis,
}: {
  metrics: FounderMetrics;
  feedbackAnalysis: FeedbackAnalysis;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold">Product Metrics</h2>
        <Badge variant={metrics.source === "database" ? "default" : "secondary"}>
          {metrics.source === "database" ? "Live Supabase" : "Mock data"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Assessments completed"
          value={metrics.totalAssessments}
          icon={Compass}
        />
        <MetricCard
          title="Blueprints generated"
          value={metrics.totalBlueprints}
          icon={BarChart3}
        />
        <MetricCard
          title="Recalculated blueprints"
          value={metrics.totalRecalculatedBlueprints}
          icon={RefreshCw}
        />
        <MetricCard
          title="Avg blueprint rating"
          value={metrics.averageBlueprintRating ?? "—"}
          icon={Star}
          subtitle={metrics.averageBlueprintRating ? "out of 5" : "No ratings yet"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lowest-rated sections</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.lowestRatedSections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No section ratings yet</p>
            ) : (
              <ul className="space-y-2">
                {metrics.lowestRatedSections.map((s) => (
                  <li
                    key={s.section}
                    className="flex justify-between text-sm"
                  >
                    <span>{formatSectionLabel(s.section)}</span>
                    <span className="font-medium">{s.averageRating}/5</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top feedback themes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {metrics.topFeedbackThemes.map((t) => (
                <li key={t} className="text-sm text-muted-foreground">
                  • {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Most requested focus areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {metrics.mostRequestedFocusAreas.map((f) => (
                <li key={f} className="text-sm">
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" />
              Willingness to pay
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 text-sm">
            <span>Yes: {metrics.willingnessToPaySignals.yes}</span>
            <span>Maybe: {metrics.willingnessToPaySignals.maybe}</span>
            <span>No: {metrics.willingnessToPaySignals.no}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top archetypes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {metrics.topArchetypes.map((a) => (
                <li key={a.archetype}>
                  {a.archetype}: {a.count}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top growth areas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {metrics.topGrowthAreas.map((g) => (
                <li key={g.area}>
                  {g.area}: {g.count}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top user goals</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {metrics.topUserGoals.map((g) => (
                <li key={g.goal}>
                  {g.goal}: {g.count}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-teal-500/20 bg-teal-500/5">
        <CardHeader>
          <CardTitle className="text-base">Feedback analysis</CardTitle>
          <CardDescription>
            Anonymised — no individual user data displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="mb-1 font-medium">Recommended product fixes</p>
            <ul className="space-y-1 text-muted-foreground">
              {feedbackAnalysis.recommendedProductFixes.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 font-medium">Recommended prompt improvements</p>
            <ul className="space-y-1 text-muted-foreground">
              {feedbackAnalysis.recommendedPromptImprovements.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { ensureAuthenticatedUser } from "@/lib/auth";
import {
  canAccessFullProfile,
  canGenerateFullBlueprint,
  getModuleSummaryPreview,
} from "@/lib/features";
import {
  getDiscoveryProgress,
  getAllModuleData,
  saveUnifiedProfile,
  getUnifiedProfile,
} from "@/lib/discovery/storage";
import { getAssessment, saveBlueprint } from "@/lib/storage";
import { formatWeightPercent } from "@/lib/discovery/weights";
import { Disclaimer } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DiscoveryProgress, UnifiedProfile } from "@/types/discovery";

export function UnifiedProfileView() {
  const router = useRouter();
  const [profile, setProfile] = useState<UnifiedProfile | null>(null);
  const [progress, setProgress] = useState<DiscoveryProgress>(getDiscoveryProgress());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const local = getUnifiedProfile();
    if (local) setProfile(local);

    void (async () => {
      try {
        const res = await fetch("/api/unified-profile");
        if (res.ok) {
          const { profile: p, progress: pr } = await res.json();
          if (p) {
            setProfile(p);
            saveUnifiedProfile(p);
          }
          if (pr) setProgress(pr);
        }
      } catch {
        setProgress(getDiscoveryProgress());
      }
    })();
  }, []);

  const synthesizeProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await ensureAuthenticatedUser();
      const modules = getAllModuleData();
      const assessment = getAssessment();

      const res = await fetch("/api/unified-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          palm: modules.palm,
          face: modules.face,
          numerology: modules.numerology,
          tarot: modules.tarot,
          quiz: assessment,
          completedModules: progress.completedModules,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to synthesize profile");

      saveUnifiedProfile(data.profile);
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const generateBlueprint = async () => {
    setGenerating(true);
    setError(null);
    try {
      const user = await ensureAuthenticatedUser();
      const assessment = getAssessment();

      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment: assessment ?? undefined,
          unifiedProfile: profile,
          userId: user.id,
          progress,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate blueprint");

      saveBlueprint(data.blueprint);
      router.push("/blueprint");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const showFull = canAccessFullProfile(progress);
  const canGenerate = progress.completedModules.length > 0;
  const hasBlueprintAccess = canGenerateFullBlueprint(progress);

  if (!profile && progress.completedModules.length === 0) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">
          Complete at least one self-discovery module to build your profile.
        </p>
        <ButtonLink href="/journey" className="mt-4">
          Start Your Journey
        </ButtonLink>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 text-center">
        <Disclaimer />
        <p className="text-muted-foreground">
          You have {progress.completedModules.length} module
          {progress.completedModules.length === 1 ? "" : "s"} completed. Synthesize
          them into your unified self-discovery profile.
        </p>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button
          onClick={() => void synthesizeProfile()}
          disabled={loading}
          className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Synthesizing...
            </>
          ) : (
            "Build My Unified Profile"
          )}
        </Button>
      </div>
    );
  }

  const summary = showFull
    ? profile.unifiedSummary
    : getModuleSummaryPreview(profile.unifiedSummary);

  return (
    <div className="space-y-8">
      <Disclaimer />

      <div className="text-center">
        <Badge className="mb-4 bg-gradient-to-r from-teal-500 to-indigo-600 text-white">
          <Sparkles className="mr-1 h-3 w-3" />
          Self-Discovery Profile
        </Badge>
        <h1 className="text-3xl font-bold">Your Self-Discovery Profile</h1>
        <p className="mt-2 text-muted-foreground">
          {profile.completedModules.length} modules combined
        </p>
      </div>

      <Card className="border-teal-500/20">
        <CardHeader>
          <CardTitle>Blueprint Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={profile.blueprintConfidenceScore} className="h-3 flex-1" />
            <span className="text-lg font-semibold">
              {profile.blueprintConfidenceScore}%
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.completedModules.map((m) => (
              <Badge key={m} variant="secondary">
                {m}: {formatWeightPercent(profile.weights[m] ?? 0)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <TextSection title="Overall Summary" content={summary} />
      {!showFull && (
        <p className="text-center text-sm text-muted-foreground">
          Upgrade to premium to view your full unified profile.
        </p>
      )}

      {showFull && (
        <>
          <ListSection title="Top 5 Strengths" items={profile.topStrengths} />
          <ListSection title="Top 3 Blind Spots" items={profile.blindSpots} />
          <ListSection title="Career Direction" items={profile.careerDirection} />
          <ListSection title="Relationship Style" items={profile.relationshipStyle} />
          <ListSection title="Money Style" items={profile.moneyStyle} />
          <ListSection title="Stress Pattern" items={profile.stressPattern} />
          <ListSection
            title="Growth Recommendations"
            items={profile.growthRecommendations}
          />
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          onClick={() => void synthesizeProfile()}
          variant="outline"
          disabled={loading}
        >
          {loading ? "Updating..." : "Refresh Profile"}
        </Button>
        <Button
          onClick={() => void generateBlueprint()}
          disabled={!canGenerate || generating}
          className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate My LifeGPS Blueprint
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {!hasBlueprintAccess && (
        <p className="text-center text-sm text-muted-foreground">
          Free users receive a limited blueprint preview. Premium unlocks the full
          LifeGPS Blueprint and feedback refinement.
        </p>
      )}
    </div>
  );
}

function TextSection({ title, content }: { title: string; content: string }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-muted-foreground">
              <Badge
                variant="secondary"
                className="h-6 w-6 shrink-0 justify-center rounded-full p-0"
              >
                {i + 1}
              </Badge>
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

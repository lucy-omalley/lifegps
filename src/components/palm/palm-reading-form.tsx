"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ensureAuthenticatedUser } from "@/lib/auth";
import { canStartModule } from "@/lib/features";
import { savePalmReading, getDiscoveryProgress } from "@/lib/discovery/storage";
import { ImageUpload } from "@/components/discovery/image-upload";
import { Disclaimer } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PalmReading } from "@/types/discovery";

export function PalmReadingForm() {
  const [leftHand, setLeftHand] = useState<string>();
  const [rightHand, setRightHand] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<PalmReading | null>(null);

  const handleSubmit = async () => {
    setError(null);

    const progress = getDiscoveryProgress();
    if (!canStartModule("palm", progress) && !progress.completedModules.includes("palm")) {
      setError("Free users can complete one module. Upgrade to premium for all modules.");
      return;
    }

    if (!leftHand && !rightHand) {
      setError("Please upload at least one hand image.");
      return;
    }

    setLoading(true);
    try {
      const user = await ensureAuthenticatedUser();
      const res = await fetch("/api/palm-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leftHandImage: leftHand,
          rightHandImage: rightHand,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate reading");

      savePalmReading(data.reading);
      setReading(data.reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (reading) {
    return <PalmReadingResult reading={reading} onReset={() => setReading(null)} />;
  }

  return (
    <div className="space-y-6">
      <Disclaimer />
      <div className="grid gap-6 md:grid-cols-2">
        <ImageUpload
          label="Left Hand (optional)"
          value={leftHand}
          onChange={setLeftHand}
          onError={setError}
        />
        <ImageUpload
          label="Right Hand (optional)"
          value={rightHand}
          onChange={setRightHand}
          onError={setError}
        />
      </div>
      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        onClick={() => void handleSubmit()}
        disabled={loading}
        className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analysing your palm...
          </>
        ) : (
          "Generate Palm Reading"
        )}
      </Button>
    </div>
  );
}

function PalmReadingResult({
  reading,
  onReset,
}: {
  reading: PalmReading;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <Disclaimer />
      <Card className="border-teal-500/20">
        <CardHeader>
          <CardTitle>Your Palm Reading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="leading-relaxed text-muted-foreground">{reading.aiSummary}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <InsightList title="Strengths" items={reading.strengths} />
            <InsightList title="Blind Spots" items={reading.blindSpots} />
            <InsightList title="Career Tendencies" items={reading.careerInsights} />
            <InsightList title="Relationship Tendencies" items={reading.relationshipInsights} />
          </div>
          <details className="rounded-lg border border-border/50 p-4">
            <summary className="cursor-pointer text-sm font-medium">
              Symbolic Features (for reflection)
            </summary>
            <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
              {Object.entries(reading.extractedFeatures).map(([key, value]) => (
                <div key={key}>
                  <dt className="font-medium capitalize text-foreground">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </details>
          <Button variant="outline" onClick={onReset}>
            Upload New Images
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="h-5 w-5 shrink-0 justify-center rounded-full p-0 text-xs">
              {i + 1}
            </Badge>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ensureAuthenticatedUser } from "@/lib/auth";
import { canStartModule } from "@/lib/features";
import { saveFaceReading, getDiscoveryProgress } from "@/lib/discovery/storage";
import { ImageUpload } from "@/components/discovery/image-upload";
import { Disclaimer } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FaceReading } from "@/types/discovery";

export function FaceReadingForm() {
  const [faceImage, setFaceImage] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<FaceReading | null>(null);

  const handleSubmit = async () => {
    setError(null);

    const progress = getDiscoveryProgress();
    if (!canStartModule("face", progress) && !progress.completedModules.includes("face")) {
      setError("Free users can complete one module. Upgrade to premium for all modules.");
      return;
    }

    if (!faceImage) {
      setError("Please upload a clear front-facing photo.");
      return;
    }

    setLoading(true);
    try {
      const user = await ensureAuthenticatedUser();
      const res = await fetch("/api/face-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceImage, userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate reading");

      saveFaceReading(data.reading);
      setReading(data.reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (reading) {
    return <FaceReadingResult reading={reading} onReset={() => setReading(null)} />;
  }

  return (
    <div className="space-y-6">
      <Disclaimer />
      <ImageUpload
        label="Front-Facing Photo"
        value={faceImage}
        onChange={setFaceImage}
        onError={setError}
      />
      <p className="text-sm text-muted-foreground">
        Use a clear, well-lit photo facing the camera. This reading focuses on
        expression and communication style — not appearance judgments.
      </p>
      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        onClick={() => void handleSubmit()}
        disabled={loading}
        className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating reflection...
          </>
        ) : (
          "Generate Face Reading"
        )}
      </Button>
    </div>
  );
}

function FaceReadingResult({
  reading,
  onReset,
}: {
  reading: FaceReading;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <Disclaimer />
      <Card className="border-teal-500/20">
        <CardHeader>
          <CardTitle>Your Face Reading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="leading-relaxed text-muted-foreground">{reading.aiSummary}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <InsightList title="Confidence" items={reading.confidenceInsights} />
            <InsightList title="Communication" items={reading.communicationInsights} />
            <InsightList title="Leadership" items={reading.leadershipInsights} />
            <InsightList title="Stress Patterns" items={reading.stressPattern} />
          </div>
          <Button variant="outline" onClick={onReset}>
            Upload New Photo
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

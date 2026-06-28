"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ensureAuthenticatedUser } from "@/lib/auth";
import { canStartModule } from "@/lib/features";
import { saveNumerologyReading, getDiscoveryProgress } from "@/lib/discovery/storage";
import { LIFE_PATH_THEMES } from "@/lib/discovery/numerology";
import { Disclaimer } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NumerologyReading } from "@/types/discovery";

export function NumerologyForm() {
  const [birthDate, setBirthDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<NumerologyReading | null>(null);

  const handleSubmit = async () => {
    setError(null);

    const progress = getDiscoveryProgress();
    if (
      !canStartModule("numerology", progress) &&
      !progress.completedModules.includes("numerology")
    ) {
      setError("Free users can complete one module. Upgrade to premium for all modules.");
      return;
    }

    if (!birthDate) {
      setError("Birth date is required.");
      return;
    }

    setLoading(true);
    try {
      const user = await ensureAuthenticatedUser();
      const res = await fetch("/api/numerology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, fullName: fullName || undefined, userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate reading");

      saveNumerologyReading(data.reading);
      setReading(data.reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (reading) {
    return <NumerologyResult reading={reading} onReset={() => setReading(null)} />;
  }

  return (
    <div className="space-y-6">
      <Disclaimer />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Birth Date *</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name (optional)</Label>
          <Input
            id="fullName"
            placeholder="For Expression & Soul numbers"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
      </div>
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
            Calculating...
          </>
        ) : (
          "Discover My Numbers"
        )}
      </Button>
    </div>
  );
}

function NumerologyResult({
  reading,
  onReset,
}: {
  reading: NumerologyReading;
  onReset: () => void;
}) {
  const theme = LIFE_PATH_THEMES[reading.lifePathNumber] ?? "Personal growth";

  return (
    <div className="space-y-6">
      <Disclaimer />
      <Card className="border-teal-500/20">
        <CardHeader>
          <CardTitle>Your Numerology Reading</CardTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge>Life Path {reading.lifePathNumber}</Badge>
            <Badge variant="secondary">
              Personal Year {reading.personalYearNumber}
            </Badge>
            {reading.expressionNumber && (
              <Badge variant="outline">Expression {reading.expressionNumber}</Badge>
            )}
            {reading.soulNumber && (
              <Badge variant="outline">Soul {reading.soulNumber}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-teal-700 dark:text-teal-300">{theme}</p>
          <p className="leading-relaxed text-muted-foreground">{reading.aiSummary}</p>
          <Button variant="outline" onClick={onReset}>
            Calculate Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

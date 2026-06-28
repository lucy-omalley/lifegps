"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ensureAuthenticatedUser } from "@/lib/auth";
import { canStartModule } from "@/lib/features";
import { saveTarotReading, getDiscoveryProgress } from "@/lib/discovery/storage";
import { getSpreadLabel } from "@/lib/discovery/tarot";
import { Disclaimer } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TarotReading, TarotSpreadType } from "@/types/discovery";

const SPREADS: TarotSpreadType[] = ["single", "three-card", "five-card"];

export function TarotReadingForm() {
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState<TarotSpreadType>("three-card");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<TarotReading | null>(null);

  const handleSubmit = async () => {
    setError(null);

    const progress = getDiscoveryProgress();
    if (!canStartModule("tarot", progress) && !progress.completedModules.includes("tarot")) {
      setError("Free users can complete one module. Upgrade to premium for all modules.");
      return;
    }

    if (!question.trim()) {
      setError("Please enter a question for reflection.");
      return;
    }

    setLoading(true);
    try {
      const user = await ensureAuthenticatedUser();
      const res = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, spreadType, userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate reading");

      saveTarotReading(data.reading);
      setReading(data.reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (reading) {
    return <TarotResult reading={reading} onReset={() => setReading(null)} />;
  }

  return (
    <div className="space-y-6">
      <Disclaimer />
      <div className="space-y-2">
        <Label htmlFor="question">Your Question</Label>
        <Input
          id="question"
          placeholder="What would you like clarity on?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Choose Spread</Label>
        <div className="grid gap-2">
          {SPREADS.map((spread) => (
            <button
              key={spread}
              type="button"
              onClick={() => setSpreadType(spread)}
              className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                spreadType === spread
                  ? "border-teal-500 bg-teal-500/10"
                  : "border-border/50 hover:border-teal-500/30"
              }`}
            >
              {getSpreadLabel(spread)}
            </button>
          ))}
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
            Drawing cards...
          </>
        ) : (
          "Draw Cards"
        )}
      </Button>
    </div>
  );
}

function TarotResult({
  reading,
  onReset,
}: {
  reading: TarotReading;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <Disclaimer />
      <Card className="border-teal-500/20">
        <CardHeader>
          <CardTitle>Your Tarot Reading</CardTitle>
          <p className="text-sm text-muted-foreground">&ldquo;{reading.question}&rdquo;</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reading.cards.map((card, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/50 bg-muted/20 p-4 text-center"
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {card.position}
                </p>
                <p className="mt-1 font-medium">{card.name}</p>
                <Badge variant="secondary" className="mt-2">
                  {card.orientation}
                </Badge>
              </div>
            ))}
          </div>
          <p className="leading-relaxed text-muted-foreground">
            {reading.aiInterpretation}
          </p>
          <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-4">
            <h4 className="text-sm font-medium">Action & Reflection</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              {reading.actionReflection}
            </p>
          </div>
          <Button variant="outline" onClick={onReset}>
            New Reading
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

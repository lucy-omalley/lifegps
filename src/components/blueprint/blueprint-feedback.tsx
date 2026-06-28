"use client";

import { useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { canUseFeedbackRefinement } from "@/lib/features";
import { getDiscoveryProgress } from "@/lib/discovery/storage";
import { saveBlueprint } from "@/lib/storage";
import type { LifeBlueprint } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PRESETS = [
  "This feels too ambitious",
  "I want more career focus",
  "I want more family balance",
  "I don't like this direction",
  "Make this more realistic",
];

export function BlueprintFeedback({
  blueprint,
  onRefined,
}: {
  blueprint: LifeBlueprint;
  onRefined: (blueprint: LifeBlueprint) => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = getDiscoveryProgress();
  const canRefine = canUseFeedbackRefinement(progress);

  const handleRefine = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/blueprint", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint, feedback, progress }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to refine blueprint");

      saveBlueprint(data.blueprint);
      onRefined(data.blueprint);
      setFeedback("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-teal-600" />
        <h3 className="text-lg font-semibold">Refine Your Blueprint</h3>
      </div>

      {!canRefine ? (
        <p className="text-sm text-muted-foreground">
          Feedback refinement is a premium feature. Upgrade to adjust your roadmap
          based on your preferences.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Tell us how this blueprint feels. We&apos;ll regenerate it to better
            match your goals.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setFeedback(preset)}
                className="rounded-full border border-border/60 px-3 py-1 text-xs transition-colors hover:border-teal-500/40 hover:bg-teal-500/5"
              >
                {preset}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
          />
          {error && (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          )}
          <Button
            onClick={() => void handleRefine()}
            disabled={loading || !feedback.trim()}
            className="mt-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              "Regenerate Blueprint"
            )}
          </Button>
        </>
      )}
    </div>
  );
}

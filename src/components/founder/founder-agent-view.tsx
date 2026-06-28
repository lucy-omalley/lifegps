"use client";

import { useCallback, useEffect, useState } from "react";
import { FounderDashboard } from "@/components/founder/founder-dashboard";
import {
  FounderChat,
  WeeklyFounderPlan,
} from "@/components/founder/founder-chat";
import {
  FounderGate,
  useFounderEmail,
  getFounderHeaders,
} from "@/components/founder/founder-gate";
import type { FounderProductContext } from "@/types";

export function FounderAgentView() {
  const { email, saveEmail } = useFounderEmail();
  const [authenticated, setAuthenticated] = useState(false);
  const [context, setContext] = useState<FounderProductContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMetrics = useCallback(async (founderEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/founder-agent/metrics", {
        headers: getFounderHeaders(founderEmail),
      });
      if (res.status === 403) {
        setError("Access denied. Check ADMIN_EMAIL matches your login email.");
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to load metrics");
      const data = await res.json();
      setContext(data);
      setAuthenticated(true);
    } catch {
      setError("Failed to load founder metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (email) {
      loadMetrics(email);
    }
  }, [email, loadMetrics]);

  const handleAuth = (founderEmail: string) => {
    saveEmail(founderEmail);
    loadMetrics(founderEmail);
  };

  if (!authenticated && !loading) {
    return (
      <div className="py-12">
        <FounderGate onAuthenticated={handleAuth} />
        {error && (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  if (loading || !context) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading founder dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Founder Agent</h1>
        <p className="mt-1 text-muted-foreground">
          Internal dashboard to validate and grow LifeGPS — data is anonymised.
        </p>
      </div>

      <FounderDashboard
        metrics={context.metrics}
        feedbackAnalysis={context.feedbackAnalysis}
      />

      <WeeklyFounderPlan email={email} />

      <FounderChat email={email} />
    </div>
  );
}

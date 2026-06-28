"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { DISCOVERY_MODULES } from "@/lib/discovery/modules";
import { getDiscoveryProgress } from "@/lib/discovery/storage";
import type { DiscoveryModuleId } from "@/types/discovery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function DiscoveryProgress() {
  const [completed, setCompleted] = useState<DiscoveryModuleId[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/discovery/progress");
        if (res.ok) {
          const { progress } = await res.json();
          setCompleted(progress.completedModules ?? []);
          return;
        }
      } catch {
        // fall through to localStorage
      }
      setCompleted(getDiscoveryProgress().completedModules);
    };
    void load();
  }, []);

  const total = DISCOVERY_MODULES.length;
  const done = completed.length;
  const percent = (done / total) * 100;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Your Discovery Progress</CardTitle>
        <p className="text-sm text-muted-foreground">
          {done} of {total} modules completed
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={percent} className="h-2" />
        <ul className="grid gap-2 sm:grid-cols-2">
          {DISCOVERY_MODULES.map((module) => {
            const isDone = completed.includes(module.id);
            return (
              <li
                key={module.id}
                className="flex items-center gap-2 text-sm"
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={isDone ? "text-foreground" : "text-muted-foreground"}>
                  {module.label}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

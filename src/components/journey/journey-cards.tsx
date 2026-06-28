"use client";

import Link from "next/link";
import {
  Hand,
  ScanFace,
  Hash,
  Sparkles,
  ClipboardList,
  ArrowRight,
  Lock,
} from "lucide-react";
import { DISCOVERY_MODULES } from "@/lib/discovery/modules";
import { canStartModule } from "@/lib/features";
import { getDiscoveryProgress } from "@/lib/discovery/storage";
import type { DiscoveryModuleId } from "@/types/discovery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const ICONS = {
  Hand,
  ScanFace,
  Hash,
  Sparkles,
  ClipboardList,
} as const;

export function JourneyCards() {
  const [completed, setCompleted] = useState<DiscoveryModuleId[]>([]);
  const [progress, setProgress] = useState(getDiscoveryProgress());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/discovery/progress");
        if (res.ok) {
          const { progress: p } = await res.json();
          setProgress(p);
          setCompleted(p.completedModules ?? []);
        }
      } catch {
        const local = getDiscoveryProgress();
        setProgress(local);
        setCompleted(local.completedModules);
      }
    };
    void load();
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {DISCOVERY_MODULES.map((module) => {
        const Icon = ICONS[module.icon as keyof typeof ICONS] ?? Sparkles;
        const isDone = completed.includes(module.id);
        const locked = !canStartModule(module.id, progress);

        return (
          <Card
            key={module.id}
            className={`group relative border-border/50 transition-all hover:border-teal-500/30 hover:shadow-md ${
              locked ? "opacity-70" : ""
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/10 to-indigo-500/10">
                  <Icon className="h-5 w-5 text-teal-600" />
                </div>
                {isDone && (
                  <Badge variant="secondary" className="text-teal-700">
                    Completed
                  </Badge>
                )}
                {locked && !isDone && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <CardTitle className="text-lg">{module.label}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {locked && !isDone ? (
                <p className="text-sm text-muted-foreground">
                  Premium unlocks all modules. Free users get one module.
                </p>
              ) : (
                <Link
                  href={module.href}
                  className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  {isDone ? "View again" : "Start"}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

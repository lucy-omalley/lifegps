"use client";

import { Clock, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompassIntroProps {
  onStart: () => void;
}

export function CompassIntro({ onStart }: CompassIntroProps) {
  return (
    <div className="mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="overflow-hidden border-border/40 bg-card/80 shadow-xl backdrop-blur-sm">
        <div className="bg-gradient-to-br from-teal-500/10 via-transparent to-indigo-500/10 px-6 pt-8 pb-2 sm:px-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20">
              <Compass className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          <CardHeader className="space-y-3 p-0 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
              LifeGPS Compass™ Assessment
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Discover your LifeGPS profile across purpose, career, energy,
              growth, money, communication, resilience, and execution. Your
              answers will be used to generate your personalised Life Blueprint.
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="space-y-6 px-6 pb-8 pt-6 sm:px-10">
          <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 text-center">
            <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
              In 8 minutes, discover what is holding you back and receive a
              personalised roadmap to the life you want.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Approx. 8 minutes</span>
            <span className="text-border">•</span>
            <Sparkles className="h-4 w-4" />
            <span>50 questions</span>
          </div>

          <Button
            onClick={onStart}
            size="lg"
            className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700"
          >
            Start My Compass Assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Clock, Compass, Sparkles } from "lucide-react";
import { TOTAL_SECTIONS } from "@/lib/compass/sections";
import { TOTAL_QUESTIONS } from "@/lib/compass/questions";
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
    <div className="mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="overflow-hidden border-border/40 bg-card/80 shadow-xl backdrop-blur-sm">
        <div className="bg-gradient-to-br from-teal-500/10 via-transparent to-indigo-500/10 px-6 pt-10 pb-2 sm:px-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20 shadow-inner">
              <Compass className="h-10 w-10 text-teal-600" />
            </div>
          </div>
          <CardHeader className="space-y-4 p-0 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
              Discover Your LifeGPS Profile
            </CardTitle>
            <CardDescription className="text-base leading-relaxed sm:text-lg">
              A short, conversational journey — not a questionnaire. In a few
              minutes, LifeGPS builds a starting hypothesis about who you are
              and where you&apos;re headed.
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="space-y-6 px-6 pb-10 pt-8 sm:px-10">
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-indigo-500/5 p-5 text-center">
            <p className="text-sm font-medium leading-relaxed text-teal-800 dark:text-teal-200">
              One question at a time. Mostly taps, no typing. Your AI coach
              keeps learning after onboarding through weekly conversations.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              3–5 minutes
            </span>
            <span className="hidden text-border sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              {TOTAL_QUESTIONS} questions
            </span>
            <span className="hidden text-border sm:inline">•</span>
            <span>{TOTAL_SECTIONS} short sections</span>
          </div>

          <Button
            onClick={onStart}
            size="lg"
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 text-base text-white shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-indigo-700"
          >
            Begin My Discovery Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

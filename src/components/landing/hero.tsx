"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-teal-500/10 via-indigo-500/10 to-transparent blur-3xl" />
        <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute -left-20 top-60 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-sm text-teal-700 dark:text-teal-300">
          <Sparkles className="h-4 w-4" />
          AI Life Architect for Professionals
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Navigate Your Future{" "}
          <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
            with AI
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          LifeGPS helps professionals escape burnout, build side businesses,
          improve communication, and create a roadmap to their dream life.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ButtonLink
            href="/assessment"
            size="lg"
            className="h-12 bg-gradient-to-r from-teal-500 to-indigo-600 px-8 text-base text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-indigo-700"
          >
            Create My Life Blueprint
            <ArrowRight className="ml-2 h-5 w-5" />
          </ButtonLink>
          <ButtonLink
            href="/#features"
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base"
          >
            See How It Works
          </ButtonLink>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Free assessment · No credit card required
        </p>
      </div>
    </section>
  );
}

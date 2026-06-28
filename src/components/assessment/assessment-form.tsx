"use client";

import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { CompassIntro } from "./compass-intro";
import { CompassQuestionView } from "./compass-question";
import { CompassReveal } from "./compass-reveal";
import {
  COMPASS_QUESTIONS,
  TOTAL_QUESTIONS,
} from "@/lib/compass/questions";
import {
  getSectionForQuestion,
  TOTAL_SECTIONS,
} from "@/lib/compass/sections";
import { buildAnswer, computeCompassResults } from "@/lib/compass/scoring";
import { ensureAuthenticatedUser } from "@/lib/auth";
import {
  clearCompassSessionFromDatabase,
  syncCompassSessionToDatabase,
} from "@/lib/data/sync";
import {
  clearCompassSession,
  saveAssessment,
  saveBlueprint,
  saveCompassSession,
} from "@/lib/storage";
import { markModuleComplete } from "@/lib/discovery/storage";
import {
  assessmentPhaseAtom,
  compassAnswersMapAtom,
  compassAssessmentAtom,
  currentQuestionAtom,
} from "@/store/assessment";
import type { CompassAnswer, CompassAssessment } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function AssessmentForm() {
  const router = useRouter();
  const [phase, setPhase] = useAtom(assessmentPhaseAtom);
  const [questionIndex, setQuestionIndex] = useAtom(currentQuestionAtom);
  const [answersMap, setAnswersMap] = useAtom(compassAnswersMapAtom);
  const [assessment, setAssessment] = useAtom(compassAssessmentAtom);
  const [error, setError] = useState<string | null>(null);
  const [blueprintReady, setBlueprintReady] = useState(false);

  const question = COMPASS_QUESTIONS[questionIndex];
  const currentAnswer = question ? answersMap[question.id] : undefined;
  const section = question ? getSectionForQuestion(question.id) : null;
  const sectionStep = section?.id ?? 1;
  const sectionProgress =
    phase === "questions" && section
      ? (sectionStep / TOTAL_SECTIONS) * 100
      : phase === "intro"
        ? 0
        : 100;

  const isOptional = question?.type === "optionalText";
  const hasAnswer = isOptional || Boolean(currentAnswer);
  const isLastScreen = questionIndex === COMPASS_QUESTIONS.length - 1;

  const persistSession = useCallback(
    (map: Record<number, CompassAnswer>, qIndex: number, currentPhase: string) => {
      const answers = Object.values(map).sort((a, b) => a.questionId - b.questionId);
      const payload = {
        answers,
        currentQuestion: qIndex,
        phase: currentPhase,
      };
      saveCompassSession(payload);
      void syncCompassSessionToDatabase(payload);
    },
    []
  );

  useEffect(() => {
    if (phase === "questions" && Object.keys(answersMap).length > 0) {
      persistSession(answersMap, questionIndex, phase);
    }
  }, [answersMap, questionIndex, phase, persistSession]);

  const handleStart = () => {
    setPhase("questions");
    setQuestionIndex(0);
    persistSession(answersMap, 0, "questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnswer = (labels: string[], values: (string | number)[]) => {
    if (!question) return;
    const answer = buildAnswer(question.id, labels, values);
    if (!answer) return;
    setAnswersMap((prev) => {
      const next = { ...prev, [question.id]: answer };
      persistSession(next, questionIndex, phase);
      return next;
    });
  };

  const handleNext = () => {
    if (!isLastScreen) {
      setQuestionIndex(questionIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      runCompletionFlow();
    }
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("intro");
    }
  };

  const runCompletionFlow = async () => {
    setError(null);
    const answers = Object.values(answersMap).sort(
      (a, b) => a.questionId - b.questionId
    );
    const results = computeCompassResults(answers);

    const assessmentData: CompassAssessment = {
      answers,
      results,
      completedAt: results.completedAt,
      version: "compass-v2",
    };

    setAssessment(assessmentData);
    saveAssessment(assessmentData);
    markModuleComplete("quiz");

    setPhase("analysing");
    await delay(1400);

    setPhase("creating-archetype");
    await delay(1400);

    setPhase("building-blueprint");

    try {
      const authUser = await ensureAuthenticatedUser();
      const response = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment: assessmentData,
          userId: authUser.id,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Failed to generate blueprint");
      }

      const { blueprint } = await response.json();
      saveBlueprint(blueprint);
      clearCompassSession();
      void clearCompassSessionFromDatabase();
      setBlueprintReady(true);
      setPhase("archetype-reveal");
    } catch {
      setError("Something went wrong generating your blueprint. Please try again.");
      setPhase("archetype-reveal");
    }
  };

  const handleViewBlueprint = () => {
    if (blueprintReady) {
      router.push("/blueprint");
    } else {
      runCompletionFlow();
    }
  };

  if (phase === "intro") {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-teal-500/5 via-background to-indigo-500/5 py-4">
        <CompassIntro onStart={handleStart} />
      </div>
    );
  }

  if (
    phase === "analysing" ||
    phase === "creating-archetype" ||
    phase === "building-blueprint" ||
    phase === "archetype-reveal"
  ) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-teal-500/5 via-background to-indigo-500/5 py-4">
        <CompassReveal
          phase={phase}
          results={assessment.results}
          error={error}
          onViewBlueprint={handleViewBlueprint}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl min-h-[60vh] px-1">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-teal-700 dark:text-teal-300">
            {section?.title ?? "LifeGPS Compass™"}
          </span>
          <span className="text-muted-foreground">
            Step {sectionStep} of {TOTAL_SECTIONS}
          </span>
        </div>
        <Progress value={sectionProgress} className="h-1.5" />
      </div>

      <div
        key={question?.id}
        className="rounded-3xl border border-border/40 bg-card/90 p-6 shadow-xl shadow-teal-500/5 backdrop-blur-sm sm:p-10"
      >
        {question && (
          <CompassQuestionView
            question={question}
            currentAnswer={currentAnswer}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!hasAnswer && !isOptional}
          size="lg"
          className="min-w-[140px] bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700 disabled:opacity-50"
        >
          {isLastScreen ? (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              See My Results
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {!isOptional && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {TOTAL_QUESTIONS} quick questions · about 3–5 minutes
        </p>
      )}
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

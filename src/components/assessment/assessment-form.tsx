"use client";

import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CompassIntro } from "./compass-intro";
import { CompassQuestionView } from "./compass-question";
import { CompassReveal } from "./compass-reveal";
import { COMPASS_QUESTIONS, TOTAL_QUESTIONS } from "@/lib/compass/questions";
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
  const progress =
    phase === "questions"
      ? ((questionIndex + 1) / TOTAL_QUESTIONS) * 100
      : phase === "intro"
        ? 0
        : 100;

  const hasAnswer = Boolean(currentAnswer);

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
    if (questionIndex < TOTAL_QUESTIONS - 1) {
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
    };

    setAssessment(assessmentData);
    saveAssessment(assessmentData);
    markModuleComplete("quiz");

    setPhase("analysing");
    await delay(1800);

    setPhase("creating-archetype");
    await delay(1800);

    setPhase("building-blueprint");

    try {
      await ensureAuthenticatedUser();
      const response = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment: assessmentData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate blueprint");
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
    <div className="mx-auto max-w-2xl min-h-[60vh]">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-teal-700 dark:text-teal-300">
            LifeGPS Compass™
          </span>
          <span className="text-muted-foreground">
            Question {questionIndex + 1} of {TOTAL_QUESTIONS}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/80 p-6 shadow-lg backdrop-blur-sm sm:p-8">
        {question && (
          <CompassQuestionView
            question={question}
            questionIndex={questionIndex}
            totalQuestions={TOTAL_QUESTIONS}
            currentAnswer={currentAnswer}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!hasAnswer}
          className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700 disabled:opacity-50"
        >
          {questionIndex === TOTAL_QUESTIONS - 1 ? "Complete Assessment" : "Next"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

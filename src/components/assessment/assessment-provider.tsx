"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { Provider } from "jotai";
import { AssessmentForm } from "@/components/assessment/assessment-form";
import {
  loadCompassSessionFromDatabase,
} from "@/lib/data/sync";
import { getCompassSession } from "@/lib/storage";
import {
  assessmentPhaseAtom,
  compassAnswersMapAtom,
  currentQuestionAtom,
} from "@/store/assessment";
import type { AssessmentPhase, CompassAnswer } from "@/types";

function SessionHydrator({ children }: { children: React.ReactNode }) {
  const setPhase = useSetAtom(assessmentPhaseAtom);
  const setQuestionIndex = useSetAtom(currentQuestionAtom);
  const setAnswersMap = useSetAtom(compassAnswersMapAtom);

  useEffect(() => {
    async function hydrate() {
      const fromDb = await loadCompassSessionFromDatabase();
      const local = getCompassSession();
      const session = fromDb ?? local;

      if (!session || session.answers.length === 0) return;

      const map = session.answers.reduce(
        (acc, answer) => {
          acc[answer.questionId] = answer;
          return acc;
        },
        {} as Record<number, CompassAnswer>
      );

      setAnswersMap(map);
      setQuestionIndex(session.currentQuestion);
      setPhase(session.phase as AssessmentPhase);
    }

    hydrate();
  }, [setAnswersMap, setPhase, setQuestionIndex]);

  return <>{children}</>;
}

export function AssessmentProvider() {
  return (
    <Provider>
      <SessionHydrator>
        <AssessmentForm />
      </SessionHydrator>
    </Provider>
  );
}

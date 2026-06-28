import { atom } from "jotai";
import type { AssessmentPhase, CompassAnswer, CompassAssessment } from "@/types";

export const defaultCompassAssessment: CompassAssessment = {
  answers: [],
  results: null,
  version: "compass-v2",
};

export const compassAssessmentAtom = atom<CompassAssessment>(defaultCompassAssessment);
export const currentQuestionAtom = atom(0);
export const assessmentPhaseAtom = atom<AssessmentPhase>("intro");

/** Map of questionId → answer for quick lookup during the session */
export const compassAnswersMapAtom = atom<Record<number, CompassAnswer>>({});

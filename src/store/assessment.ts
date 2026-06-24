import { atom } from "jotai";
import type { AssessmentData } from "@/types";

export const defaultAssessment: AssessmentData = {
  name: "",
  ageRange: "",
  location: "",
  currentJob: "",
  familySituation: "",
  mbtiType: "",
  keyStrengths: "",
  weaknesses: "",
  communicationStyle: "",
  careerSatisfaction: 5,
  energyBurnout: 5,
  financialSituation: "",
  healthLifestyle: "",
  workLifeBalance: "",
  idealLife: "",
  desiredCareer: "",
  desiredIncome: "",
  sideBusinessIdeas: "",
  earlyRetirementGoal: "",
  biggestDream: "",
  whatIsStopping: "",
  timeConstraints: "",
  confidenceIssues: "",
  skillsGaps: "",
  financialPressure: "",
};

export const assessmentAtom = atom<AssessmentData>(defaultAssessment);
export const currentStepAtom = atom(0);

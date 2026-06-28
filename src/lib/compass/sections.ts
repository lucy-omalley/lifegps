export interface CompassSection {
  id: number;
  title: string;
  subtitle?: string;
  questionIds: number[];
}

export const COMPASS_SECTIONS: CompassSection[] = [
  {
    id: 1,
    title: "Your Direction",
    questionIds: [1, 2, 3],
  },
  {
    id: 2,
    title: "How You Naturally Work",
    questionIds: [4, 5, 6],
  },
  {
    id: 3,
    title: "Career",
    questionIds: [7, 8, 9],
  },
  {
    id: 4,
    title: "Lifestyle & Energy",
    questionIds: [10, 11, 12],
  },
  {
    id: 5,
    title: "Money & Freedom",
    questionIds: [13, 14, 15],
  },
  {
    id: 6,
    title: "Growth & Confidence",
    questionIds: [16, 17, 18],
  },
  {
    id: 7,
    title: "Final Reflection",
    questionIds: [19, 20, 21],
  },
];

export function getSectionForQuestion(questionId: number): CompassSection {
  return (
    COMPASS_SECTIONS.find((s) => s.questionIds.includes(questionId)) ??
    COMPASS_SECTIONS[0]
  );
}

export function getSectionIndex(questionId: number): number {
  const section = getSectionForQuestion(questionId);
  return COMPASS_SECTIONS.findIndex((s) => s.id === section.id);
}

export const TOTAL_SECTIONS = COMPASS_SECTIONS.length;

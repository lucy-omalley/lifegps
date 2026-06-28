import type { CompassQuestion } from "@/types";

function opts(
  labels: string[],
  scores?: number[]
): CompassQuestion["options"] {
  return labels.map((label, i) => ({
    label,
    value: label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    score: scores?.[i] ?? Math.round(25 + (i / Math.max(labels.length - 1, 1)) * 75),
  }));
}

export const COMPASS_QUESTIONS: CompassQuestion[] = [
  // Section 1 — Your Direction
  {
    id: 1,
    sectionId: 1,
    sectionTitle: "Your Direction",
    dimension: "purpose",
    text: "Which best describes your current life?",
    type: "singleChoice",
    options: opts(
      [
        "I'm thriving",
        "I'm doing well",
        "I feel stuck",
        "I'm burned out",
        "I'm searching for something more",
      ],
      [95, 80, 45, 15, 55]
    ),
  },
  {
    id: 2,
    sectionId: 1,
    sectionTitle: "Your Direction",
    dimension: "purpose",
    text: "If your life looked amazing in five years, what would have changed?",
    type: "multiChoice",
    maxSelections: 3,
    options: opts([
      "Better career",
      "More money",
      "Side business",
      "Better health",
      "Better relationships",
      "More confidence",
      "More freedom",
      "Early retirement",
    ]),
  },
  {
    id: 3,
    sectionId: 1,
    sectionTitle: "Your Direction",
    dimension: "purpose",
    text: "How clear is your life direction?",
    type: "scale1to10",
  },

  // Section 2 — How You Naturally Work
  {
    id: 4,
    sectionId: 2,
    sectionTitle: "How You Naturally Work",
    dimension: "execution",
    text: "When starting something new, you usually...",
    type: "singleChoice",
    options: opts(
      [
        "Jump straight in",
        "Research everything",
        "Make a detailed plan",
        "Ask others first",
        "Wait until I'm ready",
      ],
      [85, 70, 90, 65, 40]
    ),
  },
  {
    id: 5,
    sectionId: 2,
    sectionTitle: "How You Naturally Work",
    dimension: "execution",
    text: "What motivates you most?",
    type: "multiChoice",
    maxSelections: 2,
    options: opts([
      "Achievement",
      "Freedom",
      "Security",
      "Helping people",
      "Creativity",
      "Learning",
      "Family",
    ]),
  },
  {
    id: 6,
    sectionId: 2,
    sectionTitle: "How You Naturally Work",
    dimension: "execution",
    text: "When facing a difficult decision...",
    type: "singleChoice",
    options: opts(
      [
        "Trust intuition",
        "Analyse everything",
        "Ask advice",
        "Delay the decision",
        "Make a quick choice",
      ],
      [75, 80, 70, 35, 85]
    ),
  },

  // Section 3 — Career
  {
    id: 7,
    sectionId: 3,
    sectionTitle: "Career",
    dimension: "career",
    text: "How satisfied are you with your career?",
    type: "scale1to10",
  },
  {
    id: 8,
    sectionId: 3,
    sectionTitle: "Career",
    dimension: "career",
    text: "What frustrates you most about work?",
    type: "multiChoice",
    maxSelections: 2,
    options: opts(
      [
        "Stress",
        "Lack of purpose",
        "Salary",
        "Poor manager",
        "No growth",
        "Long hours",
        "Office politics",
      ],
      [40, 35, 45, 40, 50, 35, 40]
    ),
  },
  {
    id: 9,
    sectionId: 3,
    sectionTitle: "Career",
    dimension: "career",
    text: "Which future excites you most?",
    type: "singleChoice",
    options: opts(
      ["Promotion", "New career", "Own business", "Freelance", "Better balance"],
      [75, 70, 85, 80, 70]
    ),
  },

  // Section 4 — Lifestyle & Energy
  {
    id: 10,
    sectionId: 4,
    sectionTitle: "Lifestyle & Energy",
    dimension: "energy",
    text: "How would you describe your current energy?",
    type: "singleChoice",
    options: opts(
      ["Energised", "Mostly good", "Often tired", "Burned out"],
      [100, 75, 40, 10]
    ),
  },
  {
    id: 11,
    sectionId: 4,
    sectionTitle: "Lifestyle & Energy",
    dimension: "energy",
    text: "What drains your energy?",
    type: "multiChoice",
    maxSelections: 2,
    options: opts([
      "Work",
      "Money",
      "Family responsibilities",
      "Health",
      "Lack of purpose",
      "Too many commitments",
    ]),
  },
  {
    id: 12,
    sectionId: 4,
    sectionTitle: "Lifestyle & Energy",
    dimension: "energy",
    text: "If you had one extra hour every day, what would you do?",
    type: "singleChoice",
    options: opts([
      "Learn",
      "Exercise",
      "Build a business",
      "Spend time with family",
      "Relax",
      "Travel",
    ]),
  },

  // Section 5 — Money & Freedom
  {
    id: 13,
    sectionId: 5,
    sectionTitle: "Money & Freedom",
    dimension: "freedom",
    text: "Financial freedom means...",
    type: "multiChoice",
    maxSelections: 2,
    options: opts([
      "Passive income",
      "No debt",
      "Early retirement",
      "Flexible lifestyle",
      "Family security",
      "Leaving my job",
    ]),
  },
  {
    id: 14,
    sectionId: 5,
    sectionTitle: "Money & Freedom",
    dimension: "freedom",
    text: "How confident are you managing money?",
    type: "scale1to10",
  },
  {
    id: 15,
    sectionId: 5,
    sectionTitle: "Money & Freedom",
    dimension: "freedom",
    text: "If someone gave you €20,000 today, what would you do first?",
    type: "singleChoice",
    options: opts(
      [
        "Invest",
        "Save",
        "Start a business",
        "Pay debt",
        "Travel",
        "Learn a new skill",
      ],
      [90, 75, 85, 80, 50, 70]
    ),
  },

  // Section 6 — Growth & Confidence
  {
    id: 16,
    sectionId: 6,
    sectionTitle: "Growth & Confidence",
    dimension: "communication",
    text: "Which skill would improve your life the most?",
    type: "singleChoice",
    options: opts([
      "Communication",
      "Leadership",
      "Business",
      "Financial knowledge",
      "Confidence",
      "Time management",
    ]),
  },
  {
    id: 17,
    sectionId: 6,
    sectionTitle: "Growth & Confidence",
    dimension: "communication",
    text: "What usually stops you?",
    type: "multiChoice",
    maxSelections: 2,
    options: opts(
      [
        "Time",
        "Confidence",
        "Money",
        "Fear of failure",
        "Too many ideas",
        "Lack of support",
      ],
      [50, 40, 45, 35, 45, 40]
    ),
  },
  {
    id: 18,
    sectionId: 6,
    sectionTitle: "Growth & Confidence",
    dimension: "execution",
    text: "How ready are you to make meaningful changes?",
    type: "scale1to10",
  },

  // Section 7 — Final Reflection
  {
    id: 19,
    sectionId: 7,
    sectionTitle: "Final Reflection",
    dimension: "purpose",
    text: "What outcome do you want most from LifeGPS?",
    type: "singleChoice",
    options: opts([
      "More clarity",
      "Career roadmap",
      "Better habits",
      "Side business plan",
      "Confidence",
      "Early retirement roadmap",
      "Burnout recovery",
    ]),
  },
  {
    id: 20,
    sectionId: 7,
    sectionTitle: "Final Reflection",
    dimension: "execution",
    text: "Which statement sounds most like you?",
    type: "singleChoice",
    options: opts(
      [
        "I know what I want but need a plan.",
        "I have too many ideas.",
        "I don't know where to start.",
        "I need accountability.",
        "I want someone to guide me.",
      ],
      [85, 55, 40, 60, 70]
    ),
  },
  {
    id: 21,
    sectionId: 7,
    sectionTitle: "Final Reflection",
    dimension: "purpose",
    text: "Anything else you'd like LifeGPS to know?",
    type: "optionalText",
  },
];

export const TOTAL_QUESTIONS = COMPASS_QUESTIONS.filter(
  (q) => q.type !== "optionalText"
).length;

export const TOTAL_SCREENS = COMPASS_QUESTIONS.length;

export function getQuestionById(id: number): CompassQuestion | undefined {
  return COMPASS_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionIndexById(id: number): number {
  return COMPASS_QUESTIONS.findIndex((q) => q.id === id);
}

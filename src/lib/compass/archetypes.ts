import type { LifeGPSArchetype } from "@/types";

export interface ArchetypeDefinition {
  id: LifeGPSArchetype;
  title: LifeGPSArchetype;
  description: string;
  signals: {
    dimension: string;
    minScore?: number;
    maxScore?: number;
  }[];
}

export const ARCHETYPES: Record<LifeGPSArchetype, ArchetypeDefinition> = {
  "The Strategic Builder": {
    id: "The Strategic Builder",
    title: "The Strategic Builder",
    description:
      "You are ambitious, thoughtful, and future-focused. Your biggest opportunity is turning your plans into consistent action.",
    signals: [
      { dimension: "purpose", minScore: 65 },
      { dimension: "execution", minScore: 60 },
      { dimension: "career", minScore: 55 },
    ],
  },
  "The Burnout Escaper": {
    id: "The Burnout Escaper",
    title: "The Burnout Escaper",
    description:
      "You have been running on empty for too long. Your path forward starts with restoring energy and redesigning how you work.",
    signals: [
      { dimension: "energy", maxScore: 45 },
      { dimension: "career", maxScore: 45 },
    ],
  },
  "The Career Changer": {
    id: "The Career Changer",
    title: "The Career Changer",
    description:
      "You feel ready for a new chapter. Your strength is self-awareness — now you need a clear transition strategy.",
    signals: [
      { dimension: "career", maxScore: 50 },
      { dimension: "communication", minScore: 55 },
    ],
  },
  "The Freedom Seeker": {
    id: "The Freedom Seeker",
    title: "The Freedom Seeker",
    description:
      "Freedom and flexibility drive you more than status. Your roadmap should prioritise income options and lifestyle design.",
    signals: [
      { dimension: "freedom", minScore: 60 },
      { dimension: "purpose", minScore: 50 },
    ],
  },
  "The Purpose Explorer": {
    id: "The Purpose Explorer",
    title: "The Purpose Explorer",
    description:
      "You know change is needed but your north star is still forming. Exploration and small experiments will unlock clarity.",
    signals: [{ dimension: "purpose", maxScore: 50 }],
  },
  "The Confident Communicator": {
    id: "The Confident Communicator",
    title: "The Confident Communicator",
    description:
      "Communication is your growth edge and your superpower in waiting. With practice, your influence can accelerate every goal.",
    signals: [
      { dimension: "communication", minScore: 55 },
      { dimension: "execution", minScore: 50 },
    ],
  },
  "The Creative Starter": {
    id: "The Creative Starter",
    title: "The Creative Starter",
    description:
      "You have creative ideas and entrepreneurial energy. Your next step is choosing one path and building momentum.",
    signals: [
      { dimension: "execution", minScore: 55 },
      { dimension: "freedom", minScore: 50 },
    ],
  },
  "The Steady Optimiser": {
    id: "The Steady Optimiser",
    title: "The Steady Optimiser",
    description:
      "You value stability and incremental progress. Small, consistent improvements across life areas will compound powerfully.",
    signals: [],
  },
};

export const ARCHETYPE_LIST = Object.values(ARCHETYPES);

import type { DiscoveryModuleId, DiscoveryModuleMeta } from "@/types/discovery";

export const DISCOVERY_MODULES: DiscoveryModuleMeta[] = [
  {
    id: "palm",
    label: "Palm Reading",
    description: "Explore your personality patterns through your palm.",
    href: "/palm-reading",
    defaultWeight: 0.2,
    icon: "Hand",
  },
  {
    id: "face",
    label: "Face Reading",
    description:
      "Reflect on your expression, confidence, and communication style.",
    href: "/face-reading",
    defaultWeight: 0.15,
    icon: "ScanFace",
  },
  {
    id: "numerology",
    label: "Numerology",
    description: "Discover your life path number and yearly theme.",
    href: "/numerology",
    defaultWeight: 0.1,
    icon: "Hash",
  },
  {
    id: "tarot",
    label: "Tarot Reading",
    description: "Use symbolic reflection for current decisions.",
    href: "/tarot",
    defaultWeight: 0.15,
    icon: "Sparkles",
  },
  {
    id: "quiz",
    label: "Personality Quiz",
    description: "Complete the deep personality assessment for your blueprint.",
    href: "/assessment",
    defaultWeight: 0.4,
    icon: "ClipboardList",
  },
];

export const DEFAULT_WEIGHTS: Record<DiscoveryModuleId, number> = {
  quiz: 0.4,
  palm: 0.2,
  face: 0.15,
  numerology: 0.1,
  tarot: 0.15,
};

export function getModuleById(id: DiscoveryModuleId): DiscoveryModuleMeta {
  return DISCOVERY_MODULES.find((m) => m.id === id)!;
}

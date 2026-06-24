"use client";

import { useAtom } from "jotai";
import { assessmentAtom } from "@/store/assessment";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function StepPersonality() {
  const [assessment, setAssessment] = useAtom(assessmentAtom);

  const update = (field: keyof typeof assessment, value: string) => {
    setAssessment({ ...assessment, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Personality & Strengths</h2>
        <p className="mt-1 text-muted-foreground">
          Understanding who you are helps us craft a blueprint that fits.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mbtiType">MBTI Type (if known)</Label>
        <Input
          id="mbtiType"
          placeholder="e.g. INTJ, ENFP, or leave blank"
          value={assessment.mbtiType}
          onChange={(e) => update("mbtiType", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="keyStrengths">Key Strengths</Label>
        <Textarea
          id="keyStrengths"
          placeholder="What are you naturally good at? Leadership, creativity, analysis..."
          value={assessment.keyStrengths}
          onChange={(e) => update("keyStrengths", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="weaknesses">Weaknesses / Challenges</Label>
        <Textarea
          id="weaknesses"
          placeholder="What areas do you struggle with or want to improve?"
          value={assessment.weaknesses}
          onChange={(e) => update("weaknesses", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="communicationStyle">Communication Style</Label>
        <Textarea
          id="communicationStyle"
          placeholder="How do you communicate? Direct, diplomatic, reserved, expressive..."
          value={assessment.communicationStyle}
          onChange={(e) => update("communicationStyle", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}

"use client";

import { useAtom } from "jotai";
import { assessmentAtom } from "@/store/assessment";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export function StepDreamLife() {
  const [assessment, setAssessment] = useAtom(assessmentAtom);

  const update = (field: keyof typeof assessment, value: string) => {
    setAssessment({ ...assessment, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dream Life</h2>
        <p className="mt-1 text-muted-foreground">
          Paint the picture of the life you want to create.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="idealLife">Describe your ideal life in 5–10 years</Label>
        <Textarea
          id="idealLife"
          placeholder="Where do you live? What does a typical day look like? How do you feel?"
          value={assessment.idealLife}
          onChange={(e) => update("idealLife", e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desiredCareer">Desired Career</Label>
        <Input
          id="desiredCareer"
          placeholder="What work would fulfill you?"
          value={assessment.desiredCareer}
          onChange={(e) => update("desiredCareer", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desiredIncome">Desired Income / Lifestyle</Label>
        <Textarea
          id="desiredIncome"
          placeholder="Financial goals, lifestyle aspirations..."
          value={assessment.desiredIncome}
          onChange={(e) => update("desiredIncome", e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sideBusinessIdeas">Side Business Ideas</Label>
        <Textarea
          id="sideBusinessIdeas"
          placeholder="Any business ideas you've been thinking about?"
          value={assessment.sideBusinessIdeas}
          onChange={(e) => update("sideBusinessIdeas", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="earlyRetirementGoal">Early Retirement Goal</Label>
        <Input
          id="earlyRetirementGoal"
          placeholder="e.g. Retire by 50, financial independence by 45..."
          value={assessment.earlyRetirementGoal}
          onChange={(e) => update("earlyRetirementGoal", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="biggestDream">Biggest Dream</Label>
        <Textarea
          id="biggestDream"
          placeholder="If you could achieve one thing, what would it be?"
          value={assessment.biggestDream}
          onChange={(e) => update("biggestDream", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}

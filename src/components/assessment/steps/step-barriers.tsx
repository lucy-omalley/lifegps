"use client";

import { useAtom } from "jotai";
import { assessmentAtom } from "@/store/assessment";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function StepBarriers() {
  const [assessment, setAssessment] = useAtom(assessmentAtom);

  const update = (field: keyof typeof assessment, value: string) => {
    setAssessment({ ...assessment, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Barriers</h2>
        <p className="mt-1 text-muted-foreground">
          What&apos;s standing between you and your dream life?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatIsStopping">What is stopping you?</Label>
        <Textarea
          id="whatIsStopping"
          placeholder="Fear, uncertainty, lack of direction..."
          value={assessment.whatIsStopping}
          onChange={(e) => update("whatIsStopping", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeConstraints">Time Constraints</Label>
        <Textarea
          id="timeConstraints"
          placeholder="Family obligations, long work hours, commute..."
          value={assessment.timeConstraints}
          onChange={(e) => update("timeConstraints", e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confidenceIssues">Confidence Issues</Label>
        <Textarea
          id="confidenceIssues"
          placeholder="Imposter syndrome, fear of failure, self-doubt..."
          value={assessment.confidenceIssues}
          onChange={(e) => update("confidenceIssues", e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skillsGaps">Skills Gaps</Label>
        <Textarea
          id="skillsGaps"
          placeholder="What skills do you need to develop?"
          value={assessment.skillsGaps}
          onChange={(e) => update("skillsGaps", e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="financialPressure">Financial Pressure</Label>
        <Textarea
          id="financialPressure"
          placeholder="Mortgage, dependents, debt, income uncertainty..."
          value={assessment.financialPressure}
          onChange={(e) => update("financialPressure", e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}

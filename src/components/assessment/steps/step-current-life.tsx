"use client";

import { useAtom } from "jotai";
import { assessmentAtom } from "@/store/assessment";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function SliderField({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-medium">
          {value}/10
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-teal-600"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export function StepCurrentLife() {
  const [assessment, setAssessment] = useAtom(assessmentAtom);

  const update = (field: keyof typeof assessment, value: string | number) => {
    setAssessment({ ...assessment, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Current Life</h2>
        <p className="mt-1 text-muted-foreground">
          An honest snapshot of where you are today.
        </p>
      </div>

      <SliderField
        label="Career Satisfaction"
        value={assessment.careerSatisfaction}
        onChange={(v) => update("careerSatisfaction", v)}
        lowLabel="Very unhappy"
        highLabel="Fulfilled"
      />

      <SliderField
        label="Energy / Burnout Level"
        value={assessment.energyBurnout}
        onChange={(v) => update("energyBurnout", v)}
        lowLabel="Exhausted"
        highLabel="Energized"
      />

      <div className="space-y-2">
        <Label htmlFor="financialSituation">Financial Situation</Label>
        <Textarea
          id="financialSituation"
          placeholder="Stable salary, savings goals, debt, financial stress..."
          value={assessment.financialSituation}
          onChange={(e) => update("financialSituation", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="healthLifestyle">Health & Lifestyle</Label>
        <Textarea
          id="healthLifestyle"
          placeholder="Exercise habits, sleep, diet, stress levels..."
          value={assessment.healthLifestyle}
          onChange={(e) => update("healthLifestyle", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workLifeBalance">Work-Life Balance</Label>
        <Textarea
          id="workLifeBalance"
          placeholder="How balanced is your life? What would you change?"
          value={assessment.workLifeBalance}
          onChange={(e) => update("workLifeBalance", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}

"use client";

import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { assessmentAtom, currentStepAtom } from "@/store/assessment";
import { getMockUser, updateMockUserName } from "@/lib/auth";
import { saveAssessment, saveBlueprint } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepAboutYou } from "./steps/step-about-you";
import { StepPersonality } from "./steps/step-personality";
import { StepCurrentLife } from "./steps/step-current-life";
import { StepDreamLife } from "./steps/step-dream-life";
import { StepBarriers } from "./steps/step-barriers";

const STEPS = [
  { title: "About You", component: StepAboutYou },
  { title: "Personality & Strengths", component: StepPersonality },
  { title: "Current Life", component: StepCurrentLife },
  { title: "Dream Life", component: StepDreamLife },
  { title: "Barriers", component: StepBarriers },
];

export function AssessmentForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
  const [assessment] = useAtom(assessmentAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const StepComponent = STEPS[currentStep].component;
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const user = assessment.name
        ? updateMockUserName(assessment.name)
        : getMockUser();

      saveAssessment(assessment);

      const response = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment, userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate blueprint");
      }

      const { blueprint } = await response.json();
      saveBlueprint(blueprint);
      router.push("/blueprint");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-muted-foreground">
            {STEPS[currentStep].title}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
        <StepComponent />
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-destructive">{error}</p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {isLastStep ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Your Blueprint...
              </>
            ) : (
              "Generate My Life Blueprint"
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

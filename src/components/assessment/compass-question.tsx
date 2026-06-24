"use client";

import { cn } from "@/lib/utils";
import { DIMENSION_LABELS } from "@/lib/compass/dimensions";
import type { CompassAnswer, CompassQuestion } from "@/types";
import { Badge } from "@/components/ui/badge";

interface CompassQuestionViewProps {
  question: CompassQuestion;
  questionIndex: number;
  totalQuestions: number;
  currentAnswer?: CompassAnswer;
  onAnswer: (labels: string[], values: (string | number)[]) => void;
}

export function CompassQuestionView({
  question,
  questionIndex,
  totalQuestions,
  currentAnswer,
  onAnswer,
}: CompassQuestionViewProps) {
  const isScale = question.type === "scale1to10";
  const isMulti = question.type === "multiChoice";
  const selectedValues = currentAnswer
    ? isMulti
      ? (currentAnswer.answerValue as string[])
      : isScale
        ? [currentAnswer.answerValue as number]
        : [currentAnswer.answerValue as string]
    : [];

  const handleSingleSelect = (label: string, value: string) => {
    onAnswer([label], [value]);
  };

  const handleMultiToggle = (label: string, value: string) => {
    const current = (selectedValues as string[]) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const labels = next.map(
      (v) => question.options!.find((o) => o.value === v)!.label
    );
    onAnswer(labels, next);
  };

  const handleScaleSelect = (value: number) => {
    onAnswer([String(value)], [value]);
  };

  return (
    <div
      key={question.id}
      className="animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {DIMENSION_LABELS[question.dimension]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>
        <h2 className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
          {question.text}
        </h2>
      </div>

      {isScale ? (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Not at all</span>
            <span>Completely</span>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleScaleSelect(n)}
                className={cn(
                  "flex h-11 items-center justify-center rounded-xl border text-sm font-medium transition-all",
                  selectedValues[0] === n
                    ? "border-teal-500 bg-gradient-to-br from-teal-500 to-indigo-600 text-white shadow-md scale-105"
                    : "border-border/60 bg-background hover:border-teal-500/40 hover:bg-teal-500/5"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          {selectedValues[0] != null && (
            <p className="text-center text-sm text-muted-foreground">
              Selected: {selectedValues[0]} / 10
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {question.options?.map((option) => {
            const isSelected = isMulti
              ? (selectedValues as string[]).includes(option.value)
              : selectedValues[0] === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  isMulti
                    ? handleMultiToggle(option.label, option.value)
                    : handleSingleSelect(option.label, option.value)
                }
                className={cn(
                  "w-full rounded-xl border px-4 py-3.5 text-left text-sm transition-all sm:text-base",
                  isSelected
                    ? "border-teal-500/60 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 shadow-sm ring-1 ring-teal-500/30"
                    : "border-border/60 bg-background hover:border-teal-500/30 hover:bg-teal-500/5"
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-teal-500 bg-teal-500"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

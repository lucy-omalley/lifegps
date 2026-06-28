"use client";

import { cn } from "@/lib/utils";
import type { CompassAnswer, CompassQuestion } from "@/types";
import { Textarea } from "@/components/ui/textarea";

interface CompassQuestionViewProps {
  question: CompassQuestion;
  currentAnswer?: CompassAnswer;
  onAnswer: (labels: string[], values: (string | number)[]) => void;
}

export function CompassQuestionView({
  question,
  currentAnswer,
  onAnswer,
}: CompassQuestionViewProps) {
  const isScale = question.type === "scale1to10";
  const isMulti = question.type === "multiChoice";
  const isOptionalText = question.type === "optionalText";
  const maxSelections = question.maxSelections;

  const selectedValues = currentAnswer
    ? isMulti
      ? (currentAnswer.answerValue as string[])
      : isScale
        ? [currentAnswer.answerValue as number]
        : isOptionalText
          ? [currentAnswer.answerValue as string]
          : [currentAnswer.answerValue as string]
    : [];

  const handleSingleSelect = (label: string, value: string) => {
    onAnswer([label], [value]);
  };

  const handleMultiToggle = (label: string, value: string) => {
    const current = (selectedValues as string[]) ?? [];
    let next: string[];

    if (current.includes(value)) {
      next = current.filter((v) => v !== value);
    } else if (maxSelections && current.length >= maxSelections) {
      next = [...current.slice(1), value];
    } else {
      next = [...current, value];
    }

    const labels = next.map(
      (v) => question.options!.find((o) => o.value === v)!.label
    );
    onAnswer(labels, next);
  };

  const handleScaleSelect = (value: number) => {
    onAnswer([String(value)], [value]);
  };

  const handleOptionalText = (text: string) => {
    onAnswer([text], [text]);
  };

  const multiHint =
    maxSelections === 1
      ? "Choose one"
      : maxSelections
        ? `Choose up to ${maxSelections}`
        : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-medium tracking-wide text-teal-600/80 dark:text-teal-400/80">
          {question.sectionTitle}
        </p>
        <h2 className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
          {question.text}
        </h2>
        {multiHint && (
          <p className="text-sm text-muted-foreground">{multiHint}</p>
        )}
        {isOptionalText && (
          <p className="text-sm text-muted-foreground">
            Optional — skip if you prefer
          </p>
        )}
      </div>

      {isOptionalText ? (
        <Textarea
          placeholder="Share anything that would help LifeGPS understand you better..."
          value={(selectedValues[0] as string) ?? ""}
          onChange={(e) => handleOptionalText(e.target.value)}
          rows={4}
          className="min-h-[120px] resize-none rounded-2xl border-border/60 bg-background/50 text-base"
        />
      ) : isScale ? (
        <div className="space-y-6">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Not clear at all</span>
            <span>Crystal clear</span>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleScaleSelect(n)}
                className={cn(
                  "flex h-12 items-center justify-center rounded-2xl border text-sm font-semibold transition-all duration-200",
                  selectedValues[0] === n
                    ? "scale-105 border-teal-500 bg-gradient-to-br from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/25"
                    : "border-border/60 bg-background hover:border-teal-500/40 hover:bg-teal-500/5 active:scale-95"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          {selectedValues[0] != null && (
            <p className="text-center text-sm font-medium text-teal-700 dark:text-teal-300">
              {selectedValues[0]} / 10
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
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
                  "w-full rounded-2xl border px-5 py-4 text-left text-base transition-all duration-200 active:scale-[0.99]",
                  isSelected
                    ? "border-teal-500/60 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 shadow-md ring-1 ring-teal-500/20"
                    : "border-border/50 bg-background/80 hover:border-teal-500/30 hover:bg-teal-500/5"
                )}
              >
                <span className="flex items-center gap-4">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-teal-500 bg-teal-500"
                        : "border-muted-foreground/25"
                    )}
                  >
                    {isSelected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="leading-snug">{option.label}</span>
                </span>
              </button>
            );
          })}
          {isMulti && maxSelections && (
            <p className="pt-1 text-center text-xs text-muted-foreground">
              {(selectedValues as string[]).length} of {maxSelections} selected
            </p>
          )}
        </div>
      )}
    </div>
  );
}

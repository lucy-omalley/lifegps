"use client";

import { useState } from "react";
import { Loader2, Send, Bot, User } from "lucide-react";
import { ensureAuthenticatedUser } from "@/lib/auth";
import { saveCheckin } from "@/lib/storage";
import type { WeeklyCheckin } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const QUESTIONS = [
  {
    key: "progress" as const,
    label: "What progress did you make this week?",
    placeholder: "Even small wins count — what moved forward?",
  },
  {
    key: "blockers" as const,
    label: "What blocked you?",
    placeholder: "Obstacles, distractions, energy dips...",
  },
  {
    key: "supportNeeded" as const,
    label: "What support do you need?",
    placeholder: "Skills, accountability, clarity, resources...",
  },
  {
    key: "nextPriority" as const,
    label: "What is your next priority?",
    placeholder: "The one thing to focus on this coming week...",
  },
];

export function CoachChat() {
  const [answers, setAnswers] = useState({
    progress: "",
    blockers: "",
    supportNeeded: "",
    nextPriority: "",
  });
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateAnswer = (key: keyof typeof answers, value: string) => {
    setAnswers({ ...answers, [key]: value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitted(true);

    try {
      await ensureAuthenticatedUser();
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      setAiResponse(data.aiResponse);

      const checkin: WeeklyCheckin = {
        id: data.id,
        userId: "",
        ...answers,
        aiResponse: data.aiResponse,
        createdAt: data.createdAt,
      };
      saveCheckin(checkin);
    } catch {
      setAiResponse(
        "I had trouble connecting. Please try again in a moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const allAnswered = Object.values(answers).every((v) => v.trim().length > 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly AI Coach</h1>
        <p className="mt-1 text-muted-foreground">
          Reflect on your week and get supportive, practical guidance.
        </p>
      </div>

      {!submitted ? (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Check-in</CardTitle>
            <CardDescription>
              Answer these four questions honestly — your coach is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {QUESTIONS.map((q) => (
              <div key={q.key} className="space-y-2">
                <Label htmlFor={q.key}>{q.label}</Label>
                <Textarea
                  id={q.key}
                  placeholder={q.placeholder}
                  value={answers[q.key]}
                  onChange={(e) => updateAnswer(q.key, e.target.value)}
                  rows={3}
                />
              </div>
            ))}
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Your coach is thinking...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Get Coaching
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Check-in</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {QUESTIONS.map((q) => (
                <div key={q.key} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{q.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {answers[q.key]}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-indigo-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg">LifeGPS Coach</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Crafting your coaching response...
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {aiResponse}
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setAiResponse(null);
              setAnswers({
                progress: "",
                blockers: "",
                supportNeeded: "",
                nextPriority: "",
              });
            }}
            className="w-full"
          >
            New Check-in
          </Button>
        </div>
      )}
    </div>
  );
}

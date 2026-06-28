"use client";

import { useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { getFounderHeaders } from "@/components/founder/founder-gate";
import type { FounderChatMessage, FounderWeeklyPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STARTER_QUESTIONS = [
  "What should I improve next?",
  "Which blueprint sections are weak?",
  "What are users asking for?",
  "Is the product ready for paid beta?",
  "What user segment seems strongest?",
];

export function FounderChat({ email }: { email: string }) {
  const [messages, setMessages] = useState<FounderChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: FounderChatMessage = { role: "user", content: text };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/founder-agent/chat", {
        method: "POST",
        headers: getFounderHeaders(email),
        body: JSON.stringify({ message: text, history: messages }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const { response } = await res.json();
      setMessages([
        ...nextHistory,
        { role: "assistant", content: response },
      ]);
    } catch {
      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: "Sorry, I couldn't respond. Check ADMIN_EMAIL and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">LifeGPS Founder Agent</CardTitle>
            <CardDescription>
              Evidence-based startup advice from product data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {STARTER_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              className="rounded-full border border-border/60 px-3 py-1 text-xs hover:bg-muted"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="max-h-80 min-h-[200px] space-y-3 overflow-y-auto rounded-xl border border-border/40 bg-muted/20 p-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ask about improvements, weak sections, user segments, pricing, or
              what to build this week.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm ${m.role === "user" ? "font-medium" : "text-muted-foreground whitespace-pre-wrap"}`}
            >
              {m.role === "user" ? `You: ${m.content}` : m.content}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analysing product data...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder="Ask the Founder Agent..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="shrink-0 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyFounderPlan({ email }: { email: string }) {
  const [plan, setPlan] = useState<FounderWeeklyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/founder-agent/weekly-plan", {
        method: "POST",
        headers: getFounderHeaders(email),
      });
      if (!res.ok) throw new Error("Failed");
      const { plan: data } = await res.json();
      setPlan(data);
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-indigo-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Weekly Founder Plan
        </CardTitle>
        <CardDescription>
          AI-generated priorities for product, marketing, and validation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generate} disabled={loading} variant="outline">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Weekly Founder Plan"
          )}
        </Button>

        {plan && (
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <PlanList title="Top 3 product improvements" items={plan.productImprovements} />
            <PlanList title="Top 3 marketing actions" items={plan.marketingActions} />
            <PlanList title="Top 3 user interview questions" items={plan.userInterviewQuestions} />
            <div className="space-y-2">
              <p className="font-medium">Pricing experiment</p>
              <p className="text-muted-foreground">{plan.pricingExperiment}</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Retention experiment</p>
              <p className="text-muted-foreground">{plan.retentionExperiment}</p>
            </div>
            <div className="space-y-2 sm:col-span-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="font-medium">Do NOT build yet</p>
              <p className="text-muted-foreground">{plan.doNotBuildYet}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 font-medium">{title}</p>
      <ol className="list-decimal space-y-1 pl-4 text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    </div>
  );
}

import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Start your journey with a basic life assessment.",
    features: [
      "Life assessment questionnaire",
      "Personality & strengths analysis",
      "Basic dream life summary",
    ],
    cta: "Start Free Assessment",
    href: "/assessment",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "€9",
    period: "/month",
    description: "Full AI blueprint and ongoing coaching support.",
    features: [
      "Everything in Free",
      "AI-generated Life Blueprint",
      "5-year roadmap & 90-day plan",
      "Weekly AI Coach sessions",
      "Habit & progress tracker",
      "Priority support",
    ],
    cta: "Create My Life Blueprint",
    href: "/assessment",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-muted/30 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you&apos;re ready for your full blueprint.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? "relative border-teal-500/50 shadow-lg shadow-teal-500/10"
                  : "border-border/50"
              }
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <ButtonLink
                  href={plan.href}
                  className={
                    plan.highlighted
                      ? "w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700"
                      : "w-full"
                  }
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </ButtonLink>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* TODO: Integrate Stripe for Premium subscriptions */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Premium billing coming soon. MVP includes full blueprint generation.
        </p>
      </div>
    </section>
  );
}

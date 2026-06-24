import {
  Brain,
  MapPinned,
  Briefcase,
  MessageCircle,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "LifeGPS Compass™ Assessment",
    description:
      "An interactive 8-minute personality-style questionnaire across 8 life dimensions.",
  },
  {
    icon: MapPinned,
    title: "AI Life Blueprint",
    description:
      "Get a personalized roadmap from your current state to your dream life.",
  },
  {
    icon: Briefcase,
    title: "Career & Side Business Roadmap",
    description:
      "Practical steps for career transitions and building income on the side.",
  },
  {
    icon: MessageCircle,
    title: "Weekly AI Coach",
    description:
      "Supportive coaching to keep you accountable and moving forward.",
  },
  {
    icon: Target,
    title: "Habit & Progress Tracker",
    description:
      "Daily habits and weekly priorities to build momentum over time.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to design your life
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From assessment to action — LifeGPS guides every step.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 bg-card/50 backdrop-blur-sm transition-shadow hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/10 to-indigo-500/10">
                  <feature.icon className="h-5 w-5 text-teal-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

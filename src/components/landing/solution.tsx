import { Map } from "lucide-react";

export function Solution() {
  return (
    <section className="bg-muted/30 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20">
          <Map className="h-7 w-7 text-teal-600" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          LifeGPS turns your personality, experience, interests, current life,
          and dream future into a practical life blueprint.
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Our AI Life Architect analyzes who you are today and where you want to
          go — then creates a personalized roadmap with actionable steps for
          the next 90 days, 12 months, and 5 years.
        </p>
      </div>
    </section>
  );
}

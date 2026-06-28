import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JourneyCards } from "@/components/journey/journey-cards";
import { DiscoveryProgress } from "@/components/journey/discovery-progress";
import { ButtonLink } from "@/components/ui/button-link";

export default function JourneyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Choose Your Self-Discovery Journey
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Complete one or more modules. Each offers a unique lens for
              self-reflection — then combine them into your unified LifeGPS
              Blueprint.
            </p>
          </div>

          <DiscoveryProgress />
          <JourneyCards />

          <div className="text-center">
            <ButtonLink
              href="/profile"
              className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
            >
              View My Self-Discovery Profile
            </ButtonLink>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

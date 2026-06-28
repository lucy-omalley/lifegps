import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FounderAgentView } from "@/components/founder/founder-agent-view";

export const metadata = {
  title: "Founder Agent | LifeGPS",
  description: "Internal founder dashboard for LifeGPS product validation.",
  robots: { index: false, follow: false },
};

export default function FounderAgentPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <FounderAgentView />
        </div>
      </main>
      <Footer />
    </>
  );
}

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AssessmentProvider } from "@/components/assessment/assessment-provider";

export const metadata = {
  title: "LifeGPS Compass™ Assessment | LifeGPS",
  description:
    "Complete the interactive LifeGPS Compass assessment in 8 minutes to discover your archetype and personalised Life Blueprint.",
};

export default function AssessmentPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gradient-to-b from-teal-500/5 via-background to-indigo-500/5 px-4 py-12 sm:px-6">
        <AssessmentProvider />
      </main>
      <Footer />
    </>
  );
}

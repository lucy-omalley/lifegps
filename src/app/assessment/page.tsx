import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AssessmentProvider } from "@/components/assessment/assessment-provider";

export const metadata = {
  title: "Life Assessment | LifeGPS",
  description: "Complete your life assessment to generate your AI Life Blueprint.",
};

export default function AssessmentPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <AssessmentProvider />
      </main>
      <Footer />
    </>
  );
}

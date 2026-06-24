import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CoachChat } from "@/components/coach/coach-chat";

export const metadata = {
  title: "Weekly Coach | LifeGPS",
  description: "Get supportive AI coaching for your weekly progress check-in.",
};

export default function CoachPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <CoachChat />
      </main>
      <Footer />
    </>
  );
}

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata = {
  title: "Dashboard | LifeGPS",
  description: "Track your progress toward your dream life.",
};

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <DashboardView />
        </div>
      </main>
      <Footer />
    </>
  );
}

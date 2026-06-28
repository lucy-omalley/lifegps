import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UnifiedProfileView } from "@/components/profile/unified-profile-display";

export default function ProfilePage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <UnifiedProfileView />
        </div>
      </main>
      <Footer />
    </>
  );
}

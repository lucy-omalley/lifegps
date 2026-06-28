import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PalmReadingForm } from "@/components/palm/palm-reading-form";

export default function PalmReadingPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Palm Reading</h1>
            <p className="mt-2 text-muted-foreground">
              Upload photos of your palms for a symbolic personality reflection.
              Use clear, well-lit images for best results.
            </p>
          </div>
          <PalmReadingForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

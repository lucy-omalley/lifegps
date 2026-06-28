import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TarotReadingForm } from "@/components/tarot/tarot-reading-form";

export default function TarotPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Tarot Reading</h1>
            <p className="mt-2 text-muted-foreground">
              Ask a question and draw cards for symbolic reflection — focused on
              clarity and next steps, not fixed predictions.
            </p>
          </div>
          <TarotReadingForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

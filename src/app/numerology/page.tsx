import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NumerologyForm } from "@/components/numerology/numerology-form";

export default function NumerologyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Numerology</h1>
            <p className="mt-2 text-muted-foreground">
              Discover your life path number, personal year theme, and symbolic
              reflections based on your birth date.
            </p>
          </div>
          <NumerologyForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FaceReadingForm } from "@/components/face/face-reading-form";

export default function FaceReadingPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Face Reading</h1>
            <p className="mt-2 text-muted-foreground">
              Upload a clear front-facing photo for a reflective reading on
              expression, confidence, and communication style.
            </p>
          </div>
          <FaceReadingForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

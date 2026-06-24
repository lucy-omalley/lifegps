import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Solution } from "@/components/landing/solution";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}

import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { Steps } from "@/components/marketing/Steps";
import { Features } from "@/components/marketing/Features";
import { Cases } from "@/components/marketing/Cases";
import { Pricing } from "@/components/marketing/Pricing";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      <Steps />
      <Features />
      <Cases />
      <Pricing />
      <Footer />
    </main>
  );
}

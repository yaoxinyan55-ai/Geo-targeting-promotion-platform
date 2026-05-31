import "./marketing.css";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { Steps } from "@/components/marketing/Steps";
import { Features } from "@/components/marketing/Features";
import { Cases } from "@/components/marketing/Cases";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <main className="mk-page">
      <Header />
      <Hero />
      <Steps />
      <Features />
      <Cases />
      <Footer />
    </main>
  );
}

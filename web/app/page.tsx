import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TwoSystems } from "@/components/landing/two-systems";
import { StatsBar } from "@/components/landing/stats-bar";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { TechStackSection } from "@/components/landing/tech-stack-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[var(--bg-base)]">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <TwoSystems />
      <StatsBar />
      <FeaturesGrid />
      <TechStackSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}

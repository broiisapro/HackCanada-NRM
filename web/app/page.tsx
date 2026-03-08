import { SparklesCore } from "@/components/ui/sparkles";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsBar } from "@/components/landing/stats-bar";
import { StorySection } from "@/components/landing/story-section";
import { Flame, Users, Cpu, Heart } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen w-full relative bg-background flex flex-col items-center overflow-x-hidden">
      {/* Background Particles & Gradient */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <AnimatedGradientBackground />
        <div className="absolute inset-0 z-10 w-full h-full">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#f59e0b"
            speed={0.5}
          />
        </div>
      </div>

      {/* Header — logo + theme only, no nav */}
      <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tighter">
          <Flame className="w-8 h-8 text-primary" />
          Pyros
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Stats */}
      <StatsBar />

      {/* Story Sections — varied layouts */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16 flex flex-col gap-24 md:gap-32">
        <StorySection
          variant="default"
          title="Who We Are"
          text="We are a team of student innovators driven by a passion to protect our environment. With backgrounds in AI, hardware, and software engineering, we built Pyros to tackle one of the planet's most critical challenges: preventing catastrophic forest fires."
          icon={<Users className="w-8 h-8" />}
        />
        <StorySection
          variant="split"
          title="What The Project Is"
          text="Pyros utilizes spectral lens technology combined with TensorFlow machine learning models. We capture imagery to classify flammable gas spectra. This data is processed to generate a predictive heat-map worldview, identifying high-risk areas for forest fire outbreaks before they happen."
          icon={<Cpu className="w-8 h-8" />}
        />
        <StorySection
          variant="quote"
          title="Why We Built It"
          text="Climate change is significantly increasing the frequency and intensity of wildfires globally. Early detection is our best defense. We built Pyros because we believe advanced autonomous technology can provide the crucial early warnings needed to save lives, protect wildlife, and preserve our forests."
          icon={<Heart className="w-6 h-6" />}
        />
      </section>

      {/* Final CTA */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24 flex flex-col items-center">
        <a
          href="/upload"
          className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-8 py-4 text-lg font-semibold text-primary hover:bg-primary/20 hover:border-primary/70 transition-colors press-active"
        >
          <Flame className="w-5 h-5" />
          Go to Dashboard
        </a>
      </section>

      <div className="h-[40vh] w-full relative z-10" />
    </main>
  );
}

import { SparklesCore } from "@/components/ui/sparkles";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Flame } from "lucide-react";

export default async function Home() {
  await new Promise((resolve) => setTimeout(resolve, 800));
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

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tighter">
          <Flame className="w-8 h-8 text-primary" />
          Pyros
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] w-full px-4 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground mb-6 drop-shadow-sm text-balance leading-tight">
          Welcome to Pyros
        </h1>
        <p className="text-muted-foreground text-lg md:text-2xl max-w-2xl mb-12">
          Advanced forest fire detection through spectral imaging and heat mapping.
        </p>
        
        <Link href="/dashboard" className="mt-8">
          <ShimmerButton className="text-xl shadow-2xl" background="rgba(159, 18, 57, 1)">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg z-10">
              Go to Dashboard
            </span>
          </ShimmerButton>
        </Link>
      </section>

      {/* Content Sections using TextGradientScroll */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-32 flex flex-col gap-32 md:gap-[40vh]">
        
        {/* Section 1: Who we are */}
        <div className="relative min-h-[30vh] flex flex-col justify-center rounded-2xl border border-border/50 bg-background/50 p-8 md:p-12 backdrop-blur-sm">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
          <h2 className="relative z-10 text-primary text-2xl font-bold mb-4 uppercase tracking-widest">Who We Are</h2>
          <div className="relative z-10 text-3xl md:text-5xl font-medium leading-tight text-foreground">
            <TextGradientScroll 
              text="We are a team of student innovators driven by a passion to protect our environment. With backgrounds in AI, hardware, and software engineering, we built Pyros to tackle one of the planet's most critical challenges: preventing catastrophic forest fires."
            />
          </div>
        </div>

        {/* Section 2: What the project is */}
        <div className="relative min-h-[30vh] flex flex-col justify-center rounded-2xl border border-border/50 bg-background/50 p-8 md:p-12 backdrop-blur-sm">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
          <h2 className="relative z-10 text-primary text-2xl font-bold mb-4 uppercase tracking-widest">What The Project Is</h2>
          <div className="relative z-10 text-3xl md:text-5xl font-medium leading-tight text-foreground">
            <TextGradientScroll 
              text="Pyros utilizes spectral lens technology combined with TensorFlow machine learning models. We capture imagery to classify flammable gas spectra. This data is processed to generate a predictive heat-map worldview, identifying high-risk areas for forest fire outbreaks before they happen."
            />
          </div>
        </div>

        {/* Section 3: Why we built it */}
        <div className="relative min-h-[30vh] flex flex-col justify-center rounded-2xl border border-border/50 bg-background/50 p-8 md:p-12 backdrop-blur-sm">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
          <h2 className="relative z-10 text-primary text-2xl font-bold mb-4 uppercase tracking-widest">Why We Built It</h2>
          <div className="relative z-10 text-3xl md:text-5xl font-medium leading-tight text-foreground">
            <TextGradientScroll 
              text="Climate change is significantly increasing the frequency and intensity of wildfires globally. Early detection is our best defense. We built Pyros because we believe advanced autonomous technology can provide the crucial early warnings needed to save lives, protect wildlife, and preserve our forests."
            />
          </div>
        </div>
      </section>

      {/* Footer Buffer */}
      <div className="h-[80vh] w-full relative z-10" />
    </main>
  );
}

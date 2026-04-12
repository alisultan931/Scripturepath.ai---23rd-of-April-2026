import Component from "@/components/ui/particle-effect-for-hero";
import TheologicalIntegritySection from "@/components/ui/theological-integrity-section";
import HowItWorksSection from "@/components/ui/how-it-works-section";
import SparklesSection from "@/components/ui/sparkles-section";
import { Pricing } from "@/components/ui/pricing-cards";
import Footer from "@/components/ui/footer";
import CTA from "@/components/ui/tidal-cursor";
export default function DemoOne() {
  return (
    <main className="bg-black">
      <Component />
      <TheologicalIntegritySection />
      <SparklesSection />
      <HowItWorksSection />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
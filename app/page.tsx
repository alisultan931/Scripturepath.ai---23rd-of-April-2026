import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Component from "@/components/ui/particle-effect-for-hero";
import TheologicalIntegritySection from "@/components/ui/theological-integrity-section";
import HowItWorksSection from "@/components/ui/how-it-works-section";
import SparklesSection from "@/components/ui/what's-inside-every-study";
import { Pricing } from "@/components/ui/pricing-cards";
import Footer from "@/components/ui/footer";
import CTA from "@/components/ui/cta";
export default async function DemoOne() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/chat");
  return (
    <main className="bg-black">
      <Component />
      <TheologicalIntegritySection />
      <SparklesSection />
      <HowItWorksSection />
      <div id="pricing"><Pricing /></div>
      <CTA />
      <Footer />
    </main>
  );
}
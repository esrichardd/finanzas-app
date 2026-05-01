import { LandingFeatures } from "@/features/landing/components/LandingFeatures";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { LandingHero } from "@/features/landing/components/LandingHero";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHero />
      <LandingFeatures />
      <LandingFooter />
    </div>
  );
}

import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import SubscriptionSection from "@/components/subscription-section"
import FeaturesSection from "@/components/features-section"
import TestimonialsSection from "@/components/testimonials-section"
import PartnersSection from "@/components/partners-section"
import SecuritySection from "@/components/security-section"
import FinalCta from "@/components/final-cta"
import CookieConsent from "@/components/cookie-consent"
import BenefitsSection from "@/components/benefits-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <BenefitsSection />
      <AboutSection />
      <SubscriptionSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PartnersSection />
      <SecuritySection />
      <FinalCta />
      <CookieConsent />
    </main>
  )
}

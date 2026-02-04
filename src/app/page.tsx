import AgentPromotion from "@/components/agent-promotion";
import HeroSearch from "@/components/hero-search";
import HighlightedListings from "@/components/highlighted-listings";
import HowItWorks from "@/components/how-it-works";
import LocationSpotlight from "@/components/location-spotlight";
import MarketInsights from "@/components/market-insights";
import NewlyAddedListings from "@/components/newly-added-listings";
import Testimonials from "@/components/testimonials";
import TrustIndicators from "@/components/trust-indicators";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <HeroSearch />
      
      <ScrollReveal delay={200}>
        <TrustIndicators />
      </ScrollReveal>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-foreground">Featured Properties</h2>
              <Link
                href="/search"
                className="text-primary hover:text-primary/80 font-semibold flex items-center gap-1"
              >
                View All <span className="text-xl">→</span>
              </Link>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
            <HighlightedListings />
          </ScrollReveal>
        </div>
      </section>

      <ScrollReveal delay={200}>
        <HowItWorks />
      </ScrollReveal>

      <ScrollReveal>
        <LocationSpotlight />
      </ScrollReveal>

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-foreground">Newly Added</h2>
              <Link
                href="/search?sort=newest"
                className="text-primary hover:text-primary/80 font-semibold flex items-center gap-1"
              >
                View All <span className="text-xl">→</span>
              </Link>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
            <NewlyAddedListings />
          </ScrollReveal>
        </div>
      </section>

      <ScrollReveal>
        <AgentPromotion />
      </ScrollReveal>

      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>

      <ScrollReveal>
        <MarketInsights />
      </ScrollReveal>
    </>
  );
}

import AgentPromotion from "@/components/agent-promotion";
import HeroSearch from "@/components/hero-search";
import HighlightedListings from "@/components/highlighted-listings";
import HowItWorks from "@/components/how-it-works";
import LocationSpotlight from "@/components/location-spotlight";
import MarketInsights from "@/components/market-insights";
import NewlyAddedListings from "@/components/newly-added-listings";
import Testimonials from "@/components/testimonials";
import TrustIndicators from "@/components/trust-indicators";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <HeroSearch />
      
      <div className="animate-slideUp [animation-delay:200ms]">
        <TrustIndicators />
      </div>

      <section className="py-16 animate-slideUp [animation-delay:400ms]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Properties</h2>
            <Link
              href="/search"
              className="text-primary hover:text-primary/80 font-semibold"
            >
              View All →
            </Link>
          </div>
          <HighlightedListings />
        </div>
      </section>

      <div className="animate-slideUp [animation-delay:600ms]">
        <HowItWorks />
      </div>

      <div className="animate-slideUp">
        <LocationSpotlight />
      </div>

      <section className="py-16 bg-secondary animate-slideUp">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Newly Added</h2>
            <Link
              href="/search?sort=newest"
              className="text-primary hover:text-primary/80 font-semibold"
            >
              View All →
            </Link>
          </div>
          <NewlyAddedListings />
        </div>
      </section>

      <div className="animate-slideUp">
        <AgentPromotion />
      </div>

      <div className="animate-slideUp">
        <Testimonials />
      </div>

      <div className="animate-slideUp">
        <MarketInsights />
      </div>
    </>
  );
}

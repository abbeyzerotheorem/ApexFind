import AgentPromotion from "@/components/agent-promotion";
import Header from "@/components/layout/header";
import HeroSearch from "@/components/hero-search";
import HighlightedListings from "@/components/highlighted-listings";
import HowItWorks from "@/components/how-it-works";
import MarketInsights from "@/components/market-insights";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSearch />

        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Tools for your search, and more
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                We're more than just a search engine. We provide the tools and
                expertise to help you find a home you'll love.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="outline" className="text-base">
                  Get Pre-Approved
                </Button>
                <Button size="lg" variant="outline" className="text-base">
                  See Your Home's Value
                </Button>
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 text-base"
                >
                  Find a Local Agent
                </Button>
              </div>
            </div>
          </div>
        </section>

        <HighlightedListings />
        <MarketInsights />
        <HowItWorks />
        <AgentPromotion />
      </main>
      <Footer />
    </div>
  );
}

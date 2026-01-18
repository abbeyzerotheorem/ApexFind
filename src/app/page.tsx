import HeroSearch from "@/components/hero-search";
import HighlightedListings from "@/components/highlighted-listings";
import HowItWorks from "@/components/how-it-works";
import NewlyAddedListings from "@/components/newly-added-listings";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <HeroSearch />

      <section className="py-16">
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

      <section className="py-16 bg-secondary">
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

      <HowItWorks />
    </>
  );
}

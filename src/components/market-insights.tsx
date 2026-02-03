import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MarketInsights() {
  const mapImage = PlaceHolderImages.find((img) => img.id === "market-map");
  return (
    <section className="bg-background py-16 sm:py-20 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary/10 p-8 sm:p-12 lg:p-16">
          <div className="relative z-10 grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="font-semibold text-4xl tracking-tight text-foreground sm:text-5xl leading-tight">
                Explore markets across Nigeria
              </h2>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                From bustling commercial centers in Lagos to serene residential estates in Abuja, dive
                into local market trends and neighborhood insights to find your perfect fit.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-14 px-8" asChild>
                    <Link href="/insights">
                        Explore Market Data <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                <Button variant="outline" size="lg" className="bg-white/50 backdrop-blur-sm border-primary/20 h-14 px-8" asChild>
                    <Link href="/search">Browse Latest Listings</Link>
                </Button>
              </div>
            </div>
            {mapImage && (
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                    <Image
                    src={mapImage.imageUrl}
                    alt="Nigerian real estate market visualization"
                    data-ai-hint="data visualization"
                    fill
                    className="object-cover"
                    />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

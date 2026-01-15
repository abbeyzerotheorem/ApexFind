import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";

export default function MarketInsights() {
  const mapImage = PlaceHolderImages.find((img) => img.id === "market-map");
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-lg bg-primary/10 p-8 sm:p-12">
          <div className="relative z-10 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-semibold text-4xl tracking-tight text-foreground sm:text-5xl">
                Explore markets across the country
              </h2>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                From bustling city centers to quiet suburban neighborhoods, dive
                into local market trends, school ratings, and lifestyle insights
                to find the perfect community for you.
              </p>
              <Button size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                Start Exploring <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            {mapImage && (
              <div className="flex items-center justify-center">
                <Image
                  src={mapImage.imageUrl}
                  alt={mapImage.description}
                  data-ai-hint={mapImage.imageHint}
                  width={600}
                  height={400}
                  className="rounded-lg object-cover shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

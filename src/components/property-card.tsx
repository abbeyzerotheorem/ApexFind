"use client";

import Image from "next/image";
import { useState } from "react";
import { Bath, BedDouble, Heart, Maximize } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Property = {
  id: number;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl: string;
  imageHint: string;
};

export function PropertyCard({ property }: { property: Property }) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="relative">
        <Image
          src={property.imageUrl}
          alt={`Image of ${property.address}`}
          data-ai-hint={property.imageHint}
          width={600}
          height={400}
          className="aspect-[3/2] w-full object-cover"
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute right-3 top-3 rounded-full bg-white/80 hover:bg-white"
          onClick={() => setIsSaved(!isSaved)}
          aria-label={isSaved ? "Unsave property" : "Save property"}
        >
          <Heart
            className={cn(
              "h-5 w-5 text-primary transition-all",
              isSaved && "fill-primary"
            )}
          />
        </Button>
      </div>
      <CardContent className="p-4">
        <div>
          <p className="font-headline text-2xl font-bold">
            ${property.price.toLocaleString()}
          </p>
          <p className="mt-1 text-muted-foreground">{property.address}</p>
        </div>
        <div className="mt-4 flex items-center space-x-4 border-t pt-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            <span>{property.beds}</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-5 w-5" />
            <span>{property.baths}</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="h-5 w-5" />
            <span>{property.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

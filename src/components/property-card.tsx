"use client";

import Image from "next/image";
import { useState } from "react";
import { Bath, BedDouble, Heart, Maximize, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

type Property = {
  id: number;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl: string;
  imageHint: string;
  lotSize?: number;
  agent?: string;
  status?: string;
};

type ViewMode = "list" | "map" | "gallery";

export function PropertyCard({ property, viewMode = 'list' }: { property: Property, viewMode?: ViewMode }) {
  const [isSaved, setIsSaved] = useState(false);
  const isGallery = viewMode === 'gallery';

  return (
    <Card className={cn(
        "overflow-hidden transition-shadow duration-300 hover:shadow-xl",
        isGallery && "flex flex-col sm:flex-row"
      )}>
      <div className={cn("relative", isGallery && "sm:w-1/2")}>
        <Image
          src={property.imageUrl}
          alt={`Image of ${property.address}`}
          data-ai-hint={property.imageHint}
          width={isGallery ? 800 : 600}
          height={isGallery ? 600 : 400}
          className={cn(
            "w-full object-cover",
            isGallery ? "aspect-[4/3]" : "aspect-[3/2]"
          )}
        />
        <div className="absolute right-3 top-3 flex gap-2">
            <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
            aria-label="Share property"
            >
            <Share2
                className="h-4 w-4 text-primary"
            />
            </Button>
            <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                onClick={() => setIsSaved(!isSaved)}
                aria-label={isSaved ? "Unsave property" : "Save property"}
            >
                <Heart
                    className={cn(
                    "h-4 w-4 text-primary transition-all",
                    isSaved && "fill-primary"
                    )}
                />
            </Button>
        </div>
         {property.status && <Badge variant="secondary" className="absolute left-3 top-3">{property.status}</Badge>}
      </div>
      <CardContent className={cn("p-4", isGallery && "sm:w-1/2 flex flex-col justify-center")}>
        <div>
          <p className="font-headline text-2xl font-bold">
            ₦{property.price.toLocaleString()}
          </p>
          <p className="mt-1 text-muted-foreground">{property.address}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            <span>{property.beds} beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-5 w-5" />
            <span>{property.baths} baths</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="h-5 w-5" />
            <span>{property.sqft.toLocaleString()} sqft</span>
          </div>
          {property.lotSize && <div className="flex items-center gap-2">
             <Maximize className="h-5 w-5" />
            <span>{(property.lotSize)} acre lot</span>
          </div>}
        </div>
        {property.agent && <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">
            Listed by: {property.agent}
        </div>}
      </CardContent>
    </Card>
  );
}

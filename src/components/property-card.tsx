
"use client";

import Image from "next/image";
import { useState } from "react";
import Link from 'next/link';
import { Bath, BedDouble, Heart, Maximize, Share2, CheckSquare } from "lucide-react";

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
        "overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col",
        isGallery && "sm:flex-row"
      )}>
        <div className={cn("relative", isGallery && "sm:w-1/2")}>
            <Link href={`/property/${property.id}`}>
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
            </Link>
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
            {property.status && <Badge variant="secondary" className="absolute left-3 top-3 font-medium">{property.status}</Badge>}
        </div>
      <CardContent className={cn("p-4 flex-grow flex flex-col", isGallery && "sm:w-1/2 justify-center")}>
        <div className="flex-grow">
          <p className="text-2xl font-bold text-primary">
            ₦{property.price.toLocaleString()}
          </p>
          <Link href={`/property/${property.id}`} className="block">
            <p className="mt-1 font-semibold text-foreground hover:text-primary">{property.address}</p>
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            <span><span className="font-medium text-foreground">{property.beds}</span> beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-5 w-5" />
            <span><span className="font-medium text-foreground">{property.baths}</span> baths</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="h-5 w-5" />
            <span><span className="font-medium text-foreground">{property.sqft.toLocaleString()}</span> sqft</span>
          </div>
          {property.lotSize && <div className="flex items-center gap-2">
             <Maximize className="h-5 w-5" />
            <span><span className="font-medium text-foreground">{(property.lotSize)}</span> acre lot</span>
          </div>}
        </div>
        {property.agent && <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">
            Listed by: <span className="font-medium text-foreground">{property.agent}</span>
        </div>}
      </CardContent>
    </Card>
  );
}

'use client';
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { List, Map, GalleryThumbnails } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { PropertyCard } from "@/components/property-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";


const properties = [
    {
      id: 1,
      price: 150000000,
      address: "123 Banana Island, Lagos",
      beds: 4,
      baths: 5,
      sqft: 3500,
      lotSize: 0.25,
      agent: "Apex Realty",
      status: "New",
      imageUrl: PlaceHolderImages.find((img) => img.id === "property-1")?.imageUrl ?? "",
      imageHint: PlaceHolderImages.find((img) => img.id === "property-1")?.imageHint ?? "",
    },
    {
      id: 2,
      price: 250000000,
      address: "456 Asokoro, Abuja",
      beds: 5,
      baths: 6,
      sqft: 4200,
      lotSize: 0.5,
      agent: "Urban Dwellings",
      status: "Price Reduced",
      imageUrl: PlaceHolderImages.find((img) => img.id === "property-2")?.imageUrl ?? "",
      imageHint: PlaceHolderImages.find((img) => img.id === "property-2")?.imageHint ?? "",
    },
    {
      id: 3,
      price: 85000000,
      address: "789 GRA, Port Harcourt",
      beds: 3,
      baths: 3,
      sqft: 2800,
      lotSize: 0.3,
      agent: "Heartland Homes",
      status: "Coming Soon",
      imageUrl: PlaceHolderImages.find((img) => img.id === "property-3")?.imageUrl ?? "",
      imageHint: PlaceHolderImages.find((img) => img.id === "property-3")?.imageHint ?? "",
    },
    {
        id: 4,
        price: 180000000,
        address: "101 Maitama, Abuja",
        beds: 4,
        baths: 4,
        sqft: 3800,
        lotSize: 0.4,
        agent: "Wayne Enterprises Realty",
        status: "New",
        imageUrl:
          PlaceHolderImages.find((img) => img.id === "property-4")?.imageUrl ?? "",
        imageHint:
          PlaceHolderImages.find((img) => img.id === "property-4")?.imageHint ?? "",
    },
    {
        id: 5,
        price: 320000000,
        address: "212 Lekki Phase 1, Lagos",
        beds: 6,
        baths: 7,
        sqft: 5500,
        lotSize: 1.2,
        agent: "Queen Consolidated Properties",
        status: "Foreclosure",
        imageUrl:
          PlaceHolderImages.find((img) => img.id === "property-5")?.imageUrl ?? "",
        imageHint:
          PlaceHolderImages.find((img) => img.id === "property-5")?.imageHint ?? "",
    },
    {
        id: 6,
        price: 75000000,
        address: "333 Bodija, Ibadan",
        beds: 3,
        baths: 4,
        sqft: 2500,
        lotSize: 0.2,
        agent: "STAR Labs Real Estate",
        status: "New",
        imageUrl:
          PlaceHolderImages.find((img) => img.id === "property-6")?.imageUrl ?? "",
        imageHint:
          PlaceHolderImages.find((img) => img.id === "property-6")?.imageHint ?? "",
      },
  ];

type ViewMode = "list" | "map" | "gallery";

export default function SearchResults() {
    const [viewMode, setViewMode] = useState<ViewMode>("map");

    const mapImage = PlaceHolderImages.find((img) => img.id === "market-map");
    
    return (
        <div className="flex-grow">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 pb-8">
                <div className="flex items-center justify-between py-4">
                    <p className="text-sm text-muted-foreground">
                        1-30 of 1,000+ homes
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant={viewMode === 'list' ? 'secondary': 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                            <List className="h-5 w-5" />
                            <span className="sr-only">List View</span>
                        </Button>
                        <Button variant={viewMode === 'map' ? 'secondary': 'ghost'} size="icon" onClick={() => setViewMode('map')}>
                            <Map className="h-5 w-5" />
                            <span className="sr-only">Map View</span>
                        </Button>
                        <Button variant={viewMode === 'gallery' ? 'secondary': 'ghost'} size="icon" onClick={() => setViewMode('gallery')}>
                            <GalleryThumbnails className="h-5 w-5" />
                            <span className="sr-only">Gallery View</span>
                        </Button>
                    </div>
                </div>

                <div className={cn("grid", viewMode === 'map' && 'grid-cols-1 lg:grid-cols-2 gap-8')}>
                    <div className={cn(viewMode === 'map' && 'max-h-[calc(100vh-250px)]')}>
                        <ScrollArea className={cn(viewMode === 'map' && "h-full")}>
                            <div className={cn(
                                "grid gap-6",
                                viewMode === 'list' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                                viewMode === 'map' && "grid-cols-1",
                                viewMode === 'gallery' && "grid-cols-1 md:grid-cols-2"
                            )}>
                                {properties.map((property) => (
                                    <PropertyCard key={property.id} property={property} viewMode={viewMode}/>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    {viewMode === 'map' && mapImage && (
                        <div className="relative hidden lg:block rounded-lg overflow-hidden max-h-[calc(100vh-250px)]">
                            <Image
                                src={mapImage.imageUrl}
                                alt={mapImage.description}
                                data-ai-hint={mapImage.imageHint}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <Button size="lg" variant="outline">
                        Load More
                    </Button>
                </div>
            </div>
        </div>
    );
}

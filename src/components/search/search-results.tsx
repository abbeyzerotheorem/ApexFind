'use client';
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { List, Map, GalleryThumbnails } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { PropertyCard } from "@/components/property-card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    lotSize?: number;
    agent?: string;
    status?: string;
};

type ViewMode = "list" | "map" | "gallery";

export default function SearchResults({ properties }: { properties: Property[]}) {
    const [viewMode, setViewMode] = useState<ViewMode>("map");

    const mapImage = PlaceHolderImages.find((img) => img.id === "market-map");
    
    return (
        <div className="flex-grow">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 pb-8">
                <div className="flex items-center justify-between py-4">
                    <p className="text-sm text-muted-foreground">
                        {properties.length} homes
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
                             {properties.length > 0 ? (
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
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-24">
                                    <h3 className="text-2xl font-semibold">No results found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                                </div>
                            )}
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

                {properties.length > 0 && <div className="mt-12 text-center">
                    <Button size="lg" variant="outline">
                        Load More
                    </Button>
                </div>}
            </div>
        </div>
    );
}
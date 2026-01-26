'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

const INITIAL_LOAD_COUNT = 9;

export default function SearchResults({ properties }: { properties: Property[]}) {
    const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);
    
    const handleLoadMore = () => {
        setVisibleCount(prevCount => prevCount + INITIAL_LOAD_COUNT);
    };

    const canLoadMore = visibleCount < properties.length;
    
    return (
        <div className="flex-grow">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 pb-8">
                <div className="flex items-center justify-between py-4">
                    <p className="text-sm text-muted-foreground">
                        {properties.length} homes
                    </p>
                </div>

                <div>
                    <ScrollArea>
                         {properties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.slice(0, visibleCount).map((property) => (
                                    <PropertyCard key={property.id} property={property} />
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

                {canLoadMore && (
                    <div className="mt-12 text-center">
                        <Button size="lg" variant="outline" onClick={handleLoadMore}>
                            Load More
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

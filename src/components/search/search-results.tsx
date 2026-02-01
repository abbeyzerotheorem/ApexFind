

'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";
import Link from "next/link";

const INITIAL_LOAD_COUNT = 9;

export default function SearchResults({ properties, view }: { properties: Property[], view: string }) {
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
                            <div className={cn(
                                view === 'grid'
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                : "space-y-6"
                            )}>
                                {properties.slice(0, visibleCount).map((property) => (
                                    <PropertyCard key={property.id} property={property} viewMode={view as 'grid' | 'list'} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-24 text-center">
                                <h3 className="text-2xl font-semibold">No results found</h3>
                                <p className="text-muted-foreground mt-2 max-w-md">Try adjusting your search or filters, such as widening the price range or changing the location.</p>
                                 <div className="mt-6">
                                    <h4 className="font-semibold mb-2">Popular Searches:</h4>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <Button variant="link" asChild><Link href="/search?q=Lagos">Lagos</Link></Button>
                                        <Button variant="link" asChild><Link href="/search?q=Abuja">Abuja</Link></Button>
                                        <Button variant="link" asChild><Link href="/search?q=Lekki">Lekki</Link></Button>
                                        <Button variant="link" asChild><Link href="/search?q=Port-Harcourt">Port Harcourt</Link></Button>
                                    </div>
                                </div>
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

'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";
import Link from "next/link";
import { Home } from "lucide-react";

const INITIAL_LOAD_COUNT = 9;

export default function SearchResults({ properties, view }: { properties: Property[], view: string }) {
    const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);
    
    const handleLoadMore = () => {
        setVisibleCount(prevCount => prevCount + INITIAL_LOAD_COUNT);
    };

    const canLoadMore = visibleCount < properties.length;
    
    return (
        <div className="flex-grow">
            <div className="pb-8">
                {properties.length > 0 ? (
                    <div className={cn(
                        "grid gap-6",
                        view === 'grid' 
                            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                            : "grid-cols-1"
                    )}>
                        {properties.slice(0, visibleCount).map((property) => (
                            <PropertyCard 
                                key={property.id} 
                                property={property} 
                                viewMode={view as 'grid' | 'list'} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border-2 border-dashed">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                            <Home className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold">No matches found</h3>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto px-4">
                            We couldn't find any properties matching your exact filters. Try broadening your price range or exploring nearby areas.
                        </p>
                        <div className="mt-10">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Popular Locations:</h4>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button variant="secondary" className="rounded-full" asChild><Link href="/search?q=Lagos">Lagos</Link></Button>
                                <Button variant="secondary" className="rounded-full" asChild><Link href="/search?q=Abuja">Abuja</Link></Button>
                                <Button variant="secondary" className="rounded-full" asChild><Link href="/search?q=Lekki">Lekki</Link></Button>
                                <Button variant="secondary" className="rounded-full" asChild><Link href="/search?q=Port-Harcourt">Port Harcourt</Link></Button>
                            </div>
                        </div>
                    </div>
                )}

                {canLoadMore && (
                    <div className="mt-16 text-center">
                        <Button size="lg" variant="outline" onClick={handleLoadMore} className="min-w-[200px] h-14 font-bold border-2">
                            Load More Properties
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

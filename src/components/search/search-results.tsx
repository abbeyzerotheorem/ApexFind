'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property-card";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";
import Link from "next/link";
import { Home, MapPin, Search } from "lucide-react";

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
                        "grid gap-6 animate-in fade-in duration-500",
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
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-[2.5rem] border-2 border-dashed shadow-sm">
                        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 border border-primary/20 shadow-sm animate-pulse">
                            <Search className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-3xl font-black tracking-tight text-foreground">No matches found</h3>
                        <p className="text-muted-foreground mt-3 max-w-md mx-auto px-6 text-lg leading-relaxed">
                            We couldn't find any properties matching your exact filters. Try broadening your price range or exploring nearby areas.
                        </p>
                        <div className="mt-12 w-full max-w-lg px-6">
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">Popular Hubs to Explore:</h4>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button variant="secondary" size="lg" className="rounded-2xl font-black text-sm px-6 h-12 bg-white border-2 hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
                                    <Link href="/search?q=Lagos"><MapPin className="mr-2 h-4 w-4" /> Lagos</Link>
                                </Button>
                                <Button variant="secondary" size="lg" className="rounded-2xl font-black text-sm px-6 h-12 bg-white border-2 hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
                                    <Link href="/search?q=Abuja"><MapPin className="mr-2 h-4 w-4" /> Abuja</Link>
                                </Button>
                                <Button variant="secondary" size="lg" className="rounded-2xl font-black text-sm px-6 h-12 bg-white border-2 hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
                                    <Link href="/search?q=Lekki"><MapPin className="mr-2 h-4 w-4" /> Lekki</Link>
                                </Button>
                                <Button variant="secondary" size="lg" className="rounded-2xl font-black text-sm px-6 h-12 bg-white border-2 hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
                                    <Link href="/search?q=Port-Harcourt"><MapPin className="mr-2 h-4 w-4" /> Port Harcourt</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {canLoadMore && (
                    <div className="mt-20 text-center">
                        <Button size="lg" variant="outline" onClick={handleLoadMore} className="min-w-[240px] h-16 font-black text-xl border-4 rounded-2xl shadow-xl hover:bg-primary hover:text-white hover:border-primary transition-all group">
                            Load More Results
                            <Home className="ml-3 h-6 w-6 group-hover:animate-bounce" />
                        </Button>
                        <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Showing {visibleCount} of {properties.length} Listings</p>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useMemo } from "react";

import { PropertyCard } from "@/components/property-card";
import { Button } from "../ui/button";
import { Mail, Phone, Share2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

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
  listing_type: 'sale' | 'rent';
  home_type: string;
};

export default function SavedHomes() {
  const { user } = useUser();
  const firestore = useFirestore();

  const savedHomesQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/saved_homes`));
  }, [user, firestore]);

  const { data: properties, loading, error } = useCollection<{ property_data: Property }>(savedHomesQuery as any);

  if (loading) {
    return (
        <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <Skeleton className="h-8 w-80" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96" />)}
            </div>
        </div>
    )
  }
  
  if (error) {
    return <div className="text-destructive">Error: {error.message}</div>
  }
  
  const savedProperties = properties?.map(p => p.property_data) || [];

  return (
    <div>
        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold">You have {savedProperties.length} saved homes</h2>
                <p className="text-muted-foreground">Compare, share, or add notes to your favorite properties.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share Collection</Button>
                <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Email Homes</Button>
            </div>
        </div>
        
        {savedProperties.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {savedProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} showDashboardControls={true} />
                ))}
            </div>
        ) : (
            <div className="mt-8 text-center py-24 bg-secondary rounded-lg">
                <h2 className="text-2xl font-semibold">No Saved Homes Yet</h2>
                <p className="text-muted-foreground mt-2">Start your search and save homes you love.</p>
                <Button className="mt-4">Search Homes</Button>
            </div>
        )}

        {savedProperties.length > 0 && (
            <div className="mt-16 rounded-lg bg-secondary p-8 text-center">
                <h3 className="text-2xl font-bold">Want to tour any of these?</h3>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto">An experienced agent can help you see these homes in person and answer any questions you have.</p>
                <div className="mt-6">
                    <Button size="lg"><Phone className="mr-2 h-4 w-4"/> Contact an Agent</Button>
                </div>
            </div>
        )}
    </div>
  );
}

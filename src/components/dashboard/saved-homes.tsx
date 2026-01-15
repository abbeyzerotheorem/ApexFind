'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PropertyCard } from "@/components/property-card";
import { Button } from "../ui/button";
import { Mail, Phone, Share2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export default function SavedHomes() {
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedHomes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('saved_homes')
          .select('property_data')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading saved homes:', error);
          setSavedProperties([]);
        } else if (data) {
          const properties = data.map(item => item.property_data);
          setSavedProperties(properties);
        }
      } else {
        setSavedProperties([]);
      }
      setLoading(false);
    };

    fetchSavedHomes();
  }, []);

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

'use client';

import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemo, useState } from "react";

import { PropertyCard } from "@/components/property-card";
import { Button } from "../ui/button";
import { Mail, Phone, Share2, LayoutGrid, Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import type { Property } from "@/types";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/naira-formatter";

export default function SavedHomes() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const savedHomesQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, `users/${user.uid}/saved_homes`),
        orderBy('saved_at', 'desc')
    );
  }, [user, firestore]);

  const { data: properties, loading, error } = useCollection<{ property_data: Property }>(savedHomesQuery);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedIds.length === 0) return;
    router.push(`/compare?ids=${selectedIds.join(',')}`);
  };

  const handleShareCollection = async () => {
    if (!properties || properties.length === 0) return;
    
    const summary = properties
        .slice(0, 5)
        .map(p => `- ${p.property_data.address} (${formatNaira(p.property_data.price)})`)
        .join('\n');
    
    const shareText = `Check out my saved homes on ApexFind:\n\n${summary}${properties.length > 5 ? '\n...and more' : ''}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'My ApexFind Saved Homes',
                text: shareText,
                url: window.location.origin + '/dashboard?tab=saved-homes'
            });
        } catch (err) {
            console.error("Sharing failed", err);
        }
    } else {
        const text = encodeURIComponent(shareText);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleEmailCollection = () => {
    if (!properties || properties.length === 0) return;
    const summary = properties
        .map(p => `${p.property_data.address} - ${formatNaira(p.property_data.price)}`)
        .join('%0D%0A');
    const subject = "My Saved Homes on ApexFind";
    const body = `Hi,%0D%0A%0D%0AHere are some properties I saved on ApexFind:%0D%0A%0D%0A${summary}%0D%0A%0D%0AView them all here: ${window.location.origin}/dashboard?tab=saved-homes`;
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

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
    return <div className="text-destructive mt-8">Error: {error.message}</div>
  }
  
  const savedProperties = properties?.map(p => p.property_data).filter(Boolean) as Property[] || [];

  return (
    <div>
        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold">Saved Collections ({savedProperties.length})</h2>
                <p className="text-muted-foreground">Compare features or share your favorites with family.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedIds.length > 0 ? "default" : "outline"} 
                  className="font-bold gap-2"
                  disabled={selectedIds.length === 0}
                  onClick={handleCompare}
                >
                  <LayoutGrid className="h-4 w-4" /> 
                  Compare ({selectedIds.length})
                </Button>
                <Button variant="outline" className="font-bold gap-2" onClick={handleShareCollection} disabled={savedProperties.length === 0}>
                    <Share2 className="h-4 w-4" /> Share
                </Button>
                <Button variant="outline" className="font-bold gap-2" onClick={handleEmailCollection} disabled={savedProperties.length === 0}>
                    <Mail className="h-4 w-4" /> Email
                </Button>
            </div>
        </div>
        
        {savedProperties.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-20">
                {savedProperties.map((property) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      showDashboardControls={true} 
                      isSelected={selectedIds.includes(property.id)}
                      onToggleSelect={() => handleToggleSelect(property.id)}
                    />
                ))}
            </div>
        ) : (
            <div className="mt-8 text-center py-24 bg-card border-2 border-dashed rounded-2xl">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="h-10 w-10 text-primary opacity-40" />
                </div>
                <h2 className="text-2xl font-bold">Your list is empty</h2>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto px-4">Tap the heart icon on any listing to save it here for later.</p>
                <Button className="mt-8 h-12 px-8 font-bold" onClick={() => router.push('/search')}>Browse All Listings</Button>
            </div>
        )}

        {savedProperties.length > 0 && (
            <div className="mt-16 rounded-[2rem] bg-primary/5 p-8 sm:p-12 text-center border border-primary/10">
                <h3 className="text-2xl font-black">Ready to see these homes?</h3>
                <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg">Our top-rated agents can arrange multiple viewings in one day to save you time.</p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <Button size="lg" className="h-14 px-8 font-black text-lg shadow-lg" onClick={() => router.push('/agents')}>
                        <Phone className="mr-2 h-5 w-5"/> Connect with an Agent
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 font-bold" onClick={() => router.push('/search')}>
                        Keep Searching
                    </Button>
                </div>
            </div>
        )}
    </div>
  );
}

'use client';

import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useMemo, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import type { Property } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { clearViewedHistory, removeViewedProperty } from "@/lib/history";
import { Trash2, History, MapPin, Loader2, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getSafeImageUrl } from "@/lib/image-utils";
import { formatNaira } from "@/lib/naira-formatter";

export default function ViewedHistory() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isClearing, setIsDeleting] = useState(false);

  const viewedPropertiesQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, `users/${user.uid}/viewed_properties`), 
        orderBy('viewed_at', 'desc'),
        limit(20)
    );
  }, [user, firestore]);

  const { data: properties, loading, error } = useCollection<{ property_data: Property, viewed_at: { toDate: () => Date } }>(viewedPropertiesQuery);

  const handleClearHistory = async () => {
    if (!user || !firestore) return;
    setIsDeleting(true);
    await clearViewedHistory(firestore, user.uid);
    setIsDeleting(false);
  }

  const handleRemoveProperty = async (propertyId: string) => {
    if (!user || !firestore) return;
    await removeViewedProperty(firestore, user.uid, propertyId);
  }

  if (loading) {
    return (
        <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
             <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
            </div>
        </div>
    )
  }
  
  if (error) {
    return <div className="text-destructive mt-8">Error: {error.message}</div>
  }
  
  const viewedProperties = properties || [];

  return (
    <div className="mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
                <h2 className="text-2xl font-bold">Browsing History</h2>
                <p className="text-muted-foreground">Automatically keeping track of homes you've explored.</p>
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="font-bold gap-2 text-muted-foreground hover:text-destructive" disabled={viewedProperties.length === 0 || isClearing}>
                        {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Clear History
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold">Clear entire history?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base pt-2">
                        This will permanently delete your browsing records. You won't be able to undo this action.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="h-12 font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearHistory} className="h-12 font-bold bg-destructive hover:bg-destructive/90 text-white">Clear All Records</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        {viewedProperties.length > 0 ? (
            <div className="space-y-4 pb-20">
            {viewedProperties.map(({ property_data: property, viewed_at }) => (
                <Card key={property.id} className="group flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-all border-2 border-transparent hover:border-primary/10">
                    <Link href={`/property/${property.id}`} className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-muted">
                        <Image src={getSafeImageUrl(property.imageUrls?.[0], property.home_type)} alt={property.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <Link href={`/property/${property.id}`} className="flex-1">
                                    <p className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">{property.address}</p>
                                </Link>
                                <div className="flex gap-1 ml-4 sm:hidden md:flex">
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full" onClick={() => handleRemoveProperty(String(property.id))}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                                <MapPin size={14} className="text-primary" />
                                <span>{property.city}, {property.state}</span>
                            </div>
                            <p className="text-2xl font-black text-primary mt-2">
                                {formatNaira(property.price)}
                                {property.listing_type === 'rent' && <span className="text-sm font-normal text-muted-foreground ml-1">/{property.price_period}</span>}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1.5">
                                <History className="h-3 w-3" />
                                Viewed {viewed_at ? formatDistanceToNow(viewed_at.toDate(), { addSuffix: true }) : 'recently'}
                            </p>
                            <Button variant="link" size="sm" className="h-auto p-0 font-bold gap-1" asChild>
                                <Link href={`/property/${property.id}`}>View Details <ExternalLink size={12} /></Link>
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
        ) : (
            <div className="mt-8 text-center py-24 bg-card border-2 border-dashed rounded-2xl">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="h-10 w-10 text-muted-foreground opacity-30" />
                </div>
                <h2 className="text-2xl font-bold">No Viewing History</h2>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto px-4">Properties you view while browsing will appear here so you never lose a great find.</p>
                <Button className="mt-8 h-12 px-8 font-bold" asChild>
                    <Link href="/search">Start Your Search</Link>
                </Button>
            </div>
        )}
    </div>
  );
}

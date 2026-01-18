'use client';

import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useMemo } from "react";
import Image from 'next/image';
import Link from 'next/link';

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import type { Property } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { clearViewedHistory, removeViewedProperty } from "@/lib/history";
import { Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog"

export default function ViewedHistory() {
  const { user } = useUser();
  const firestore = useFirestore();

  const viewedPropertiesQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, `users/${user.uid}/viewed_properties`), 
        orderBy('viewed_at', 'desc'),
        limit(20) // Limit to last 20 viewed properties
    );
  }, [user, firestore]);

  const { data: properties, loading, error } = useCollection<{ property_data: Property, viewed_at: { toDate: () => Date } }>(viewedPropertiesQuery);

  const handleClearHistory = async () => {
    if (!user || !firestore) return;
    await clearViewedHistory(firestore, user.uid);
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
                <h2 className="text-2xl font-bold">Recently Viewed Homes</h2>
                <p className="text-muted-foreground">A log of properties you have recently viewed.</p>
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={viewedProperties.length === 0}>Clear History</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete your entire viewing history. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearHistory}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        {viewedProperties.length > 0 ? (
            <div className="space-y-4">
            {viewedProperties.map(({ property_data: property, viewed_at }) => (
                <Card key={property.id} className="flex overflow-hidden">
                    <Link href={`/property/${property.id}`} className="relative w-32 h-32 sm:w-48 sm:h-auto flex-shrink-0">
                        <Image src={property.imageUrl} alt={property.address} layout="fill" objectFit="cover" />
                    </Link>
                    <div className="p-4 flex-grow">
                        <Link href={`/property/${property.id}`}>
                            <p className="font-semibold hover:text-primary">{property.address}</p>
                        </Link>
                        <p className="text-lg font-bold text-primary">₦{property.price.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{property.beds} beds • {property.baths} baths • {property.sqft.toLocaleString()} sqft</p>
                    </div>
                    <div className="p-4 flex flex-col justify-between items-end">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveProperty(String(property.id))}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove from history</span>
                        </Button>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                            Viewed {viewed_at ? formatDistanceToNow(viewed_at.toDate(), { addSuffix: true }) : 'recently'}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
        ) : (
            <div className="mt-8 text-center py-24 bg-secondary rounded-lg">
                <h2 className="text-2xl font-semibold">No Viewed History</h2>
                <p className="text-muted-foreground mt-2">Properties you view will appear here.</p>
            </div>
        )}
    </div>
  );
}

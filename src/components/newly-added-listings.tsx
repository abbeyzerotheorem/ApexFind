'use client';

import { PropertyCard } from "@/components/property-card";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@/types";

export default function NewlyAddedListings() {
  const firestore = useFirestore();

  const propertiesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "properties"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
  }, [firestore]);

  const { data: properties, loading } = useCollection<Property>(propertiesQuery);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-96 w-full" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties?.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

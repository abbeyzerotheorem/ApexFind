'use client';
import { PropertyCard } from "@/components/property-card";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@/types";

export default function HighlightedListings() {
  const firestore = useFirestore();
  const [shuffledProperties, setShuffledProperties] = useState<Property[]>([]);

  const propertiesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "properties"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
  }, [firestore]);
  const { data: properties, loading } = useCollection<Property>(propertiesQuery);

  useEffect(() => {
    if (properties && properties.length > 0) {
      const shuffled = [...properties];
      for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledProperties(shuffled.slice(0, 6));
    }
  }, [properties]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-96 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shuffledProperties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
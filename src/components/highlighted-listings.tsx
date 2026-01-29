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

  // Fetch a larger pool of recent properties for better randomization
  const propertiesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "properties"),
      orderBy("createdAt", "desc"),
      limit(20) // Fetching 20 properties to create a diverse, random pool
    );
  }, [firestore]);
  const { data: properties, loading: propertiesLoading } = useCollection<Property>(propertiesQuery);

  const usersQuery = useMemo(() => {
      if (!firestore) return null;
      return query(collection(firestore, "users"));
  }, [firestore]);
  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);

  const loading = propertiesLoading || usersLoading;

  const filteredProperties = useMemo(() => {
      if (!properties || !allUsers) return [];
      const activeUserIds = new Set(allUsers.map(user => user.id));
      return properties.filter(p => activeUserIds.has(p.agentId));
  }, [properties, allUsers]);

  useEffect(() => {
    // This effect runs only on the client, after the initial render,
    // to avoid hydration mismatch errors between the server and client.
    if (filteredProperties.length > 0) {
      // Fisher-Yates shuffle algorithm to randomize the properties
      const shuffled = [...filteredProperties];
      for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledProperties(shuffled.slice(0, 6)); // Display the first 6 random properties
    }
  }, [filteredProperties]);

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

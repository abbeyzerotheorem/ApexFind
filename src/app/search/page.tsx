'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from "next/navigation";
import SearchResults from "@/components/search/search-results";
import SearchFilters from "@/components/search/search-filters";
import allStatesWithLgas from "@/jsons/nigeria-states.json";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Property } from "@/types";
import { Loader2 } from 'lucide-react';

const allLocations = allStatesWithLgas.flatMap(state => [state.name, ...state.lgas]);

function SearchPageComponent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const propertiesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "properties"));
  }, [firestore]);

  const { data: allProperties, loading } = useCollection<Property>(propertiesQuery);

  const searchQuery = searchParams.get('q') || "";
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0;
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : 500000000;
  const beds = searchParams.get('beds');
  const baths = searchParams.get('baths');
  const homeTypes = searchParams.get('homeTypes') ? searchParams.get('homeTypes')!.split(',') : [];
  const listingType = searchParams.get('type');
  const features = searchParams.get('features') ? searchParams.get('features')!.split(',') : [];

  const filteredProperties = useMemo(() => {
    if (!allProperties) return [];

    return allProperties.filter(property => {
      let matches = true;

      if (listingType) {
        matches = matches && property.listing_type === listingType;
      }

      if (searchQuery) {
        matches = matches && (property.address.toLowerCase().includes(searchQuery.toLowerCase()) || property.city.toLowerCase().includes(searchQuery.toLowerCase()) || property.state.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      if (minPrice) {
        matches = matches && property.price >= minPrice;
      }
      if (maxPrice < 500000000) {
        matches = matches && property.price <= maxPrice;
      }
      if (beds && beds !== 'any') {
          const minBeds = parseInt(beds.replace('+', ''));
          matches = matches && property.beds >= minBeds;
      }
      if (baths && baths !== 'any') {
          const minBaths = parseInt(baths.replace('+', ''));
          matches = matches && property.baths >= minBaths;
      }
      if (homeTypes.length > 0) {
        matches = matches && homeTypes.includes(property.home_type);
      }
      if (features.length > 0) {
          if (features.includes('furnished') && !property.is_furnished) {
              matches = false;
          }
          if (features.includes('generator') && !property.power_supply?.toLowerCase().includes('generator')) {
              matches = false;
          }
          if (features.includes('borehole') && !property.water_supply?.toLowerCase().includes('borehole')) {
              matches = false;
          }
          if (features.includes('gated') && !property.security_type?.includes('Gated Estate')) {
              matches = false;
          }
      }
      return matches;
    });
  }, [allProperties, searchQuery, minPrice, maxPrice, beds, baths, homeTypes, listingType, features]);
  
  return (
    <>
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SearchFilters 
          searchQuery={searchQuery} 
          allLocations={allLocations}
          minPrice={minPrice}
          maxPrice={maxPrice}
          beds={beds || 'any'}
          baths={baths || 'any'}
          homeTypes={homeTypes}
          features={features}
          propertyCount={filteredProperties.length}
        />
      </div>
      <SearchResults properties={loading ? [] : filteredProperties} />
    </>
  );
}


function SearchLoadingFallback() {
    return (
        <div className="flex h-[calc(100vh-148px)] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchPageComponent />
    </Suspense>
  );
}

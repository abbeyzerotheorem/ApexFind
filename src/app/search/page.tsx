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
  const minSqft = searchParams.get('minSqft') ? parseInt(searchParams.get('minSqft')!) : 0;
  const maxSqft = searchParams.get('maxSqft') ? parseInt(searchParams.get('maxSqft')!) : 0;
  const keywords = searchParams.get('keywords');
  const sort = searchParams.get('sort') || 'relevant';

  const filteredProperties = useMemo(() => {
    if (!allProperties) return [];

    let filtered = allProperties.filter(property => {
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
          if (features.includes('furnished') && !property.is_furnished) matches = false;
          if (features.includes('generator') && !property.power_supply?.toLowerCase().includes('generator')) matches = false;
          if (features.includes('borehole') && !property.water_supply?.toLowerCase().includes('borehole')) matches = false;
          if (features.includes('gated') && !property.security_type?.includes('Gated Estate')) matches = false;
      }
      if (minSqft) {
          matches = matches && property.sqft >= minSqft;
      }
      if (maxSqft) {
          matches = matches && property.sqft <= maxSqft;
      }
      if (keywords) {
          matches = matches && (property.description?.toLowerCase().includes(keywords.toLowerCase()) || property.address.toLowerCase().includes(keywords.toLowerCase()));
      }
      return matches;
    });

    // Sorting logic
    switch (sort) {
        case 'newest':
            filtered.sort((a, b) => (b.createdAt?.toDate?.().getTime() || 0) - (a.createdAt?.toDate?.().getTime() || 0));
            break;
        case 'price-low-high':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high-low':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'relevant':
        default:
            // No sort for relevance, uses default Firestore order (or can be enhanced)
            break;
    }

    return filtered;

  }, [allProperties, searchQuery, minPrice, maxPrice, beds, baths, homeTypes, listingType, features, minSqft, maxSqft, keywords, sort]);
  
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
          minSqft={minSqft}
          maxSqft={maxSqft}
          keywords={keywords || ''}
          sort={sort}
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

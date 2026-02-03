'use client';

import { Suspense, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from "next/navigation";
import SearchResults from "@/components/search/search-results";
import SearchFilters from "@/components/search/search-filters";
import allStatesWithLgas from "@/jsons/nigeria-states.json";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Property } from "@/types";
import { Loader2 } from 'lucide-react';
import { FilterControls } from '@/components/search/filter-controls';

const allLocations = allStatesWithLgas.flatMap(state => [state.name, ...state.lgas]);

const MapView = dynamic(() => import('@/components/search/map-view'), {
    ssr: false,
    loading: () => <div className="flex h-full w-full items-center justify-center bg-muted"><Loader2 className="h-8 w-8 animate-spin" /></div>
});


function SearchPageComponent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  useEffect(() => {
    const trackSearch = async () => {
        const searchQuery = searchParams.get('q');
        if (searchQuery) {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'search_performed',
                    data: { q: searchQuery, params: searchParams.toString() }
                })
            });
        }
    };

    if (searchParams.get('q')) {
        trackSearch();
    }
  }, [searchParams]);

  const propertiesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "properties"));
  }, [firestore]);
  const { data: allProperties, loading: propertiesLoading } = useCollection<Property>(propertiesQuery);

  const loading = propertiesLoading;

  const searchQuery = searchParams.get('q') || "";
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0;
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : 1000000000;
  const beds = searchParams.get('beds');
  const baths = searchParams.get('baths');
  const homeTypes = searchParams.get('homeTypes') ? searchParams.get('homeTypes')!.split(',') : [];
  const listingType = searchParams.get('type');
  const features = searchParams.get('features') ? searchParams.get('features')!.split(',') : [];
  const minSqft = searchParams.get('minSqft') ? parseInt(searchParams.get('minSqft')!) : 0;
  const maxSqft = searchParams.get('maxSqft') ? parseInt(searchParams.get('maxSqft')!) : 0;
  const keywords = searchParams.get('keywords');
  const sort = searchParams.get('sort') || 'relevant';
  const view = searchParams.get('view') || 'grid';
  const furnishing = searchParams.get('furnishing');
  const pricePeriods = searchParams.get('pricePeriods')?.split(',') || [];

  const filteredProperties = useMemo(() => {
    if (loading || !allProperties) return [];

    let filtered = allProperties.filter(property => {
      let matches = true;

      if (listingType) {
        if (listingType === 'buy' || listingType === 'sale') {
            matches = matches && property.listing_type === 'sale';
        } else if (listingType === 'rent') {
            matches = matches && property.listing_type === 'rent';
        }
      }

      if (searchQuery) {
        matches = matches && (
            property.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
            property.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
            property.state.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (minPrice) {
        matches = matches && property.price >= minPrice;
      }
      if (maxPrice < 1000000000) {
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
          if (features.includes('pool') && !property.has_pool) matches = false;
          if (features.includes('parking') && (!property.parking_spaces || property.parking_spaces < 1)) matches = false;
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
      
      if (furnishing === 'furnished') {
        matches = matches && property.is_furnished === true;
      } else if (furnishing === 'unfurnished') {
        matches = matches && !property.is_furnished;
      }

      if (pricePeriods.length > 0 && property.listing_type === 'rent') {
          matches = matches && !!property.price_period && pricePeriods.includes(property.price_period);
      }

      return matches;
    });

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
        default:
            break;
    }

    return filtered;

  }, [allProperties, loading, searchQuery, minPrice, maxPrice, beds, baths, homeTypes, listingType, features, minSqft, maxSqft, keywords, sort, furnishing, pricePeriods]);

  const filterProps = {
    minPrice: minPrice,
    maxPrice: maxPrice,
    beds: beds || 'any',
    baths: baths || 'any',
    homeTypes: homeTypes,
    features: features,
    minSqft: minSqft,
    maxSqft: maxSqft,
    keywords: keywords || '',
    furnishing: furnishing || 'any',
    pricePeriods: pricePeriods,
    listingType: listingType,
  };
  
  return (
    <div className='flex flex-col'>
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SearchFilters 
          searchQuery={searchQuery} 
          allLocations={allLocations}
          {...filterProps}
          sort={sort}
          propertyCount={filteredProperties.length}
        />
      </div>
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid flex-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            <aside className="hidden lg:block">
                <h2 className="sr-only">Filters</h2>
                <FilterControls {...filterProps}/>
            </aside>

            <div className="lg:col-span-3">
                {view === 'map'
                    ? <div className="h-[75vh]"><MapView properties={filteredProperties} /></div>
                    : <SearchResults properties={loading ? [] : filteredProperties} view={view} />
                }
            </div>
        </div>
      </div>
    </div>
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
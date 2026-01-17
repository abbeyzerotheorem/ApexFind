import SearchResults from "@/components/search/search-results";
import SearchFilters from "@/components/search/search-filters";
import { PlaceHolderProperties } from "@/lib/placeholder-properties";
import allStatesWithLgas from "@/jsons/nigeria-states.json";

const allLocations = allStatesWithLgas.flatMap(state => [state.name, ...state.lgas]);

export default function SearchPage({ searchParams }: { 
  searchParams?: { 
    q?: string,
    minPrice?: string,
    maxPrice?: string,
    beds?: string,
    baths?: string,
    homeTypes?: string,
    type?: string,
  } 
}) {
  const searchQuery = searchParams?.q || "";
  const minPrice = searchParams?.minPrice ? parseInt(searchParams.minPrice) : 0;
  const maxPrice = searchParams?.maxPrice ? parseInt(searchParams.maxPrice) : 500000000;
  const beds = searchParams?.beds;
  const baths = searchParams?.baths;
  const homeTypes = searchParams?.homeTypes ? searchParams.homeTypes.split(',') : [];
  const listingType = searchParams?.type;

  let filteredProperties = PlaceHolderProperties.filter(property => {
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
    return matches;
  });
  
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
          propertyCount={filteredProperties.length}
        />
      </div>
      <SearchResults properties={filteredProperties} />
    </>
  );
}

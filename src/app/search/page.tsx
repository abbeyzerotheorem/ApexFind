import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
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
  } 
}) {
  const searchQuery = searchParams?.q || "";
  const minPrice = searchParams?.minPrice ? parseInt(searchParams.minPrice) : null;
  const maxPrice = searchParams?.maxPrice ? parseInt(searchParams.maxPrice) : null;

  let filteredProperties = PlaceHolderProperties;

  if (searchQuery) {
    filteredProperties = filteredProperties.filter(property => 
        property.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }

  if (minPrice !== null) {
    filteredProperties = filteredProperties.filter(p => p.price >= minPrice);
  }

  if (maxPrice !== null) {
    filteredProperties = filteredProperties.filter(p => p.price <= maxPrice);
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SearchFilters searchQuery={searchQuery} allLocations={allLocations}/>
        </div>
        <SearchResults properties={filteredProperties} />
      </main>
      <Footer />
    </div>
  );
}
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SearchResults from "@/components/search/search-results";
import SearchFilters from "@/components/search/search-filters";
import { PlaceHolderProperties } from "@/lib/placeholder-properties";

export default function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const searchQuery = searchParams?.q || "";

  const filteredProperties = searchQuery
    ? PlaceHolderProperties.filter(property => 
        property.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : PlaceHolderProperties;
  
  const allLocations = [...new Set(PlaceHolderProperties.map(p => p.address.split(',')[1].trim()))];

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

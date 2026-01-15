import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SearchResults from "@/components/search/search-results";
import SearchFilters from "@/components/search/search-filters";

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SearchFilters />
        </div>
        <SearchResults />
      </main>
      <Footer />
    </div>
  );
}

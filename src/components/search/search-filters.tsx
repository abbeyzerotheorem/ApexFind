'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ChevronRight, SlidersHorizontal, LayoutGrid, List, Map as MapIcon, Save } from "lucide-react";
import React from "react";
import { FilterControls } from "./filter-controls";
import Link from "next/link";
import AutocompleteSearch from "../autocomplete-search";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleAuth,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUser, useFirestore } from "@/firebase";
import { saveSearch } from "@/lib/searches";
import { formatNairaShort } from "@/lib/naira-formatter";


type SearchFiltersProps = {
  searchQuery: string;
  allLocations: string[];
  minPrice: number;
  maxPrice: number;
  beds: string;
  baths: string;
  homeTypes: string[];
  features: string[];
  minSqft: number;
  maxSqft: number;
  keywords: string;
  sort: string;
  propertyCount: number;
  listingType: string | null;
  furnishing: string;
  pricePeriods: string[];
};

function createFilterSummary({
  searchQuery,
  homeTypes,
  minPrice,
  maxPrice,
  beds,
  baths,
  listingType
}: {
  searchQuery: string;
  homeTypes: string[];
  minPrice: number;
  maxPrice: number;
  beds: string;
  baths: string;
  listingType: string | null;
}): string {
  const parts: string[] = [];

  const typeLabel = listingType === 'rent' ? 'For Rent' : 'For Sale';
  parts.push(typeLabel);

  if (searchQuery) {
    parts.push(searchQuery);
  } else {
    parts.push("Nigeria");
  }

  if (homeTypes.length > 0) {
    parts.push(homeTypes.length === 1 ? homeTypes[0] : `${homeTypes.length} Types`);
  }

  if (minPrice > 0 || maxPrice < 500000000) {
    const min = minPrice > 0 ? formatNairaShort(minPrice) : '';
    const max = maxPrice < 500000000 ? formatNairaShort(maxPrice) : '';
    if (min || max) {
      if (min && max) parts.push(`${min}-${max}`);
      else if (min) parts.push(`>${min}`);
      else if (max) parts.push(`<${max}`);
    }
  }

  if (beds && beds !== 'any') {
    parts.push(`${beds.replace('+', '')}+Beds`);
  }

  return parts.join(' → ');
}


export default function SearchFilters({ 
  searchQuery: initialSearchQuery, 
  allLocations, 
  minPrice, 
  maxPrice,
  beds,
  baths,
  homeTypes,
  features,
  minSqft,
  maxSqft,
  keywords,
  sort: initialSort,
  propertyCount,
  listingType,
  furnishing,
  pricePeriods,
}: SearchFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useUser();
    const firestore = useFirestore();

    const [searchQuery, setSearchQuery] = React.useState(initialSearchQuery);
    const view = searchParams.get('view') || 'grid';

    const [showSaveSearchDialog, setShowSaveSearchDialog] = React.useState(false);
    const [showAuthDialog, setShowAuthDialog] = React.useState(false);
    const [searchName, setSearchName] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    
    const createQueryString = React.useCallback(
      (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(name, value)
        } else {
            params.delete(name);
        }
        return params.toString()
      },
      [searchParams]
    )

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`${pathname}?${createQueryString('q', searchQuery)}`);
    };

    const handleSortChange = (value: string) => {
        if (value) {
            router.push(`${pathname}?${createQueryString('sort', value)}`);
        }
    }


    const handleSaveSearchClick = () => {
        if (!user) {
            setShowAuthDialog(true);
        } else {
            setShowSaveSearchDialog(true);
        }
    }
    
    const handleConfirmSaveSearch = async () => {
        if (!user || !firestore || !searchName.trim()) return;
        setIsSaving(true);
        try {
            await saveSearch(firestore, user.uid, searchName, searchParams.toString());
            setShowSaveSearchDialog(false);
            setSearchName('');
        } catch (error) {
            console.error("Failed to save search", error);
        } finally {
            setIsSaving(false);
        }
    }

    const handleTypeChange = (value: string) => {
        if (value) {
            router.push(`${pathname}?${createQueryString('type', value)}`);
        }
    }

    const handleViewChange = (value: string) => {
        if (value) {
            router.push(`${pathname}?${createQueryString('view', value)}`);
        }
    }
    
    const filterSummary = createFilterSummary({
      searchQuery: initialSearchQuery,
      homeTypes,
      minPrice,
      maxPrice,
      beds,
      baths,
      listingType
    });


    return (
      <>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 py-4">
                 <div className="flex items-center text-xs sm:text-sm overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
                    <Link href="/" className="text-muted-foreground hover:text-foreground flex-shrink-0">Home</Link>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 mx-1 text-muted-foreground" />
                    <span className="font-semibold text-primary truncate">{filterSummary}</span>
                    <span className="ml-2 text-muted-foreground">({propertyCount} listings)</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-grow max-w-2xl">
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                            <AutocompleteSearch 
                              allLocations={allLocations} 
                              value={searchQuery}
                              onChange={setSearchQuery}
                              className="h-11"
                            />
                            <Button type="submit" className="h-11 px-6">Search</Button>
                        </form>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <ToggleGroup type="single" value={view} onValueChange={handleViewChange} className="bg-muted p-1 rounded-lg">
                            <ToggleGroupItem value="grid" className="rounded-md h-8 w-8 p-0" aria-label="Grid View"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="list" className="rounded-md h-8 w-8 p-0" aria-label="List View"><List className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="map" className="rounded-md h-8 w-8 p-0" aria-label="Map View"><MapIcon className="h-4 w-4" /></ToggleGroupItem>
                        </ToggleGroup>
                        
                        <ToggleGroup type="single" value={listingType || 'buy'} onValueChange={handleTypeChange} className="bg-muted p-1 rounded-lg">
                            <ToggleGroupItem value="buy" className="rounded-md h-8 px-3 text-xs" aria-label="For Sale">Buy</ToggleGroupItem>
                            <ToggleGroupItem value="rent" className="rounded-md h-8 px-3 text-xs" aria-label="For Rent">Rent</ToggleGroupItem>
                        </ToggleGroup>

                        <Button variant="outline" size="sm" onClick={handleSaveSearchClick} className="h-10 gap-2">
                            <Save className="h-4 w-4" /> Save
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10">
                                    <span className="hidden sm:inline">Sort: </span>
                                    <span className="font-semibold capitalize">{initialSort.replace('-', ' ')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuRadioGroup value={initialSort} onValueChange={handleSortChange}>
                                    <DropdownMenuRadioItem value="relevant">Relevant</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="price-low-high">Price (Low-High)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="price-high-low">Price (High-Low)</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="h-10 lg:hidden">
                              <SlidersHorizontal className="mr-2 h-4 w-4" />
                              Filters
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                            <SheetHeader className="mb-6">
                              <SheetTitle className="text-2xl font-bold">Search Filters</SheetTitle>
                            </SheetHeader>
                            <FilterControls 
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                beds={beds}
                                baths={baths}
                                homeTypes={homeTypes}
                                features={features}
                                minSqft={minSqft}
                                maxSqft={maxSqft}
                                keywords={keywords}
                                listingType={listingType}
                                furnishing={furnishing}
                                pricePeriods={pricePeriods}
                            />
                          </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </div>

        <Dialog open={showSaveSearchDialog} onOpenChange={setShowSaveSearchDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save Your Search</DialogTitle>
                    <DialogDescription>Get instant alerts when new properties matching your filters are listed.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="search-name">Search Name</Label>
                        <Input 
                            id="search-name" 
                            value={searchName} 
                            onChange={(e) => setSearchName(e.target.value)} 
                            placeholder="e.g. Luxury Duplexes in Lekki" 
                        />
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">Filters to save:</p>
                        <p>{filterSummary}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowSaveSearchDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmSaveSearch} disabled={isSaving || !searchName.trim()}>
                        {isSaving ? 'Saving...' : 'Save Search'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitleAuth>Sign In Required</AlertDialogTitleAuth>
              <AlertDialogDescription>
                You need an account to save searches and receive real-time property alerts. It's free and takes less than a minute.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/auth')}>Sign Up / Sign In</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
}

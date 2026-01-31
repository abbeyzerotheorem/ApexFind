

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
import { ChevronRight, SlidersHorizontal } from "lucide-react";
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
};

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
  propertyCount
}: SearchFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useUser();
    const firestore = useFirestore();

    const [searchQuery, setSearchQuery] = React.useState(initialSearchQuery);
    const listingType = searchParams.get('type') || 'buy';

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
            // TODO: Show toast notification for success
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

    return (
      <>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 py-4">
                 <div className="flex items-center text-sm">
                    <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-semibold">{initialSearchQuery || "Nigeria"}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-grow">
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                            <AutocompleteSearch 
                              allLocations={allLocations} 
                              value={searchQuery}
                              onChange={setSearchQuery}
                            />
                            <Button type="submit">Search</Button>
                        </form>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <ToggleGroup type="single" value={listingType} onValueChange={handleTypeChange} aria-label="Transaction Type">
                            <ToggleGroupItem value="buy" aria-label="For Sale">Buy</ToggleGroupItem>
                            <ToggleGroupItem value="rent" aria-label="For Rent">Rent</ToggleGroupItem>
                        </ToggleGroup>

                        <Button variant="outline" size="sm" onClick={handleSaveSearchClick}>
                            Save Search
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <span>Sort by: </span>
                                    <span className="font-semibold ml-1 capitalize">{initialSort.replace('-', ' ')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
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
                            <Button variant="outline" size="sm" className="h-9 lg:hidden">
                              <SlidersHorizontal className="mr-2 h-4 w-4" />
                              All Filters
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full max-w-md sm:max-w-md overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle>All Filters</SheetTitle>
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
                    <DialogTitle>Save Search</DialogTitle>
                    <DialogDescription>Give this search a name so you can find it later and get alerts.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                    <Label htmlFor="search-name">Search Name</Label>
                    <Input id="search-name" value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="e.g. Lekki Apartments under ₦50M" />
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
              <AlertDialogTitleAuth>Create an Account to Continue</AlertDialogTitleAuth>
              <AlertDialogDescription>
                To save searches and get alerts, you need to have an account. It's free and only takes a minute!
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

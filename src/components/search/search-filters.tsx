
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
import { ChevronRight, SlidersHorizontal, X, Bookmark } from "lucide-react";
import React from "react";
import { FilterControls } from "./filter-controls";
import Link from "next/link";
import AutocompleteSearch from "../autocomplete-search";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useUser, useFirestore } from "@/firebase";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
  propertyCount: number;
};

export default function SearchFilters({ 
  searchQuery, 
  allLocations, 
  minPrice, 
  maxPrice,
  beds,
  baths,
  homeTypes,
  features,
  propertyCount
}: SearchFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useUser();
    const firestore = useFirestore();
    const [sort, setSort] = React.useState("relevant");
    const listingType = searchParams.get('type') || 'buy';

    const [searchName, setSearchName] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const [saveMessage, setSaveMessage] = React.useState('');
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const handleTypeChange = (value: string) => {
        if (value) {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set('type', value);
            router.push(`${pathname}?${newParams.toString()}`);
        }
    }

    const handleSaveSearch = async () => {
        if (!user || !firestore) {
            router.push('/auth');
            return;
        }
        if (!searchName.trim()) {
            setSaveMessage("Please provide a name for your search.");
            return;
        }

        setIsSaving(true);
        setSaveMessage('');

        try {
            await saveSearch(firestore, user.uid, searchName, searchParams.toString());
            setSaveMessage('Search saved successfully!');
            setSearchName('');
            setTimeout(() => {
                setIsDialogOpen(false);
                setSaveMessage('');
            }, 1500);
        } catch (error) {
            setSaveMessage('Failed to save search. Please try again.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const createQueryString = React.useCallback(
      (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(name, value)
        return params.toString()
      },
      [searchParams]
    )

    return (
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 py-4">
                 <div className="flex items-center text-sm">
                    <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-semibold">{searchQuery || "Nigeria"}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-grow">
                        <form action="/search" className="flex items-center gap-2">
                            <AutocompleteSearch allLocations={allLocations} initialValue={searchQuery} />
                            <Button type="submit">Search</Button>
                        </form>
                    </div>

                    <div className="flex items-center gap-2">
                        <ToggleGroup type="single" value={listingType} onValueChange={handleTypeChange} aria-label="Transaction Type">
                            <ToggleGroupItem value="buy" aria-label="For Sale">Buy</ToggleGroupItem>
                            <ToggleGroupItem value="rent" aria-label="For Rent">Rent</ToggleGroupItem>
                        </ToggleGroup>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <span>Sort by: </span>
                                    <span className="font-semibold ml-1 capitalize">{sort.replace('-', ' ')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                                    <DropdownMenuRadioItem value="relevant">Relevant</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="price-low-high">Price (Low-High)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="price-high-low">Price (High-Low)</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {user && (
                            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                                setIsDialogOpen(open);
                                if (!open) {
                                    setSaveMessage('');
                                    setSearchName('');
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9">
                                        <Bookmark className="mr-2 h-4 w-4" />
                                        Save Search
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Save Search</DialogTitle>
                                        <DialogDescription>
                                            Create a name for this search to get email alerts for new matching properties.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="search-name">Search Name</Label>
                                            <Input 
                                                id="search-name"
                                                value={searchName}
                                                onChange={(e) => setSearchName(e.target.value)}
                                                placeholder="e.g. 'Lekki 3-Bed Duplexes'"
                                            />
                                        </div>
                                        {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleSaveSearch} disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
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
                            />
                          </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </div>
    )
}

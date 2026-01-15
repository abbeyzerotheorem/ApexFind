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
import { ChevronRight, ListFilter, Map, SlidersHorizontal, View, X } from "lucide-react";
import React from "react";
import { FilterControls } from "./filter-controls";

const activeFilters = [
  { label: "3+ Beds", value: "beds_gte_3" },
  { label: "Under $750k", value: "price_lte_750000" },
  { label: "Pool", value: "features_pool" },
];

export default function SearchFilters() {
    const [sort, setSort] = React.useState("relevant");
    return (
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center text-sm">
                        <a href="/" className="text-muted-foreground hover:text-foreground">Home</a>
                        <ChevronRight className="h-4 w-4" />
                        <span className="font-semibold">San Francisco, CA</span>
                    </div>

                    <div className="flex items-center gap-2">
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

                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                              <SlidersHorizontal className="mr-2 h-4 w-4" />
                              All Filters
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full max-w-md sm:max-w-md">
                            <SheetHeader>
                              <SheetTitle>All Filters</SheetTitle>
                            </SheetHeader>
                            <FilterControls />
                          </SheetContent>
                        </Sheet>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {activeFilters.map((filter) => (
                        <Button
                            key={filter.value}
                            variant="secondary"
                            size="sm"
                            className="h-auto rounded-full py-1 pl-3 pr-2 text-sm"
                        >
                            {filter.label}
                            <X className="ml-1 h-4 w-4" />
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
import Image from "next/image";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  Home,
  MoreHorizontal,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import AutocompleteSearch from "./autocomplete-search";
import allStates from "@/jsons/nigeria-states.json";

const NairaPriceIcon = () => (
    <span className="font-bold">₦</span>
);

export default function HeroSearch() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-background");
  return (
    <section className="relative h-[600px] w-full">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          data-ai-hint={heroImage.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h1 className="font-headline text-5xl font-bold text-white sm:text-6xl md:text-7xl">
          Find Your Place
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-200">
          Discover a place you'll love to live. The most comprehensive real
          estate search, right at your fingertips.
        </p>

        <Tabs defaultValue="buy" className="mt-8 w-full max-w-4xl">
          <TabsList className="mx-auto grid w-full max-w-md grid-cols-3 bg-white/20 p-1 backdrop-blur-sm">
            <TabsTrigger value="buy" className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Buy</TabsTrigger>
            <TabsTrigger value="rent" className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Rent</TabsTrigger>
            <TabsTrigger value="sold" className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sold</TabsTrigger>
          </TabsList>
          <TabsContent value="buy">
            <SearchForm allLocations={allStates} />
          </TabsContent>
          <TabsContent value="rent">
            <SearchForm allLocations={allStates} />
          </TabsContent>
          <TabsContent value="sold">
            <SearchForm allLocations={allStates} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function SearchForm({ allLocations }: { allLocations: string[] }) {
  return (
    <form action="/search" className="mt-4 flex w-full flex-col items-center gap-2 rounded-lg bg-background p-4 shadow-lg sm:flex-row">
      <AutocompleteSearch allLocations={allLocations} />
      <div className="flex w-full gap-2 sm:w-auto">
        <FilterDropdown icon={NairaPriceIcon} label="Price" />
        <FilterDropdown icon={BedDouble} label="Beds" />
        <FilterDropdown icon={Bath} label="Baths" />
        <FilterDropdown icon={Home} label="Home Type" />
        <FilterDropdown icon={MoreHorizontal} label="More" />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Search
      </Button>
    </form>
  );
}

function FilterDropdown({ icon: Icon, label }: { icon: React.ElementType, label: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden sm:flex">
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Any</DropdownMenuItem>
        <DropdownMenuItem>Option 1</DropdownMenuItem>
        <DropdownMenuItem>Option 2</DropdownMenuItem>
        <DropdownMenuItem>Option 3+</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

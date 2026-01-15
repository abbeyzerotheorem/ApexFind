
'use client'

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import AutocompleteSearch from "./autocomplete-search";
import allStatesWithLgas from "@/jsons/nigeria-states.json";
import { Label } from "./ui/label";
import React from "react";
import { Slider } from "./ui/slider";
import { useRouter } from "next/navigation";

const allLocations = allStatesWithLgas.flatMap(state => [state.name, ...state.lgas]);

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
            <SearchForm allLocations={allLocations} />
          </TabsContent>
          <TabsContent value="rent">
            <SearchForm allLocations={allLocations} />
          </TabsContent>
          <TabsContent value="sold">
            <SearchForm allLocations={allLocations} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function SearchForm({ allLocations }: { allLocations: string[] }) {
  const router = useRouter();
  const [minPrice, setMinPrice] = React.useState(0);
  const [maxPrice, setMaxPrice] = React.useState(500000000);

  const handlePriceChange = (value: number[]) => {
    setMinPrice(value[0]);
    setMaxPrice(value[1]);
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q') as string;
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (minPrice > 0) params.set('minPrice', String(minPrice));
    if (maxPrice < 500000000) params.set('maxPrice', String(maxPrice));
    
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex w-full flex-col items-center gap-2 rounded-lg bg-background p-4 shadow-lg sm:flex-row">
      <AutocompleteSearch allLocations={allLocations} />
      <div className="flex w-full gap-2 sm:w-auto">
        <PriceFilterDropdown 
            minPrice={minPrice} 
            maxPrice={maxPrice} 
            onPriceChange={handlePriceChange} 
            />
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

function PriceFilterDropdown({ minPrice, maxPrice, onPriceChange }: { minPrice: number, maxPrice: number, onPriceChange: (value: number[]) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden sm:flex">
          <NairaPriceIcon />
          <span className="ml-2">Price</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4">
        <div className="space-y-4">
          <DropdownMenuLabel className="p-0">Price Range (₦)</DropdownMenuLabel>
          <div className="flex justify-between text-sm text-muted-foreground">
             <span>{minPrice.toLocaleString()}</span>
             <span>{maxPrice.toLocaleString()}+</span>
          </div>
          <Slider
            min={0}
            max={500000000}
            step={1000000}
            value={[minPrice, maxPrice]}
            onValueChange={onPriceChange}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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


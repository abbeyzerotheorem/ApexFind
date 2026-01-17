

'use client'

import Link from "next/link";
import {
  Bath,
  BedDouble,
  Home,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import AutocompleteSearch from "./autocomplete-search";
import allStatesWithLgas from "@/jsons/nigeria-states.json";
import React from "react";
import { Slider } from "./ui/slider";
import { useRouter } from "next/navigation";

const allLocations = allStatesWithLgas.flatMap(state => [state.name, ...state.lgas]);
const homeTypes = ["House", "Apartment (Flat)", "Duplex", "Terrace"];


const NairaPriceIcon = () => (
    <span className="font-bold">₦</span>
);

export default function HeroSearch() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-white sm:text-6xl md:text-7xl">
          Find Your Dream Home
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-200">
          Discover the perfect property from thousands of listings
        </p>

        <div className="mt-8 w-full max-w-4xl">
            <SearchForm allLocations={allLocations} />
        </div>
      </div>
    </section>
  );
}

function SearchForm({ allLocations }: { allLocations: string[] }) {
  const router = useRouter();
  const [minPrice, setMinPrice] = React.useState(0);
  const [maxPrice, setMaxPrice] = React.useState(500000000);
  const [beds, setBeds] = React.useState("any");
  const [baths, setBaths] = React.useState("any");
  const [selectedHomeTypes, setSelectedHomeTypes] = React.useState<string[]>([]);

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
    if (beds !== 'any') params.set('beds', beds);
    if (baths !== 'any') params.set('baths', baths);
    if (selectedHomeTypes.length > 0) params.set('homeTypes', selectedHomeTypes.join(','));
    
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
        <BedsAndBathsFilterDropdown 
            icon={BedDouble} 
            label="Beds" 
            value={beds}
            onValueChange={setBeds}
            />
        <BedsAndBathsFilterDropdown 
            icon={Bath} 
            label="Baths" 
            value={baths}
            onValueChange={setBaths}
            />
        <HomeTypeFilterDropdown 
            selectedTypes={selectedHomeTypes}
            onSelectedTypesChange={setSelectedHomeTypes}
            />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto font-medium">
        Search
      </Button>
    </form>
  );
}

function PriceFilterDropdown({ minPrice, maxPrice, onPriceChange }: { minPrice: number, maxPrice: number, onPriceChange: (value: number[]) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden sm:flex font-normal text-foreground">
          <NairaPriceIcon />
          <span className="ml-2">Price</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4">
        <div className="space-y-4">
          <DropdownMenuLabel className="p-0 font-semibold">Price Range (₦)</DropdownMenuLabel>
          <div className="flex justify-between text-sm text-muted-foreground">
             <span>{minPrice.toLocaleString()}</span>
             <span>{maxPrice.toLocaleString()}{maxPrice === 500000000 ? '+' : ''}</span>
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

function BedsAndBathsFilterDropdown({ icon: Icon, label, value, onValueChange }: { icon: React.ElementType, label: string, value: string, onValueChange: (value: string) => void }) {
    const options = ["any", "1", "2", "3", "4", "5+"];
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="hidden sm:flex font-normal text-foreground">
            <Icon className="mr-2 h-4 w-4" />
            {label}
            {value !== 'any' && <span className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">{value}{value.includes('+') ? '' : '+' }</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuLabel className="font-semibold">{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
                {options.map(option => (
                    <DropdownMenuRadioItem key={option} value={option} className="font-normal">
                        {option === 'any' ? 'Any' : `${option}${option.includes('+') ? '' : '+'}`}
                    </DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

function HomeTypeFilterDropdown({ selectedTypes, onSelectedTypesChange }: { selectedTypes: string[], onSelectedTypesChange: (types: string[]) => void }) {
    
    const handleSelect = (type: string) => {
        const newSelectedTypes = selectedTypes.includes(type)
            ? selectedTypes.filter(t => t !== type)
            : [...selectedTypes, type];
        onSelectedTypesChange(newSelectedTypes);
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:flex font-normal text-foreground">
                    <Home className="mr-2 h-4 w-4" />
                    Home Type
                    {selectedTypes.length > 0 && <span className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">{selectedTypes.length}</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className="font-semibold">Home Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {homeTypes.map(type => (
                    <DropdownMenuCheckboxItem
                        key={type}
                        checked={selectedTypes.includes(type)}
                        onSelect={(e) => { e.preventDefault(); handleSelect(type) }}
                        className="font-normal"
                    >
                        {type}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

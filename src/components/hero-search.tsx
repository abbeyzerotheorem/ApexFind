
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AutocompleteSearch from './autocomplete-search';
import allStatesWithLgas from "@/jsons/nigeria-states.json";

const allLocations = allStatesWithLgas.flatMap(state => [state.name, ...state.lgas]);

export default function HeroSearch() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <section className="relative flex h-[60vh] min-h-[400px] items-center justify-center pt-20 text-white">
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
      <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-white sm:text-6xl md:text-7xl">
          Find Your Dream Property in Nigeria
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-200">
           Discover luxury apartments, family homes, and commercial properties across Lagos, Abuja, Port Harcourt, and more
        </p>

        <div className="mt-8 w-full max-w-4xl">
          <SearchBar />
           <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
            <span className="text-sm font-medium">Popular:</span>
            <Link href="/search?q=Lekki" className="px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 text-sm">
              Lekki
            </Link>
            <Link href="/search?q=Ikeja" className="px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 text-sm">
              Ikeja
            </Link>
            <Link href="/search?q=Abuja" className="px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 text-sm">
              Abuja
            </Link>
            <Link href="/search?q=Port%20Harcourt" className="px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 text-sm">
              Port Harcourt
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchBar() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchType, setSearchType] = React.useState('sale');
  
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      
      const params = new URLSearchParams()
      if (searchTerm.trim()) {
        params.set('q', searchTerm)
      }
      
      let typeParam = 'buy'; // default to 'buy' for 'sale'
      if (searchType === 'rent') {
        typeParam = 'rent';
      }
      // 'shortlet' could be a type of rent.
      if (searchType === 'shortlet') {
        typeParam = 'rent'; 
      }
      params.set('type', typeParam)
      
      router.push(`/search?${params.toString()}`)
    }
  
    return (
      <form onSubmit={handleSearch} className="w-full">
        <div className="bg-white rounded-xl p-2 shadow-lg">
            <div className="flex flex-col md:flex-row gap-2">
                <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-full md:w-[150px] text-black border-0 focus:ring-0 rounded-lg">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                        <SelectItem value="shortlet">Shortlet</SelectItem>
                    </SelectContent>
                </Select>
                
                <div className="flex-1 relative">
                    <AutocompleteSearch
                        allLocations={allLocations}
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search Lagos, Abuja, Port Harcourt..."
                        className="h-10 text-base bg-white text-foreground border-0 md:border-l rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                
                <Button
                    type="submit"
                    size="lg"
                    className="flex items-center justify-center gap-2"
                >
                    <Search size={20} />
                    <span>Search</span>
                </Button>
            </div>
        </div>
      </form>
    )
  }

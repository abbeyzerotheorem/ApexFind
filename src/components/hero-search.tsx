'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AutocompleteSearch from './autocomplete-search';
import allStatesWithLgas from "@/jsons/nigeria-states.json";
import { cn } from '@/lib/utils';

const allLocations = allStatesWithLgas.flatMap(state => [state.name, ...state.lgas]);

const statsData = [
    { target: 10000, suffix: '+', label: 'Properties Listed' },
    { target: 500, suffix: '+', label: 'Verified Agents' },
    { target: 2000, suffix: '+', label: 'Happy Clients' },
]

const heroSliderImages = [
    PlaceHolderImages.find(p => p.id === 'hero-background'),
    PlaceHolderImages.find(p => p.id === 'property-4'),
    PlaceHolderImages.find(p => p.id === 'property-5'),
    PlaceHolderImages.find(p => p.id === 'property-2'),
].filter(Boolean);

function AnimatedCounter({ value, duration = 2000 }: { value: number, duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export default function HeroSearch() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroSliderImages.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex items-center justify-center py-24 text-white sm:py-32 lg:py-48 overflow-hidden min-h-[650px]">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {heroSliderImages.map((image, index) => (
          <div
            key={image?.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            )}
          >
            {image && (
              <div className={cn(
                "relative w-full h-full",
                index === currentImageIndex && "animate-zoom-out"
              )}>
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  data-ai-hint={image.imageHint}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-md leading-[1.1]">
          The Smartest Way to Find <br className="hidden md:block" /> a Home in Nigeria
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-gray-200 md:text-xl font-medium drop-shadow-md">
           Access exclusive listings, data-driven insights, and top-rated agents—all in one place.
        </p>

        <div className="mt-10 w-full max-w-4xl">
          <SearchBar />
        </div>
        
        <div className="mt-12 w-full max-w-4xl">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-12">
                {statsData.map((stat) => (
                    <div key={stat.label} className="text-center">
                        <p className="text-3xl sm:text-4xl font-black text-white">
                          <AnimatedCounter value={stat.target} />
                          {stat.suffix}
                        </p>
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-300 opacity-90">{stat.label}</p>
                    </div>
                ))}
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
      if (searchType === 'shortlet') {
        typeParam = 'rent'; 
      }
      params.set('type', typeParam)
      
      router.push(`/search?${params.toString()}`)
    }
  
    return (
      <form onSubmit={handleSearch} className="w-full">
        <div className="bg-white rounded-2xl p-2 shadow-2xl border border-white/20 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-2">
                <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-full md:w-[160px] text-black border-0 focus:ring-0 rounded-xl h-12 font-bold text-base bg-muted/50">
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
                        className="h-12 text-base bg-transparent text-foreground border-0 md:border-l rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                
                <Button
                    type="submit"
                    size="lg"
                    className="flex items-center justify-center gap-2 h-12 px-8 font-black text-lg rounded-xl shadow-lg"
                >
                    <Search size={22} className="stroke-[3]" />
                    <span>Search</span>
                </Button>
            </div>
        </div>
      </form>
    )
  }
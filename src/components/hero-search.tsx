'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';

export default function HeroSearch() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');

  return (
    <section className="relative flex items-center justify-center py-20 text-white">
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
          Find Your Dream Home
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-200">
          Discover the perfect property from thousands of listings
        </p>

        <div className="mt-8 w-full max-w-4xl">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}

function SearchBar() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchType, setSearchType] = React.useState('buy');
  
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchTerm.trim()) return
      
      const params = new URLSearchParams({
        q: searchTerm,
        type: searchType
      })
      
      router.push(`/search?${params.toString()}`)
    }
  
    return (
      <form onSubmit={handleSearch} className="w-full">
        <div className="flex flex-col md:flex-row gap-2">
          {/* Search Type Toggle */}
          <div className="flex-shrink-0">
            <Button
              type="button"
              onClick={() => setSearchType('buy')}
              variant={searchType === 'buy' ? 'default' : 'secondary'}
              size="lg"
              className="rounded-r-none"
            >
              Buy
            </Button>
            <Button
              type="button"
              onClick={() => setSearchType('rent')}
              variant={searchType === 'rent' ? 'default' : 'secondary'}
              size="lg"
              className="rounded-l-none"
            >
              Rent
            </Button>
          </div>
  
          {/* Search Input */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter city, neighborhood, or address"
              className="w-full h-full text-base bg-background text-foreground pl-12 pr-4 rounded-md"
            />
          </div>
  
          {/* Search Button */}
          <Button
            type="submit"
            size="lg"
            className="flex items-center justify-center gap-2"
          >
            <Search size={20} />
            <span>Search</span>
          </Button>
        </div>
      </form>
    )
  }

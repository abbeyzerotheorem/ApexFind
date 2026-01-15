'use client';

import { suggestLocations } from '@/ai/ai-property-suggestions';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from './ui/input';

export default function AutocompleteSearch({
  allLocations,
  initialValue = '',
}: {
  allLocations: string[];
  initialValue?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async () => {
    if (debouncedQuery.length > 1) {
      setIsLoading(true);
      try {
        const result = await suggestLocations({
          query: debouncedQuery,
          existingLocations: allLocations,
        });
        setSuggestions(result.suggestions);
        setIsOpen(result.suggestions.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [debouncedQuery, allLocations]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  }

  return (
    <div className="relative w-full flex-grow" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        placeholder="Enter an address, neighborhood, city, or area"
        className="w-full pl-10 text-base"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(suggestions.length > 0)}
        autoComplete="off"
      />
      {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />}
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="cursor-pointer px-4 py-2 hover:bg-accent"
                onClick={() => handleSelect(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
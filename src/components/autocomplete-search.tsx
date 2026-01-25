'use client';

import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from './ui/input';

export default function AutocompleteSearch({
  allLocations,
  value,
  onChange,
  className,
  placeholder,
}: {
  allLocations: string[];
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(value, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(() => {
    if (debouncedQuery.length > 1) {
      const filteredSuggestions = allLocations
        .filter((location) =>
          location.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
      setIsOpen(filteredSuggestions.length > 0);
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
    onChange(suggestion);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
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
        placeholder={placeholder || "Enter an address, neighborhood, city, or area"}
        className={cn("w-full pl-10 text-base", className)}
        value={value}
        onChange={handleInputChange}
        onFocus={() => debouncedQuery && setIsOpen(suggestions.length > 0)}
        autoComplete="off"
      />
      
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

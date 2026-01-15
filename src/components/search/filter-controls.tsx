
'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type FilterControlsProps = {
    minPrice: number;
    maxPrice: number;
    beds: string;
    baths: string;
}

export function FilterControls({ minPrice: initialMin, maxPrice: initialMax, beds: initialBeds, baths: initialBaths }: FilterControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [minPrice, setMinPrice] = React.useState(initialMin);
    const [maxPrice, setMaxPrice] = React.useState(initialMax);
    const [beds, setBeds] = React.useState(initialBeds);
    const [baths, setBaths] = React.useState(initialBaths);

    const handlePriceChange = (value: number[]) => {
        setMinPrice(value[0]);
        setMaxPrice(value[1]);
    }
    
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minPrice > 0) {
            params.set('minPrice', String(minPrice));
        } else {
            params.delete('minPrice');
        }

        if (maxPrice < 500000000) {
            params.set('maxPrice', String(maxPrice));
        } else {
            params.delete('maxPrice');
        }

        if (beds !== 'any') {
            params.set('beds', beds);
        } else {
            params.delete('beds');
        }

        if (baths !== 'any') {
            params.set('baths', baths);
        } else {
            params.delete('baths');
        }

        router.push(`${pathname}?${params.toString()}`);
    }

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('minPrice');
        params.delete('maxPrice');
        params.delete('beds');
        params.delete('baths');
        router.push(`${pathname}?${params.toString()}`);
    }

    const bedOptions = ["any", "1", "2", "3", "4", "5+"];
    const bathOptions = ["any", "1", "2", "3", "4", "5+"];

    return (
        <div className="space-y-6 py-4">
             <Accordion type="multiple" defaultValue={['price', 'beds-baths']}>
                <AccordionItem value="price">
                    <AccordionTrigger>Price (₦)</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                             <div className="flex justify-between text-sm text-muted-foreground">
                                <span>₦{minPrice.toLocaleString()}</span>
                                <span>₦{maxPrice.toLocaleString()}{maxPrice === 500000000 ? '+' : ''}</span>
                            </div>
                            <Slider 
                                value={[minPrice, maxPrice]} 
                                onValueChange={handlePriceChange}
                                max={500000000} 
                                step={1000000} 
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="beds-baths">
                    <AccordionTrigger>Beds & Baths</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div>
                                <Label>Beds</Label>
                                <ToggleGroup type="single" value={beds} onValueChange={(value) => value && setBeds(value)} className="flex-wrap justify-start mt-2">
                                    {bedOptions.map(option => (
                                        <ToggleGroupItem key={`bed-${option}`} value={option} aria-label={`${option} beds`} className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                           {option === 'any' ? 'Any' : `${option}${option === "5+" ? "" : "+"}`}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                            <div>
                                <Label>Baths</Label>
                                 <ToggleGroup type="single" value={baths} onValueChange={(value) => value && setBaths(value)} className="flex-wrap justify-start mt-2">
                                    {bathOptions.map(option => (
                                        <ToggleGroupItem key={`bath-${option}`} value={option} aria-label={`${option} baths`} className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                           {option === 'any' ? 'Any' : `${option}${option === "5+" ? "" : "+"}`}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="home-type">
                    <AccordionTrigger>Home Type</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><Checkbox id="ht-house"/> <Label htmlFor="ht-house">House</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="ht-condo"/> <Label htmlFor="ht-condo">Apartment (Flat)</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="ht-townhouse"/> <Label htmlFor="ht-townhouse">Duplex</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="ht-multifamily"/> <Label htmlFor="ht-multifamily">Terrace</Label></div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sqft">
                    <AccordionTrigger>Square Feet</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex gap-2">
                            <Input placeholder="Min" />
                            <Input placeholder="Max" />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="lot-size">
                    <AccordionTrigger>Plot Size (sqm)</AccordionTrigger>
                    <AccordionContent>
                        <Input placeholder="e.g. 1000 sqm" />
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="year-built">
                    <AccordionTrigger>Year Built</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex gap-2">
                            <Input placeholder="Min" />
                            <Input placeholder="Max" />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="features">
                    <AccordionTrigger>Unique Features</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><Checkbox id="feat-pool"/> <Label htmlFor="feat-pool">Pool</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="feat-waterfront"/> <Label htmlFor="feat-waterfront">Borehole</Label></div>
                             <div className="flex items-center gap-2"><Checkbox id="feat-garage"/> <Label htmlFor="feat-garage">Generator</Label></div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="keywords">
                    <AccordionTrigger>Keywords</AccordionTrigger>
                    <AccordionContent>
                        <Input placeholder="e.g. serviced apartment" />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={clearFilters}>Clear</Button>
                <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
        </div>
    )
}

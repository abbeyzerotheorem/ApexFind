
'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { formatNairaShort } from "@/lib/naira-formatter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type FilterControlsProps = {
    minPrice: number;
    maxPrice: number;
    beds: string;
    baths: string;
    homeTypes: string[];
    features: string[];
    minSqft: number;
    maxSqft: number;
    keywords: string;
}

const homeTypeOptions = ["House", "Apartment (Flat)", "Duplex", "Terrace", "Bungalow", "Commercial", "Land"];
const featureOptions = [
    { id: "furnished", label: "Furnished" },
    { id: "pool", label: "Swimming Pool" },
    { id: "parking", label: "Parking Space" },
    { id: "generator", label: "Generator" },
    { id: "borehole", label: "Borehole" },
    { id: "gated", label: "Gated Estate" },
];

export function FilterControls({ 
    minPrice: initialMin, 
    maxPrice: initialMax, 
    beds: initialBeds, 
    baths: initialBaths, 
    homeTypes: initialHomeTypes,
    features: initialFeatures,
    minSqft: initialMinSqft,
    maxSqft: initialMaxSqft,
    keywords: initialKeywords,
}: FilterControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [minPrice, setMinPrice] = React.useState(initialMin);
    const [maxPrice, setMaxPrice] = React.useState(initialMax);
    const [beds, setBeds] = React.useState(initialBeds);
    const [baths, setBaths] = React.useState(initialBaths);
    const [selectedHomeTypes, setSelectedHomeTypes] = React.useState<string[]>(initialHomeTypes);
    const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>(initialFeatures);
    const [minSqft, setMinSqft] = React.useState(initialMinSqft);
    const [maxSqft, setMaxSqft] = React.useState(initialMaxSqft);
    const [keywords, setKeywords] = React.useState(initialKeywords);


    const handlePriceChange = (value: number[]) => {
        setMinPrice(value[0]);
        setMaxPrice(value[1]);
    }

    const handleHomeTypeChange = (type: string) => {
        const newSelectedTypes = selectedHomeTypes.includes(type)
            ? selectedHomeTypes.filter(t => t !== type)
            : [...selectedHomeTypes, type];
        setSelectedHomeTypes(newSelectedTypes);
    }

    const handleFeatureChange = (featureId: string) => {
        const newSelectedFeatures = selectedFeatures.includes(featureId)
            ? selectedFeatures.filter(f => f !== featureId)
            : [...selectedFeatures, featureId];
        setSelectedFeatures(newSelectedFeatures);
    }
    
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minPrice > 0) params.set('minPrice', String(minPrice)); else params.delete('minPrice');
        if (maxPrice < 500000000) params.set('maxPrice', String(maxPrice)); else params.delete('maxPrice');
        if (beds !== 'any') params.set('beds', beds); else params.delete('beds');
        if (baths !== 'any') params.set('baths', baths); else params.delete('baths');
        if (selectedHomeTypes.length > 0) params.set('homeTypes', selectedHomeTypes.join(',')); else params.delete('homeTypes');
        if (selectedFeatures.length > 0) params.set('features', selectedFeatures.join(',')); else params.delete('features');
        if (minSqft > 0) params.set('minSqft', String(minSqft)); else params.delete('minSqft');
        if (maxSqft > 0) params.set('maxSqft', String(maxSqft)); else params.delete('maxSqft');
        if (keywords) params.set('keywords', keywords); else params.delete('keywords');

        router.push(`${pathname}?${params.toString()}`);
    }

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('minPrice');
        params.delete('maxPrice');
        params.delete('beds');
        params.delete('baths');
        params.delete('homeTypes');
        params.delete('features');
        params.delete('minSqft');
        params.delete('maxSqft');
        params.delete('keywords');
        router.push(`${pathname}?${params.toString()}`);
    }

    const bedOptions = ["any", "1", "2", "3", "4", "5+"];
    const bathOptions = ["any", "1", "2", "3", "4", "5+"];

    return (
        <div className="space-y-6 py-4">
             <Accordion type="multiple" defaultValue={['price', 'beds-baths', 'home-type', 'features']}>
                <AccordionItem value="price">
                    <AccordionTrigger>Price</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                             <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{formatNairaShort(minPrice)}</span>
                                <span>{formatNairaShort(maxPrice)}{maxPrice === 500000000 ? '+' : ''}</span>
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
                                           {option === 'any' ? 'Any' : `${option}${option.includes('+') ? '' : '+'}`}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                            <div>
                                <Label>Baths</Label>
                                 <ToggleGroup type="single" value={baths} onValueChange={(value) => value && setBaths(value)} className="flex-wrap justify-start mt-2">
                                    {bathOptions.map(option => (
                                        <ToggleGroupItem key={`bath-${option}`} value={option} aria-label={`${option} baths`} className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                           {option === 'any' ? 'Any' : `${option}${option.includes('+') ? '' : '+'}`}
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
                        <div className="grid grid-cols-2 gap-2">
                            {homeTypeOptions.map(type => (
                                <div key={type} className="flex items-center gap-2">
                                    <Checkbox 
                                        id={`ht-${type}`} 
                                        checked={selectedHomeTypes.includes(type)}
                                        onCheckedChange={() => handleHomeTypeChange(type)}
                                    /> 
                                    <Label htmlFor={`ht-${type}`} className="font-normal">{type}</Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="features">
                    <AccordionTrigger>Features</AccordionTrigger>
                    <AccordionContent>
                         <div className="space-y-2">
                            {featureOptions.map(feature => (
                                <div key={feature.id} className="flex items-center gap-2">
                                    <Checkbox 
                                        id={`feat-${feature.id}`}
                                        checked={selectedFeatures.includes(feature.id)}
                                        onCheckedChange={() => handleFeatureChange(feature.id)}
                                    />
                                    <Label htmlFor={`feat-${feature.id}`} className="font-normal">{feature.label}</Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sqft">
                    <AccordionTrigger>Square Feet</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex gap-2 items-center">
                            <Input placeholder="Min" type="number" value={minSqft || ''} onChange={(e) => setMinSqft(Number(e.target.value))} />
                            <span>-</span>
                            <Input placeholder="Max" type="number" value={maxSqft || ''} onChange={(e) => setMaxSqft(Number(e.target.value))} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="keywords">
                    <AccordionTrigger>Keywords</AccordionTrigger>
                    <AccordionContent>
                        <Input placeholder="e.g. serviced apartment, ocean view" value={keywords} onChange={(e) => setKeywords(e.target.value)}/>
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

    
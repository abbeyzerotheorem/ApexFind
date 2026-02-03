'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatNairaShort } from "@/lib/naira-formatter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
    listingType: string | null;
    furnishing: string;
    pricePeriods: string[];
}

const homeTypeOptions = ["House", "Apartment (Flat)", "Duplex", "Terrace", "Bungalow", "Commercial", "Land"];

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
    listingType,
    furnishing: initialFurnishing,
    pricePeriods: initialPricePeriods
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
    const [furnishing, setFurnishing] = React.useState(initialFurnishing);
    const [selectedPricePeriods, setSelectedPricePeriods] = React.useState<string[]>(initialPricePeriods);

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

    const handlePricePeriodChange = (period: string) => {
        const newSelectedPeriods = selectedPricePeriods.includes(period)
            ? selectedPricePeriods.filter(p => p !== period)
            : [...selectedPricePeriods, period];
        setSelectedPricePeriods(newSelectedPeriods);
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
        
        if (listingType === 'rent') {
            if (furnishing !== 'any') params.set('furnishing', furnishing); else params.delete('furnishing');
            if (selectedPricePeriods.length > 0) params.set('pricePeriods', selectedPricePeriods.join(',')); else params.delete('pricePeriods');
        }

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
        params.delete('furnishing');
        params.delete('pricePeriods');
        router.push(`${pathname}?${params.toString()}`);
    }

    const bedOptions = ["any", "1", "2", "3", "4", "5+"];
    const bathOptions = ["any", "1", "2", "3", "4", "5+"];
    const pricePeriodOptions = ["monthly", "quarterly", "yearly"];

    const baseFeatureOptions = [
        { id: "pool", label: "Swimming Pool" },
        { id: "parking", label: "Parking Space" },
        { id: "generator", label: "Generator" },
        { id: "borehole", label: "Borehole" },
        { id: "gated", label: "Gated Estate" },
    ];
    
    const featureOptions = listingType !== 'rent' 
        ? [{ id: "furnished", label: "Furnished" }, ...baseFeatureOptions]
        : baseFeatureOptions;

    return (
        <div className="space-y-8">
             <Accordion type="multiple" defaultValue={['price', 'beds-baths', 'home-type', 'features', 'furnishing', 'price-period']} className="w-full">
                <AccordionItem value="price" className="border-none">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">Price Range</AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <div className="space-y-6">
                             <div className="flex justify-between items-center px-1">
                                <span className="text-sm font-semibold">{formatNairaShort(minPrice)}</span>
                                <span className="text-sm font-semibold">{formatNairaShort(maxPrice)}{maxPrice === 500000000 ? '+' : ''}</span>
                            </div>
                            <Slider 
                                value={[minPrice, maxPrice]} 
                                onValueChange={handlePriceChange}
                                max={500000000} 
                                step={1000000} 
                                className="my-2"
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                 {listingType === 'rent' && (
                    <>
                        <AccordionItem value="furnishing" className="border-none">
                            <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">Furnishing</AccordionTrigger>
                            <AccordionContent className="pt-2">
                                <ToggleGroup type="single" value={furnishing} onValueChange={(value) => value && setFurnishing(value)} className="justify-start gap-2">
                                    <ToggleGroupItem value="any" className="px-4 rounded-full border">Any</ToggleGroupItem>
                                    <ToggleGroupItem value="furnished" className="px-4 rounded-full border">Furnished</ToggleGroupItem>
                                    <ToggleGroupItem value="unfurnished" className="px-4 rounded-full border">Unfurnished</ToggleGroupItem>
                                </ToggleGroup>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="price-period" className="border-none">
                            <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">Rent Frequency</AccordionTrigger>
                            <AccordionContent className="pt-2">
                                <div className="grid grid-cols-1 gap-3">
                                    {pricePeriodOptions.map(period => (
                                        <div key={period} className="flex items-center space-x-3 bg-muted/30 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <Checkbox 
                                                id={`pp-${period}`} 
                                                checked={selectedPricePeriods.includes(period)}
                                                onCheckedChange={() => handlePricePeriodChange(period)}
                                            /> 
                                            <Label htmlFor={`pp-${period}`} className="flex-1 cursor-pointer font-medium capitalize">{period}</Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </>
                )}

                <AccordionItem value="beds-baths" className="border-none">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">Rooms</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                        <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Bedrooms</Label>
                            <ToggleGroup type="single" value={beds} onValueChange={(value) => value && setBeds(value)} className="justify-start gap-2">
                                {bedOptions.map(option => (
                                    <ToggleGroupItem key={`bed-${option}`} value={option} className="h-10 w-10 p-0 rounded-md border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                       {option === 'any' ? 'Any' : option}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Bathrooms</Label>
                             <ToggleGroup type="single" value={baths} onValueChange={(value) => value && setBaths(value)} className="justify-start gap-2">
                                {bathOptions.map(option => (
                                    <ToggleGroupItem key={`bath-${option}`} value={option} className="h-10 w-10 p-0 rounded-md border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                       {option === 'any' ? 'Any' : option}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="home-type" className="border-none">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">Property Type</AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <div className="grid grid-cols-1 gap-2">
                            {homeTypeOptions.map(type => (
                                <div key={type} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30">
                                    <Checkbox 
                                        id={`ht-${type}`} 
                                        checked={selectedHomeTypes.includes(type)}
                                        onCheckedChange={() => handleHomeTypeChange(type)}
                                    /> 
                                    <Label htmlFor={`ht-${type}`} className="flex-1 cursor-pointer font-medium">{type}</Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="features" className="border-none">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">Key Features</AccordionTrigger>
                    <AccordionContent className="pt-2">
                         <div className="grid grid-cols-1 gap-2">
                            {featureOptions.map(feature => (
                                <div key={feature.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30">
                                    <Checkbox 
                                        id={`feat-${feature.id}`}
                                        checked={selectedFeatures.includes(feature.id)}
                                        onCheckedChange={() => handleFeatureChange(feature.id)}
                                    />
                                    <Label htmlFor={`feat-${feature.id}`} className="flex-1 cursor-pointer font-medium">{feature.label}</Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sqft" className="border-none">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">Area Size (sqft)</AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <div className="flex gap-3 items-center">
                            <Input placeholder="Min" type="number" className="h-10" value={minSqft || ''} onChange={(e) => setMinSqft(Number(e.target.value))} />
                            <span className="text-muted-foreground">to</span>
                            <Input placeholder="Max" type="number" className="h-10" value={maxSqft || ''} onChange={(e) => setMaxSqft(Number(e.target.value))} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="keywords" className="border-none">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">Keywords</AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <Input placeholder="e.g. serviced, swimming pool" className="h-10" value={keywords} onChange={(e) => setKeywords(e.target.value)}/>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex flex-col gap-3 pt-6 border-t">
                <Button onClick={applyFilters} className="w-full h-11 font-bold">Apply Filters</Button>
                <Button variant="ghost" onClick={clearFilters} className="w-full h-11 text-muted-foreground">Reset All</Button>
            </div>
        </div>
    )
}

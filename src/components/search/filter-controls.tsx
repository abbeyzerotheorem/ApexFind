
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

type FilterControlsProps = {
    minPrice: number;
    maxPrice: number;
}

export function FilterControls({ minPrice: initialMin, maxPrice: initialMax }: FilterControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [minPrice, setMinPrice] = React.useState(initialMin);
    const [maxPrice, setMaxPrice] = React.useState(initialMax);

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
        router.push(`${pathname}?${params.toString()}`);
    }

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('minPrice');
        params.delete('maxPrice');
        router.push(`${pathname}?${params.toString()}`);
    }

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
                                <RadioGroup defaultValue="any" className="flex gap-2 mt-2">
                                    <Button variant="outline">Any</Button>
                                    <Button variant="outline">1+</Button>
                                    <Button variant="outline">2+</Button>
                                    <Button variant="outline">3+</Button>
                                    <Button variant="outline">4+</Button>
                                </RadioGroup>
                            </div>
                            <div>
                                <Label>Baths</Label>
                                <RadioGroup defaultValue="any" className="flex gap-2 mt-2">
                                    <Button variant="outline">Any</Button>
                                    <Button variant="outline">1+</Button>
                                    <Button variant="outline">2+</Button>
                                    <Button variant="outline">3+</Button>
                                    <Button variant="outline">4+</Button>
                                </RadioGroup>
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

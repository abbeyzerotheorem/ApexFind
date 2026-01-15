import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

export function FilterControls() {
    return (
        <div className="space-y-6 py-4">
             <Accordion type="multiple" defaultValue={['price', 'beds-baths']}>
                <AccordionItem value="price">
                    <AccordionTrigger>Price</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input placeholder="Min" />
                                <Input placeholder="Max" />
                            </div>
                            <Slider defaultValue={[250000, 750000]} max={1000000} step={10000} />
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
                            <div className="flex items-center gap-2"><Checkbox id="ht-condo"/> <Label htmlFor="ht-condo">Condo</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="ht-townhouse"/> <Label htmlFor="ht-townhouse">Townhouse</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="ht-multifamily"/> <Label htmlFor="ht-multifamily">Multi-family</Label></div>
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
                    <AccordionTrigger>Lot Size</AccordionTrigger>
                    <AccordionContent>
                        <Input placeholder="e.g. 2 acres" />
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
                            <div className="flex items-center gap-2"><Checkbox id="feat-waterfront"/> <Label htmlFor="feat-waterfront">Waterfront</Label></div>
                             <div className="flex items-center gap-2"><Checkbox id="feat-garage"/> <Label htmlFor="feat-garage">Garage</Label></div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="keywords">
                    <AccordionTrigger>Keywords</AccordionTrigger>
                    <AccordionContent>
                        <Input placeholder="e.g. granite countertops" />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-end gap-2">
                <Button variant="ghost">Clear</Button>
                <Button>Apply Filters</Button>
            </div>
        </div>
    )
}
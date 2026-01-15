
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderProperties } from '@/lib/placeholder-properties';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { BedDouble, Bath, Maximize, Calendar, Car, Home, Droplet, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heart, Share2, MapPin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PropertyCard } from '@/components/property-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MediaGallery } from '@/components/property/media-gallery';

const similarProperties = PlaceHolderProperties.slice(1, 4);

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const property = PlaceHolderProperties.find(p => p.id.toString() === params.id);
  const mapImage = PlaceHolderImages.find((img) => img.id === "market-map");

  if (!property) {
    notFound();
  }
  
  const propertyImages = [
      property.imageUrl,
      ...PlaceHolderProperties.map(p => p.imageUrl).slice(1, 4)
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <MediaGallery images={propertyImages} />

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              
              {/* Summary & Action Bar */}
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{property.address}</h1>
                        <p className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                            ₦{property.price.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">Est. Payment: ₦{(property.price / 120).toLocaleString()}/mo</p>
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                        <Button variant="outline" size="icon"><Heart className="h-5 w-5" /></Button>
                        <Button variant="outline" size="icon"><Share2 className="h-5 w-5" /></Button>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-border pt-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <BedDouble className="h-6 w-6 text-primary" />
                        <div>
                            <span className="font-bold text-foreground">{property.beds}</span>
                            <span className="text-sm"> beds</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bath className="h-6 w-6 text-primary" />
                        <div>
                            <span className="font-bold text-foreground">{property.baths}</span>
                            <span className="text-sm"> baths</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Maximize className="h-6 w-6 text-primary" />
                        <div>
                            <span className="font-bold text-foreground">{property.sqft.toLocaleString()}</span>
                            <span className="text-sm"> sqft</span>
                        </div>
                    </div>
                    {property.lotSize && <div className="flex items-center gap-2">
                        <Home className="h-6 w-6 text-primary" />
                        <div>
                            <span className="font-bold text-foreground">{property.lotSize}</span>
                            <span className="text-sm"> acre lot</span>
                        </div>
                    </div>}
                </div>
                 <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button size="lg" className="w-full sm:w-auto flex-1">Schedule a Tour</Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto flex-1">Contact Agent</Button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-foreground">About this home</h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Discover luxury living in this stunning {property.beds}-bedroom, {property.baths}-bathroom {property.type.toLowerCase()} located in the heart of {property.address.split(',')[1]}. Spanning {property.sqft.toLocaleString()} square feet, this home offers an open-concept living space perfect for both relaxation and entertaining. The gourmet kitchen features state-of-the-art appliances and custom cabinetry. The master suite is a private oasis with a spa-like ensuite bathroom. Enjoy the Nigerian sun in your private outdoor space. This property combines modern elegance with comfort, making it the perfect place to call home.
                </p>
                 <ul className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <li className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-primary" /> Open Floor Plan</li>
                    <li className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-primary" /> Gourmet Kitchen</li>
                    <li className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-primary" /> Private Balcony</li>
                    <li className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-primary" /> 24/7 Security</li>
                </ul>
              </div>

              {/* Detailed Facts & Features */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground">Facts and features</h2>
                <Accordion type="multiple" defaultValue={['property-facts']} className="mt-4 w-full">
                  <AccordionItem value="property-facts">
                    <AccordionTrigger className="text-lg font-semibold">Property Facts</AccordionTrigger>
                    <AccordionContent className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-3"><Home className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Type</div><div className="font-medium">{property.type}</div></div></div>
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Year Built</div><div className="font-medium">2021</div></div></div>
                        <div className="flex items-center gap-3"><Car className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Parking</div><div className="font-medium">2-Car Garage</div></div></div>
                        <div className="flex items-center gap-3"><Droplet className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Water</div><div className="font-medium">Borehole</div></div></div>
                        <div className="flex items-center gap-3"><Wind className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Cooling</div><div className="font-medium">Air Conditioning</div></div></div>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="financial">
                    <AccordionTrigger className="text-lg font-semibold">Financial & Tax</AccordionTrigger>
                    <AccordionContent className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-3"><Home className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Price/sqft</div><div className="font-medium">₦{(property.price / property.sqft).toLocaleString()}</div></div></div>
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">HOA Dues</div><div className="font-medium">₦50,000/month</div></div></div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

               {/* Map & Neighborhood */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-foreground">Location</h2>
                    {mapImage && (
                        <div className="mt-4 relative h-96 w-full overflow-hidden rounded-lg">
                            <Image
                                src={mapImage.imageUrl}
                                alt={mapImage.description}
                                data-ai-hint={mapImage.imageHint}
                                fill
                                className="object-cover"
                            />
                             <div className="absolute bottom-4 left-4 rounded-lg bg-background p-3 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <p className="font-semibold text-foreground">{property.address}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Contact Agent Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-bold text-foreground">Contact Agent</h3>
                <form className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" type="text" placeholder="Your Name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="Your Phone Number" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" defaultValue={`I am interested in ${property.address}.`} />
                  </div>
                  <Button type="submit" className="w-full">Contact Agent</Button>
                  <p className="text-center text-xs text-muted-foreground">
                    By pressing Contact Agent, you agree to our Terms of Use & Privacy Policy.
                  </p>
                </form>
              </div>
            </div>
          </div>

           {/* Similar Homes */}
            <div className="mt-16">
                <h2 className="text-3xl font-bold text-foreground">Similar Homes</h2>
                 <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {similarProperties.map((p) => (
                        <PropertyCard key={p.id} property={p} />
                    ))}
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { BedDouble, Bath, Maximize, Calendar, Car, Home, Droplet, Wind, Heart, Share2, MapPin, Zap, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PropertyCard } from '@/components/property-card';
import { MediaGallery } from '@/components/property/media-gallery';
import { formatNaira } from '@/lib/naira-formatter';
import { Badge } from '@/components/ui/badge';
import { TrackView } from '@/components/property/track-view';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { useMemo, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PropertyDetailsPage({ id }: { id: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [geocodingLoading, setGeocodingLoading] = useState(true);

  const propertyRef = useMemo(() => {
      if (!firestore) return null;
      return doc(firestore, 'properties', id);
  }, [firestore, id]);

  const { data: property, loading } = useDoc(propertyRef);

  useEffect(() => {
    if (property && property.address) {
        const fetchCoordinates = async () => {
            try {
                setGeocodingLoading(true);
                const fullAddress = `${property.address}, ${property.city}, ${property.state}`;
                const response = await fetch(`/api/nigeria/geocode?address=${encodeURIComponent(fullAddress)}`);
                if (!response.ok) {
                    throw new Error('Geocoding request failed');
                }
                const data = await response.json();
                if (data.coordinates) {
                    setCoordinates(data.coordinates);
                } else {
                    setCoordinates(null);
                }
            } catch (error) {
                console.error("Failed to fetch coordinates", error);
                setCoordinates(null);
            } finally {
                setGeocodingLoading(false);
            }
        };
        fetchCoordinates();
    } else if (!loading) {
        // If there's no property or address after loading, stop loading.
        setGeocodingLoading(false);
    }
  }, [property, loading]);

  const savedHomeRef = useMemo(() => {
      if (!user || !firestore || !property) return null;
      return doc(firestore, `users/${user.uid}/saved_homes`, String(property.id));
  }, [user, firestore, property]);

  useEffect(() => {
    if (!savedHomeRef) {
        setIsSaved(false);
        return;
    };

    const checkIsSaved = async () => {
        const docSnap = await getDoc(savedHomeRef);
        setIsSaved(docSnap.exists());
    };
    checkIsSaved();
  }, [savedHomeRef]);

  const handleToggleSave = async () => {
    if (!user) {
        setShowAuthDialog(true);
        return;
    }
    if (!savedHomeRef || !property) return;

    if (isSaved) {
        await deleteDoc(savedHomeRef);
        setIsSaved(false);
    } else {
        await setDoc(savedHomeRef, { property_data: property, saved_at: serverTimestamp() });
        setIsSaved(true);
    }
  };
  
  const handleProtectedAction = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setShowAuthDialog(true);
    }
    // For now, a logged in user just gets a console log.
    // A real app would open a scheduling modal or submit the form.
    else {
        console.log("Protected action triggered by logged-in user.");
        // In a real app, you would handle form submission here.
    }
  };

  if (loading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h1 className="text-xl text-muted-foreground">Loading Property Details...</h1>
        </div>
    );
  }

  if (!property) {
    notFound();
  }
  
  const propertyImages = [
      property.imageUrl
  ];
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.address,
    "image": propertyImages,
    "description": `Stunning ${property.beds}-bedroom, ${property.baths}-bathroom ${property.home_type.toLowerCase()} in ${property.city}.`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": property.city,
      "addressRegion": property.state,
      "addressCountry": "NG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": coordinates?.lat || "0.0",
      "longitude": coordinates?.lng || "0.0"
    },
    "numberOfRooms": property.beds,
    "numberOfBathroomsTotal": property.baths,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.sqft,
      "unitCode": "FTS"
    },
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "NGN",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background py-8 sm:py-12">
       <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <MediaGallery images={propertyImages} propertyAddress={property.address} />

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              
              {/* Summary & Action Bar */}
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{property.address}</h1>
                        <p className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                            {formatNaira(property.price)}
                            {property.listing_type === 'rent' && property.price_period && (
                              <span className="text-xl font-medium text-muted-foreground">/{property.price_period}</span>
                            )}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">Est. Payment: {formatNaira(property.price / 120)}/mo</p>
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                        <Button variant="outline" size="icon" onClick={handleToggleSave} aria-label={isSaved ? "Unsave property" : "Save property"}>
                            <Heart className={cn("h-5 w-5", isSaved && "fill-destructive text-destructive")} />
                        </Button>
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
                    <Button size="lg" className="w-full sm:w-auto flex-1" onClick={handleProtectedAction}>Schedule a Tour</Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto flex-1" onClick={handleProtectedAction}>Contact Agent</Button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-foreground">About this home</h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Discover luxury living in this stunning ${property.beds}-bedroom, ${property.baths}-bathroom ${property.home_type.toLowerCase()} located in the heart of ${property.city}. Spanning ${property.sqft.toLocaleString()} square feet, this home offers an open-concept living space perfect for both relaxation and entertaining. The gourmet kitchen features state-of-the-art appliances and custom cabinetry. The master suite is a private oasis with a spa-like ensuite bathroom. Enjoy the Nigerian sun in your private outdoor space. This property combines modern elegance with comfort, making it the perfect place to call home.
                </p>
                 <div className="mt-6 flex flex-wrap gap-3">
                    {property.is_furnished && <Badge variant="secondary">Furnished</Badge>}
                    {property.power_supply && <Badge variant="secondary" className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> {property.power_supply}</Badge>}
                    {property.water_supply && <Badge variant="secondary" className="flex items-center gap-1.5"><Droplet className="h-3 w-3" /> {property.water_supply}</Badge>}
                    {property.security_type && property.security_type.length > 0 && <Badge variant="secondary" className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Security</Badge>}
                </div>
              </div>

              {/* Detailed Facts & Features */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground">Facts and features</h2>
                <Accordion type="multiple" defaultValue={['property-facts']} className="mt-4 w-full">
                  <AccordionItem value="property-facts">
                    <AccordionTrigger className="text-lg font-semibold">Property Facts</AccordionTrigger>
                    <AccordionContent className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-3"><Home className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Type</div><div className="font-medium">{property.home_type}</div></div></div>
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Year Built</div><div className="font-medium">2021</div></div></div>
                        <div className="flex items-center gap-3"><Car className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Parking</div><div className="font-medium">2-Car Garage</div></div></div>
                        <div className="flex items-center gap-3"><Droplet className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Water</div><div className="font-medium">{property.water_supply}</div></div></div>
                        <div className="flex items-center gap-3"><Zap className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Power</div><div className="font-medium">{property.power_supply}</div></div></div>
                        <div className="flex items-center gap-3"><Wind className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Cooling</div><div className="font-medium">Air Conditioning</div></div></div>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="financial">
                    <AccordionTrigger className="text-lg font-semibold">Financial & Tax</AccordionTrigger>
                    <AccordionContent className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-3"><Home className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">Price/sqft</div><div className="font-medium">{formatNaira(property.price / property.sqft)}</div></div></div>
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary"/><div><div className="text-xs text-muted-foreground">HOA Dues</div><div className="font-medium">{formatNaira(50000)}/month</div></div></div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

               {/* Map & Neighborhood */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-foreground">Location</h2>
                    <div className="mt-4 relative h-96 w-full overflow-hidden rounded-lg border bg-muted">
                        {geocodingLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : coordinates ? (
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.01}%2C${coordinates.lat - 0.01}%2C${coordinates.lng + 0.01}%2C${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`}
                                className="absolute inset-0"
                            ></iframe>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <MapPin className="h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-muted-foreground">Map data not available for this location.</p>
                            </div>
                        )}
                         <div className="absolute bottom-4 left-4 rounded-lg bg-background p-3 shadow-lg">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <p className="font-semibold text-foreground">{property.address}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Contact Agent Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-bold text-foreground">Contact Agent</h3>
                <form className="mt-4 space-y-4" onSubmit={handleProtectedAction}>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" type="text" placeholder="Your Name" defaultValue={user?.displayName ?? ''} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" defaultValue={user?.email ?? ''} />
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
        </div>
        <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create an Account to Continue</AlertDialogTitle>
              <AlertDialogDescription>
                To save properties, schedule tours, and contact agents, you need to have an account. It's free and only takes a minute!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/auth')}>Sign Up / Sign In</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <TrackView property={property} />
    </div>
  );
}

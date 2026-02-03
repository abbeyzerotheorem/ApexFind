'use client';

import { notFound, useRouter } from 'next/navigation';
import { BedDouble, Bath, Maximize, Calendar as CalendarIcon, Car, Home, Droplet, Heart, Printer, MapPin, Zap, Shield, Loader2, Users, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
import { getSafeImageUrl } from '@/lib/image-utils';
import AgentCard from './property/agent-card';
import SimilarProperties from './property/similar-properties';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import Link from 'next/link';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props} fill="currentColor">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.85L2.3 22l5.42-1.42c1.42.75 3.01 1.18 4.67 1.18h.01c5.46 0 9.91-4.45 9.91-9.91 0-5.47-4.45-9.92-9.91-9.92zM17.15 15.5c-.29-.14-1.71-.84-1.98-.94-.27-.1-.47-.15-.66.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.43-1.72-1.6-2-.17-.29-.02-.44.13-.59.13-.13.3-.34.45-.51s.2-.3.3-.5c.1-.2.05-.37-.03-.52s-.66-1.6-1-2.18c-.22-.47-.45-.4-.63-.4-.18 0-.38.03-.58.03-.2 0-.52.07-.79.37s-1.03 1-1.26 2.4c-.23 1.4.1 2.8.23 3s1.24 2.37 3 3.52c1.76 1.15 3.03 1.54 4.09 1.8.35.1.66.07.9-.05.29-.12.92-1.07 1.22-1.45.3-.38.3-.7.2-1.08z" />
    </svg>
);

export default function PropertyDetailsPage({ id }: { id: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [geocodingLoading, setGeocodingLoading] = useState(true);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [preferredDate, setPreferredDate] = useState<Date | undefined>(new Date());
  const [preferredTime, setPreferredTime] = useState<string>('morning');
  const [duration, setDuration] = useState<string>('30min');
  const [tourType, setTourType] = useState<string>('in-person');
  const [attendees, setAttendees] = useState<string>('0');
  const [additionalMessage, setAdditionalMessage] = useState('');

  const propertyRef = useMemo(() => {
      if (!firestore) return null;
      return doc(firestore, 'properties', id);
  }, [firestore, id]);

  const { data: property, loading } = useDoc(propertyRef);

  const agentRef = useMemo(() => {
      if (!firestore || !property) return null;
      return doc(firestore, 'users', property.agentId);
  }, [firestore, property]);

  const { data: agent, loading: agentLoading } = useDoc(agentRef);

  useEffect(() => {
    if (property && property.address) {
        const fetchCoordinates = async () => {
            try {
                setGeocodingLoading(true);
                const fullAddress = `${property.address}, ${property.city}, ${property.state}`;
                const response = await fetch(`/api/nigeria/geocode?address=${encodeURIComponent(fullAddress)}`);
                if (!response.ok) throw new Error('Geocoding request failed');
                const data = await response.json();
                if (data.coordinates) setCoordinates(data.coordinates);
                else setCoordinates(null);
            } catch (error) {
                console.error("Failed to fetch coordinates", error);
                setCoordinates(null);
            } finally {
                setGeocodingLoading(false);
            }
        };
        fetchCoordinates();
    } else if (!loading) {
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
  
  const handleShareOnWhatsApp = async () => {
    if (!property) return;
    setIsGeneratingLink(true);
    try {
        const response = await fetch('/api/whatsapp/generate-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ property })
        });
        if (!response.ok) throw new Error('Failed to generate link');
        const data = await response.json();
        window.open(data.link, '_blank');
    } catch (error) {
        console.error("WhatsApp share failed:", error);
    } finally {
        setIsGeneratingLink(false);
    }
  };

  const handleScheduleTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setShowScheduleDialog(false);
        setShowAuthDialog(true);
        return;
    }
    if (!agent || !property || !firestore) return;

    setIsScheduling(true);
    const formattedDate = preferredDate ? format(preferredDate, "PPP") : 'a suitable date';
    const message = `Hi, I'd like to schedule a ${tourType} tour for ${property.address}.
Date: ${formattedDate}
Time: ${preferredTime}
Duration: ${duration === '30min' ? '30 Minutes' : '1 Hour'}
Attendees: ${attendees}
${additionalMessage ? `Note: ${additionalMessage}` : ''}`;

    try {
        const { getOrCreateConversation } = await import('@/lib/chat');
        const conversationId = await getOrCreateConversation(
            firestore,
            { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL },
            { uid: agent.id, displayName: agent.displayName || null, photoURL: agent.photoURL || null }
        );
        router.push(`/messages?convoId=${conversationId}&msg=${encodeURIComponent(message)}`);
    } catch (error) {
        console.error("Failed to start scheduling conversation", error);
    } finally {
        setIsScheduling(false);
        setShowScheduleDialog(false);
    }
  };

  if (loading || agentLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h1 className="text-xl text-muted-foreground">Loading Property Details...</h1>
        </div>
    );
  }

  if (!property) return notFound();
  
  const propertyImages = property.imageUrls && property.imageUrls.length > 0
    ? property.imageUrls
    : [getSafeImageUrl(undefined, property.home_type)];

  const description = property.description || `Discover luxury living in this stunning ${property.beds}-bedroom, ${property.baths}-bathroom ${property.home_type.toLowerCase()} located in the heart of ${property.city}. Spanning ${property.sqft.toLocaleString()} square feet, this home offers an open-concept living space perfect for both relaxation and entertaining.`;

  return (
    <div className="flex min-h-screen flex-col bg-background py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <MediaGallery images={propertyImages} propertyAddress={property.address} />

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              
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
                        <Button variant="outline" size="icon" onClick={handleToggleSave} aria-label={isSaved ? "Unsave" : "Save"}>
                            <Heart className={cn("h-5 w-5", isSaved && "fill-destructive text-destructive")} />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleShareOnWhatsApp} disabled={isGeneratingLink}>
                            {isGeneratingLink ? <Loader2 className="animate-spin" /> : <WhatsAppIcon className="h-5 w-5" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => window.print()} aria-label="Print">
                            <Printer className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-border pt-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <BedDouble className="h-6 w-6 text-primary" />
                        <div><span className="font-bold text-foreground">{property.beds}</span><span className="text-sm"> beds</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bath className="h-6 w-6 text-primary" />
                        <div><span className="font-bold text-foreground">{property.baths}</span><span className="text-sm"> baths</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Maximize className="h-6 w-6 text-primary" />
                        <div><span className="font-bold text-foreground">{property.sqft.toLocaleString()}</span><span className="text-sm"> sqft</span></div>
                    </div>
                </div>

                 <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="w-full sm:w-auto flex-1 h-14 text-lg font-bold">Schedule a Tour</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleScheduleTour}>
                                <DialogHeader>
                                    <DialogTitle>Schedule Your Viewing</DialogTitle>
                                    <DialogDescription>Select your preferred details for viewing "{property.address}".</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Tour Type</Label>
                                            <Select value={tourType} onValueChange={setTourType}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="in-person">In-person</SelectItem>
                                                    <SelectItem value="virtual">Virtual Tour</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Duration</Label>
                                            <Select value={duration} onValueChange={setDuration}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="30min">30 Minutes</SelectItem>
                                                    <SelectItem value="1hr">1 Hour</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Preferred Date</Label>
                                        <div className="flex justify-center border rounded-md p-2">
                                            <Calendar
                                                mode="single"
                                                selected={preferredDate}
                                                onSelect={setPreferredDate}
                                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Time Slot</Label>
                                            <Select value={preferredTime} onValueChange={setPreferredTime}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="morning">Morning (9am-12pm)</SelectItem>
                                                    <SelectItem value="afternoon">Afternoon (12pm-4pm)</SelectItem>
                                                    <SelectItem value="evening">Evening (4pm-6pm)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Additional Attendees</Label>
                                            <Input type="number" min="0" value={attendees} onChange={(e) => setAttendees(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Message to Agent</Label>
                                        <Textarea value={additionalMessage} onChange={(e) => setAdditionalMessage(e.target.value)} placeholder="Any special requests?" />
                                    </div>
                                    <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs flex gap-2">
                                        <Info size={16} className="shrink-0" />
                                        <p><strong>Note:</strong> Please bring a valid government-issued ID for verification. Cancellations should be made 24 hours in advance.</p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                    <Button type="submit" disabled={isScheduling} className="font-bold">
                                        {isScheduling ? 'Sending...' : 'Confirm Request'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto flex-1 h-14 text-lg" asChild>
                        <Link href="/mortgage">Mortgage Quote</Link>
                    </Button>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold text-foreground">About this home</h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
                 <div className="mt-6 flex flex-wrap gap-3">
                    {property.is_furnished && <Badge variant="secondary">Furnished</Badge>}
                    {property.power_supply && <Badge variant="secondary" className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> {property.power_supply}</Badge>}
                    {property.water_supply && <Badge variant="secondary" className="flex items-center gap-1.5"><Droplet className="h-3 w-3" /> {property.water_supply}</Badge>}
                </div>
              </div>

              <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground">Facts and features</h2>
                <Accordion type="multiple" defaultValue={['property-facts']} className="mt-4 w-full">
                  <AccordionItem value="property-facts">
                    <AccordionTrigger className="text-lg font-semibold">Property Facts</AccordionTrigger>
                    <AccordionContent className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-3"><Home className="h-5 w-5 text-primary"/><div className="text-xs text-muted-foreground">Type<div className="font-medium text-foreground">{property.home_type}</div></div></div>
                        <div className="flex items-center gap-3"><CalendarIcon className="h-5 w-5 text-primary"/><div className="text-xs text-muted-foreground">Year Built<div className="font-medium text-foreground">{property.yearBuilt || 'N/A'}</div></div></div>
                        <div className="flex items-center gap-3"><Car className="h-5 w-5 text-primary"/><div className="text-xs text-muted-foreground">Parking<div className="font-medium text-foreground">{property.parking_spaces ? `${property.parking_spaces} Spaces` : 'N/A'}</div></div></div>
                        <div className="flex items-center gap-3"><Zap className="h-5 w-5 text-primary"/><div className="text-xs text-muted-foreground">Power<div className="font-medium text-foreground">{property.power_supply || 'Grid'}</div></div></div>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="financial">
                    <AccordionTrigger className="text-lg font-semibold">Financial Analysis</AccordionTrigger>
                    <AccordionContent className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-3"><Maximize className="h-5 w-5 text-primary"/><div className="text-xs text-muted-foreground">Price per sqft<div className="font-medium text-foreground">{formatNaira(property.price / property.sqft)}</div></div></div>
                        <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary"/><div className="text-xs text-muted-foreground">Listing Status<div className="font-medium text-foreground">{property.status || 'Active'}</div></div></div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-foreground">Location</h2>
                    <div className="mt-4 relative h-96 w-full overflow-hidden rounded-lg border bg-muted">
                        {geocodingLoading ? (
                            <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                        ) : coordinates ? (
                            <iframe
                                width="100%" height="100%" frameBorder="0" scrolling="no"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.01}%2C${coordinates.lat - 0.01}%2C${coordinates.lng + 0.01}%2C${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`}
                                className="absolute inset-0"
                            ></iframe>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <MapPin className="h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-muted-foreground">Map data currently unavailable.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
              <AgentCard agent={agent} property={property} />
            </div>
          </div>
          <div className="mt-16">
            <SimilarProperties currentProperty={property} />
          </div>
        </div>
        <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Account Required</AlertDialogTitle>
              <AlertDialogDescription>Please sign in to schedule tours or save properties.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/auth')}>Sign In</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <TrackView property={property} />
    </div>
  );
}
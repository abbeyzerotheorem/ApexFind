"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { Bath, Bed, Heart, Share2, Square, MapPin, Zap, Droplets, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { formatNaira } from "@/lib/naira-formatter";
import { getFallbackImage, getSafeImageUrl } from "@/lib/image-utils";
import type { Property } from "@/types";
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

type PropertyCardViewMode = "grid" | "list";

export function PropertyCard({ 
    property, 
    viewMode = 'grid',
    showDashboardControls = false,
    isSelected = false,
    onToggleSelect
}: { 
    property: Property, 
    viewMode?: PropertyCardViewMode,
    showDashboardControls?: boolean,
    isSelected?: boolean,
    onToggleSelect?: () => void
}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(() => getSafeImageUrl(property.imageUrls?.[0], property.home_type));
  const router = useRouter();
  const isRental = property.listing_type === 'rent';

  const savedHomeRef = useMemo(() => {
      if (!user || !firestore) return null;
      return doc(firestore, `users/${user.uid}/saved_homes`, String(property.id));
  }, [user, firestore, property.id]);
  
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

  useEffect(() => {
      setCurrentImageUrl(getSafeImageUrl(property.imageUrls?.[0], property.home_type));
  }, [property.imageUrls, property.home_type]);


  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
        setShowAuthDialog(true);
        return;
    }
    if (!savedHomeRef) return;

    if (isSaved) {
        await deleteDoc(savedHomeRef);
        setIsSaved(false);
    } else {
        await setDoc(savedHomeRef, { property_data: property, saved_at: serverTimestamp() });
        setIsSaved(true);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
        navigator.share({
            title: property.address,
            text: `Check out this property on ApexFind: ${property.address} - ${formatNaira(property.price)}`,
            url: window.location.origin + `/property/${property.id}`
        }).catch(console.error);
    } else {
        const text = encodeURIComponent(`Check out this property on ApexFind: ${property.address} - ${formatNaira(property.price)}\n\n${window.location.origin}/property/${property.id}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  }

  if (viewMode === 'list') {
    return (
      <>
        <Card className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col md:flex-row w-full border-2 group",
          isSelected ? "border-primary bg-primary/5 shadow-md" : "border-transparent shadow-sm"
        )}>
            <div className="relative h-56 md:h-auto md:w-80 flex-shrink-0">
                <Link href={`/property/${property.id}`} className="relative block h-full w-full">
                    <Image
                        src={currentImageUrl}
                        alt={property.address || 'a property'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 320px"
                        onError={() => { setCurrentImageUrl(getFallbackImage(property.home_type)); }}
                    />
                </Link>
                 <div className="absolute left-3 top-3 flex gap-2">
                    <Badge variant="secondary" className="font-bold bg-white/90 backdrop-blur-sm text-foreground shadow-sm">{property.status || 'Active'}</Badge>
                    <Badge className="font-bold uppercase shadow-sm">{property.listing_type}</Badge>
                </div>
                <div className="absolute right-3 top-3 flex flex-col gap-2">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-sm"
                        onClick={handleToggleSave}
                    >
                        <Heart className={cn("h-5 w-5 text-primary", isSaved && "fill-primary")} />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-sm"
                        onClick={handleShare}
                    >
                        <Share2 className="h-5 w-5 text-foreground" />
                    </Button>
                </div>
            </div>
            <div className="flex flex-col flex-grow">
                <CardContent className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-2xl font-bold text-primary leading-none">
                                {formatNaira(property.price)}
                                {isRental && property.price_period && (
                                    <span className="text-sm font-normal text-muted-foreground ml-1">
                                    /{property.price_period}
                                    </span>
                                )}
                            </p>
                             {showDashboardControls && (
                                 <Checkbox 
                                   checked={isSelected} 
                                   onCheckedChange={onToggleSelect} 
                                   className="h-6 w-6"
                                 />
                             )}
                        </div>
                        <Link href={`/property/${property.id}`}>
                            <div className="flex items-start text-muted-foreground gap-2">
                                <MapPin size={18} className="mt-1 shrink-0 text-primary" />
                                <p className="font-bold text-foreground hover:text-primary text-xl transition-colors line-clamp-1">
                                    {property.address}, {property.city}
                                </p>
                            </div>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {property.description || `Beautiful ${property.beds} bedroom ${property.home_type.toLowerCase()} located in the prime area of ${property.city}.`}
                        </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-primary" /> {property.beds} Beds</span>
                            <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-primary" /> {property.baths} Baths</span>
                            <span className="flex items-center gap-1.5"><Square className="h-4 w-4 text-primary" /> {property.sqft.toLocaleString()} sqft</span>
                        </div>
                        <div className="flex gap-2">
                            {property.is_furnished && <Badge variant="outline" className="bg-primary/5">Furnished</Badge>}
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
        <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save to Your Profile</AlertDialogTitle>
              <AlertDialogDescription>
                Sign in to save your favorite properties and receive updates when prices change or when similar homes are listed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/auth')}>Continue to Sign In</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Card className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col border-2 group",
        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-transparent shadow-sm"
      )}>
          <div className="relative h-64 overflow-hidden">
              <Link href={`/property/${property.id}`} className="relative block h-full w-full">
                  <Image
                  src={currentImageUrl}
                  alt={property.address || 'a property'}
                  fill
                  className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={() => {
                    setCurrentImageUrl(getFallbackImage(property.home_type));
                  }}
                  />
              </Link>
              <div className="absolute left-3 top-3 flex gap-2">
                  <Badge variant="secondary" className="font-bold bg-white/90 backdrop-blur-sm text-foreground shadow-sm">{property.status || 'Active'}</Badge>
                  <Badge className="font-bold uppercase shadow-sm">{property.listing_type}</Badge>
              </div>
              <div className="absolute right-3 top-3 flex flex-col gap-2">
                  <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-sm"
                      onClick={handleToggleSave}
                  >
                      <Heart className={cn("h-5 w-5 text-primary", isSaved && "fill-primary")} />
                  </Button>
                  <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-sm"
                      onClick={handleShare}
                  >
                      <Share2 className="h-5 w-5 text-foreground" />
                  </Button>
              </div>
          </div>
        <CardContent className="p-5 flex-grow flex flex-col">
          <div className="mb-4">
            <div className="flex justify-between items-start mb-1">
              <p className="text-2xl font-black text-primary">
                {formatNaira(property.price)}
                {isRental && property.price_period && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    /{property.price_period}
                  </span>
                )}
              </p>
              {showDashboardControls && (
                <Checkbox 
                  checked={isSelected} 
                  onCheckedChange={onToggleSelect} 
                  className="h-5 w-5"
                />
              )}
            </div>
            <Link href={`/property/${property.id}`}>
                <div className="flex items-start text-muted-foreground gap-1.5 group/link">
                    <MapPin size={16} className="mt-1 shrink-0 text-primary" />
                    <p className="font-bold text-foreground group-hover/link:text-primary transition-colors line-clamp-1 text-lg">
                        {property.address}, {property.city}
                    </p>
                </div>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 border-y py-4 text-center">
              <div className="flex flex-col items-center gap-1 border-r">
                  <Bed className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold">{property.beds} <span className="text-[10px] text-muted-foreground font-normal uppercase">Beds</span></span>
              </div>
              <div className="flex flex-col items-center gap-1 border-r">
                  <Bath className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold">{property.baths} <span className="text-[10px] text-muted-foreground font-normal uppercase">Baths</span></span>
              </div>
              <div className="flex flex-col items-center gap-1">
                  <Square className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold">{(property.sqft / 10.764).toFixed(0)} <span className="text-[10px] text-muted-foreground font-normal uppercase">m²</span></span>
              </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
              {property.is_furnished && <Badge variant="outline" className="text-[10px] bg-muted/50">Furnished</Badge>}
              {property.power_supply && <Badge variant="outline" className="text-[10px] bg-muted/50 flex items-center gap-1"><Zap size={10} className="text-yellow-500" />{property.power_supply}</Badge>}
              {property.water_supply && <Badge variant="outline" className="text-[10px] bg-muted/50 flex items-center gap-1"><Droplets size={10} className="text-blue-500" />Water</Badge>}
          </div>
        </CardContent>
        {showDashboardControls && (
          <CardFooter className="p-4 border-t flex justify-between items-center bg-muted/20">
              <p className="text-xs font-semibold text-muted-foreground">Compare properties</p>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">Add Note</Button>
          </CardFooter>
        )}
      </Card>
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personalize Your Journey</AlertDialogTitle>
            <AlertDialogDescription>
              Create an account to save properties, organize your search, and be the first to know about new listings in your favorite areas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/auth')}>Sign Up / Sign In</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

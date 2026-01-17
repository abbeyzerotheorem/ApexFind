
"use client";

import Image from "next/image";
import { useState } from "react";
import Link from 'next/link';
import { Bath, Bed, Heart, Share2, Square, MapPin, Zap, Droplets, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { formatNaira, formatNairaShort } from "@/lib/naira-formatter";
import { getFallbackImage } from "@/lib/image-utils";

type Property = {
    id: number;
    price: number;
    listing_type: 'sale' | 'rent';
    price_period?: string;
    address: string;
    city: string;
    state: string;
    estate_name?: string;
    beds: number;
    baths: number;
    sqft: number;
    imageUrl: string;
    imageHint: string;
    lotSize?: number;
    agent?: string;
    status?: string;
    home_type: string;
    is_furnished?: boolean;
    power_supply?: string;
    water_supply?: string;
    security_type?: string[];
  };

type ViewMode = "list" | "map" | "gallery";

export function PropertyCard({ 
    property, 
    viewMode = 'list',
    showDashboardControls = false 
}: { 
    property: Property, 
    viewMode?: ViewMode,
    showDashboardControls?: boolean
}) {
  const [isSaved, setIsSaved] = useState(showDashboardControls);
  const [currentImageUrl, setCurrentImageUrl] = useState(property.imageUrl);
  const router = useRouter();
  const supabase = createClient();
  const isRental = property.listing_type === 'rent';

  const handleToggleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        router.push('/auth');
        return;
    }

    const userId = session.user.id;

    if (isSaved) {
        // Property is currently saved, so unsave it
        const { error } = await supabase
            .from('saved_homes')
            .delete()
            .match({ user_id: userId, property_id: property.id });

        if (!error) {
            setIsSaved(false);
        } else {
            console.error('Error unsaving property:', error.message);
        }
    } else {
        // Property is not saved, so save it
        const { error } = await supabase
            .from('saved_homes')
            .insert({ 
                user_id: userId,
                property_id: property.id,
                property_data: property 
            });

        if (!error) {
            setIsSaved(true);
        } else {
            console.error('Error saving property:', error.message);
        }
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
        <div className="relative h-64">
            <Link href={`/property/${property.id}`}>
                <Image
                src={currentImageUrl}
                alt={`Image of ${property.address}`}
                data-ai-hint={property.imageHint}
                fill
                className="w-full object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => {
                  setCurrentImageUrl(getFallbackImage(property.home_type));
                }}
                />
            </Link>
            <div className="absolute left-3 top-3">
                {property.status && <Badge variant="secondary" className="font-medium">{property.status}</Badge>}
            </div>
            <div className="absolute right-3 top-3 flex flex-col gap-2">
                <Badge variant="default" className="capitalize">{property.listing_type}</Badge>
                <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/80 hover:bg-white self-end"
                    onClick={handleToggleSave}
                    aria-label={isSaved ? "Unsave property" : "Save property"}
                >
                    <Heart
                        className={cn(
                        "h-4 w-4 text-primary transition-all",
                        isSaved && "fill-primary"
                        )}
                    />
                </Button>
            </div>
            
        </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div>
          <p className="text-2xl font-bold text-primary">
            {formatNaira(property.price)}
            {isRental && property.price_period && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                /{property.price_period}
              </span>
            )}
          </p>
          <div className="flex items-start text-muted-foreground mt-1 gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <p className="font-semibold text-foreground hover:text-primary">
                {property.estate_name ? `${property.estate_name} Estate` : property.address}, {property.city}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-y py-3 text-center">
            <div className="flex flex-col items-center gap-1">
                <Bed className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm"><span className="font-medium text-foreground">{property.beds}</span> Beds</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <Bath className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm"><span className="font-medium text-foreground">{property.baths}</span> Baths</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <Square className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm"><span className="font-medium text-foreground">{(property.sqft / 10.764).toFixed(0)}</span> m²</span>
            </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
            {property.is_furnished && <Badge variant="outline">Furnished</Badge>}
            {property.power_supply && <Badge variant="outline" className="flex items-center gap-1"><Zap size={12}/>{property.power_supply}</Badge>}
            {property.water_supply && <Badge variant="outline" className="flex items-center gap-1"><Droplets size={12}/>{property.water_supply}</Badge>}
            {property.security_type && property.security_type.length > 0 && <Badge variant="outline" className="flex items-center gap-1"><Shield size={12}/>Security</Badge>}
        </div>
       
      </CardContent>
       {showDashboardControls && (
        <CardFooter className="p-4 border-t flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <Checkbox id={`compare-${property.id}`} />
                <Label htmlFor={`compare-${property.id}`} className="text-sm font-normal">Compare</Label>
            </div>
            <Button variant="ghost" size="sm">Add Note</Button>
        </CardFooter>
      )}
    </Card>
  );
}

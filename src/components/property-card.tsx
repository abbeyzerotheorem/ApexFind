
"use client";

import Image from "next/image";
import { useState } from "react";
import Link from 'next/link';
import { Bath, BedDouble, Heart, Maximize, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { formatNaira } from "@/lib/naira-formatter";

type Property = {
  id: number;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl: string;
  imageHint: string;
  lotSize?: number;
  agent?: string;
  status?: string;
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
  const router = useRouter();
  const isGallery = viewMode === 'gallery';
  const supabase = createClient();

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
    <Card className={cn(
        "overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col",
        isGallery && "sm:flex-row"
      )}>
        <div className={cn("relative", isGallery && "sm:w-1/2")}>
            <Link href={`/property/${property.id}`}>
                <Image
                src={property.imageUrl}
                alt={`Image of ${property.address}`}
                data-ai-hint={property.imageHint}
                width={isGallery ? 800 : 600}
                height={isGallery ? 600 : 400}
                className={cn(
                    "w-full object-cover",
                    isGallery ? "aspect-[4/3]" : "aspect-[3/2]"
                )}
                />
            </Link>
            <div className="absolute right-3 top-3 flex gap-2">
                <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                aria-label="Share property"
                >
                <Share2
                    className="h-4 w-4 text-primary"
                />
                </Button>
                <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
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
            {property.status && <Badge variant="secondary" className="absolute left-3 top-3 font-medium">{property.status}</Badge>}
        </div>
      <CardContent className={cn("p-4 flex-grow flex flex-col", isGallery && "sm:w-1/2 justify-center")}>
        <div className="flex-grow">
          <p className="text-2xl font-bold text-primary">
            {formatNaira(property.price)}
          </p>
          <Link href={`/property/${property.id}`} className="block">
            <p className="mt-1 font-semibold text-foreground hover:text-primary">{property.address}</p>
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            <span><span className="font-medium text-foreground">{property.beds}</span> beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-5 w-5" />
            <span><span className="font-medium text-foreground">{property.baths}</span> baths</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="h-5 w-5" />
            <span><span className="font-medium text-foreground">{property.sqft.toLocaleString()}</span> sqft</span>
          </div>
          {property.lotSize && <div className="flex items-center gap-2">
             <Maximize className="h-5 w-5" />
            <span><span className="font-medium text-foreground">{(property.lotSize)}</span> acre lot</span>
          </div>}
        </div>
        {property.agent && <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">
            Listed by: <span className="font-medium text-foreground">{property.agent}</span>
        </div>}
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

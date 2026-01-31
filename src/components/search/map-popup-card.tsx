
'use client';

import Image from "next/image";
import Link from 'next/link';
import { Bed, Bath } from "lucide-react";
import { formatNaira } from "@/lib/naira-formatter";
import { getSafeImageUrl } from "@/lib/image-utils";
import type { Property } from "@/types";
import { Badge } from "../ui/badge";

export function MapPopupCard({ property }: { property: Property }) {
    return (
        <div className="w-64">
            <Link href={`/property/${property.id}`} target="_blank" rel="noopener noreferrer">
                <div className="relative h-32 w-full">
                    <Image
                        src={getSafeImageUrl(property.imageUrls?.[0], property.home_type)}
                        alt={property.address}
                        fill
                        className="object-cover rounded-t-md"
                    />
                </div>
                <div className="p-2">
                    <p className="text-sm font-bold truncate">{property.address}</p>
                    <p className="text-lg font-bold text-primary">{formatNaira(property.price)}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                            <Bed size={16} />
                            <span>{property.beds}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Bath size={16} />
                            <span>{property.baths}</span>
                        </div>
                        <Badge variant="secondary" className="capitalize">{property.home_type}</Badge>
                    </div>
                </div>
            </Link>
        </div>
    );
}


'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Property } from '@/types';
import { MapPopupCard } from './map-popup-card';
import { Loader2 } from 'lucide-react';

// Fix for default icon issue with Leaflet in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type PropertyWithCoords = Property & { lat: number; lng: number };

function MapUpdater({ properties }: { properties: PropertyWithCoords[] }) {
    const map = useMap();
    useEffect(() => {
        if (properties.length > 0) {
            const bounds = L.latLngBounds(properties.map(p => [p.lat, p.lng]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [properties, map]);
    return null;
}

export default function MapView({ properties }: { properties: Property[] }) {
    const [propertiesWithCoords, setPropertiesWithCoords] = useState<PropertyWithCoords[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const geocodeProperties = async () => {
            setIsLoading(true);
            const geocodedPromises = properties.map(async (prop) => {
                // Here we would ideally check if prop already has lat/lng
                try {
                    const fullAddress = `${prop.address}, ${prop.city}, ${prop.state}`;
                    const response = await fetch(`/api/nigeria/geocode?address=${encodeURIComponent(fullAddress)}`);
                    if (!response.ok) return null;
                    const data = await response.json();
                    if (data.coordinates) {
                        return { ...prop, lat: data.coordinates.lat, lng: data.coordinates.lng };
                    }
                    return null;
                } catch (error) {
                    console.error("Geocoding error for:", prop.address, error);
                    return null;
                }
            });

            const results = await Promise.all(geocodedPromises);
            setPropertiesWithCoords(results.filter((p): p is PropertyWithCoords => p !== null));
            setIsLoading(false);
        };

        if (properties.length > 0) {
            geocodeProperties();
        } else {
            setPropertiesWithCoords([]);
            setIsLoading(false);
        }
    }, [properties]);

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading map and properties...</p>
                </div>
            </div>
        );
    }
    
    return (
        <MapContainer center={[9.0820, 8.6753]} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {propertiesWithCoords.map(prop => (
                <Marker key={prop.id} position={[prop.lat, prop.lng]}>
                    <Popup>
                        <MapPopupCard property={prop} />
                    </Popup>
                </Marker>
            ))}
            <MapUpdater properties={propertiesWithCoords} />
        </MapContainer>
    );
}


import { PlaceHolderProperties } from "@/lib/placeholder-properties";
import { PropertyCard } from "@/components/property-card";
import { Button } from "../ui/button";

const savedProperties = PlaceHolderProperties.slice(0, 3);

export default function SavedHomes() {
  return (
    <div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
            ))}
        </div>
        {savedProperties.length === 0 && (
            <div className="mt-8 text-center py-24 bg-secondary rounded-lg">
                <h2 className="text-2xl font-semibold">No Saved Homes Yet</h2>
                <p className="text-muted-foreground mt-2">Start your search and save homes you love.</p>
                <Button className="mt-4">Search Homes</Button>
            </div>
        )}
    </div>
  );
}

import { PropertyCard } from "@/components/property-card";
import { PlaceHolderProperties } from "@/lib/placeholder-properties";

const properties = PlaceHolderProperties.slice(0, 6);

export default function HighlightedListings() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

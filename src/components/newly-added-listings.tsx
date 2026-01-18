import { PropertyCard } from "@/components/property-card";
import { PlaceHolderProperties } from "@/lib/placeholder-properties";

// Simulate fetching newly added properties by taking the last 3 from the placeholder data
const properties = PlaceHolderProperties.slice(-3).reverse();

export default function NewlyAddedListings() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

import { PropertyCard } from "@/components/property-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const properties = [
  {
    id: 1,
    price: 150000000,
    address: "123 Banana Island, Lagos",
    beds: 4,
    baths: 5,
    sqft: 3500,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === "property-1")?.imageUrl ?? "",
    imageHint:
      PlaceHolderImages.find((img) => img.id === "property-1")?.imageHint ?? "",
  },
  {
    id: 2,
    price: 250000000,
    address: "456 Asokoro, Abuja",
    beds: 5,
    baths: 6,
    sqft: 4200,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === "property-2")?.imageUrl ?? "",
    imageHint:
      PlaceHolderImages.find((img) => img.id === "property-2")?.imageHint ?? "",
  },
  {
    id: 3,
    price: 85000000,
    address: "789 GRA, Port Harcourt",
    beds: 3,
    baths: 3,
    sqft: 2800,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === "property-3")?.imageUrl ?? "",
    imageHint:
      PlaceHolderImages.find((img) => img.id === "property-3")?.imageHint ?? "",
  },
  {
    id: 4,
    price: 180000000,
    address: "101 Maitama, Abuja",
    beds: 4,
    baths: 4,
    sqft: 3800,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === "property-4")?.imageUrl ?? "",
    imageHint:
      PlaceHolderImages.find((img) => img.id === "property-4")?.imageHint ?? "",
  },
  {
    id: 5,
    price: 320000000,
    address: "212 Lekki Phase 1, Lagos",
    beds: 6,
    baths: 7,
    sqft: 5500,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === "property-5")?.imageUrl ?? "",
    imageHint:
      PlaceHolderImages.find((img) => img.id === "property-5")?.imageHint ?? "",
  },
  {
    id: 6,
    price: 75000000,
    address: "333 Bodija, Ibadan",
    beds: 3,
    baths: 4,
    sqft: 2500,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === "property-6")?.imageUrl ?? "",
    imageHint:
      PlaceHolderImages.find((img) => img.id === "property-6")?.imageHint ?? "",
  },
];

export default function HighlightedListings() {
  return (
    <section className="bg-secondary py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Homes For Sale You May Like
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Based on your recent activity and saved searches, here are some
            homes you might be interested in.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}

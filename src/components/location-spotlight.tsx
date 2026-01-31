import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card } from './ui/card';

const locations = [
    {
        name: "Lagos",
        image: PlaceHolderImages.find(i => i.id === 'property-1')?.imageUrl ?? "",
        imageHint: PlaceHolderImages.find(i => i.id === 'property-1')?.imageHint ?? "",
        description: "The bustling commercial heart of Nigeria.",
        href: "/search?q=Lagos"
    },
    {
        name: "Abuja",
        image: PlaceHolderImages.find(i => i.id === 'property-2')?.imageUrl ?? "",
        imageHint: PlaceHolderImages.find(i => i.id === 'property-2')?.imageHint ?? "",
        description: "The serene and well-planned capital city.",
        href: "/search?q=Abuja"
    },
    {
        name: "Port Harcourt",
        image: PlaceHolderImages.find(i => i.id === 'property-5')?.imageUrl ?? "",
        imageHint: PlaceHolderImages.find(i => i.id === 'property-5')?.imageHint ?? "",
        description: "The vibrant hub of the oil and gas industry.",
        href: "/search?q=Port-Harcourt"
    }
]

export default function LocationSpotlight() {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Explore Top Locations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {locations.map((location) => (
                        <Link key={location.name} href={location.href} className="block group">
                             <Card className="relative overflow-hidden rounded-lg">
                                <Image 
                                    src={location.image}
                                    alt={`A view of ${location.name}`}
                                    data-ai-hint={location.imageHint}
                                    width={600}
                                    height={800}
                                    className="object-cover w-full h-96 transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6">
                                    <h3 className="text-2xl font-bold text-white">{location.name}</h3>
                                    <p className="text-gray-200">{location.description}</p>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

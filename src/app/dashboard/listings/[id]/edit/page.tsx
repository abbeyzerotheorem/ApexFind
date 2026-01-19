import ListingForm from "@/components/dashboard/listing-form";
import { PlaceHolderProperties } from "@/lib/placeholder-properties";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EditListingPage({ params }: { params: { id: string } }) {
    const property = PlaceHolderProperties.find(p => p.id.toString() === params.id);
    
    if (!property) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col bg-background py-8 sm:py-12">
            <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8">
                 <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
                <ListingForm property={property} />
            </div>
        </div>
    )
}

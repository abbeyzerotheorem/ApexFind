'use client';

import ListingForm from "@/components/dashboard/listing-form";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { notFound } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export default function EditListingPage({ params: { id } }: { params: { id: string } }) {
    const firestore = useFirestore();
    
    const propertyRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'properties', id);
    }, [firestore, id]);
    
    const { data: property, loading } = useDoc(propertyRef);
    
    if (loading) {
         return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <h1 className="text-xl text-muted-foreground">Loading Listing...</h1>
            </div>
        );
    }

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


'use client';

import { useMemo } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Loader2, MoreHorizontal, Pencil, Trash2, Eye, AlertCircle } from "lucide-react";
import { collection, query, where } from "firebase/firestore";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { formatNaira } from "@/lib/naira-formatter";
import type { Property } from "@/types";
import { deleteListing } from "@/lib/listings";
import { getSafeImageUrl } from "@/lib/image-utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


export default function MyListingsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const queryClient = useQueryClient();
    const router = useRouter();

    // Removed orderBy from Firestore query to avoid index requirement
    // We will sort client-side instead
    const propertiesQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'properties'), where('agentId', '==', user.uid));
    }, [firestore, user]);

    const { data: rawListings, loading: listingsLoading, error: listingsError } = useCollection<Property>(propertiesQuery);
    
    // Client-side sorting
    const agentListings = useMemo(() => {
        if (!rawListings) return [];
        return [...rawListings].sort((a, b) => {
            const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
            const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
            return timeB - timeA;
        });
    }, [rawListings]);

    const handleDeleteListing = async (id: string) => {
        if (!firestore || !user) return;
        try {
            await deleteListing(firestore, id);
            // Refetch all properties queries
            await queryClient.invalidateQueries({ queryKey: ['firestore-collection', 'properties'] });
        } catch (error) {
            console.error("Failed to delete listing", error);
        }
    }

    if (userLoading || listingsLoading) {
        return (
            <div className="flex flex-col flex-grow items-center justify-center space-y-4 bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <h1 className="text-xl text-muted-foreground">Loading Listings...</h1>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
            <div className="mx-auto w-full max-w-7xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            My Listings
                        </h1>
                        <p className="mt-1 text-muted-foreground">Manage your properties on ApexFind.</p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/listings/new">+ Add New Listing</Link>
                    </Button>
                </div>

                {listingsError && (
                    <Alert variant="destructive" className="mt-8">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error loading listings</AlertTitle>
                        <AlertDescription>
                            There was a problem fetching your properties. Please try refreshing the page.
                        </AlertDescription>
                    </Alert>
                )}
                
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>My Property Listings</CardTitle>
                        <CardDescription>You have {agentListings.length} active listings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden sm:table-cell">Image</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="hidden md:table-cell">Status</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agentListings.map(property => (
                                    <TableRow key={property.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="relative w-24 h-16 rounded-md overflow-hidden bg-muted">
                                                <Image 
                                                    src={getSafeImageUrl(property.imageUrls?.[0], property.home_type)} 
                                                    alt={property.address || 'Property image'} 
                                                    fill 
                                                    className="object-cover" 
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{property.address}</div>
                                            <div className="text-sm text-muted-foreground">{property.beds} beds • {property.baths} baths • {property.home_type}</div>
                                        </TableCell>
                                        <TableCell>{formatNaira(property.price)}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant={property.status === 'New' ? 'default' : 'secondary'}>{property.status || 'Active'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/listings/${property.id}/edit`} className="cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit Listing
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/property/${property.id}`} className="flex items-center w-full cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive cursor-pointer">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the listing for "{property.address}".
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteListing(property.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {agentListings.length === 0 && !listingsLoading && !listingsError && (
                            <div className="text-center p-12">
                                <h3 className="text-xl font-semibold">No listings yet.</h3>
                                <p className="text-muted-foreground mt-2">Get started by adding your first property.</p>
                                <Button asChild className="mt-6">
                                    <Link href="/dashboard/listings/new">+ Add New Listing</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

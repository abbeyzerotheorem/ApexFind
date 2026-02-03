
'use client';

import { useMemo } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Loader2, MoreHorizontal, Pencil, Trash2, Eye, AlertCircle, Plus, Building2, MapPin } from "lucide-react";
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

    const propertiesQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'properties'), where('agentId', '==', user.uid));
    }, [firestore, user]);

    const { data: rawListings, loading: listingsLoading, error: listingsError } = useCollection<Property>(propertiesQuery);
    
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
            await queryClient.invalidateQueries({ queryKey: ['firestore-collection', 'properties'] });
        } catch (error) {
            console.error("Failed to delete listing", error);
        }
    }

    if (userLoading || listingsLoading) {
        return (
            <div className="flex flex-col flex-grow items-center justify-center py-20 bg-background">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <h1 className="mt-4 text-xl font-medium text-muted-foreground">Loading your listings...</h1>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
            <div className="mx-auto w-full max-w-7xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            My Property Portfolio
                        </h1>
                        <p className="mt-1 text-muted-foreground">Manage and track the performance of your listings.</p>
                    </div>
                    <Button asChild className="h-12 font-bold gap-2">
                        <Link href="/dashboard/listings/new">
                            <Plus className="h-5 w-5" />
                            Add New Listing
                        </Link>
                    </Button>
                </div>

                {listingsError && (
                    <Alert variant="destructive" className="mt-8">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Network Error</AlertTitle>
                        <AlertDescription>
                            We couldn't retrieve your properties. Please check your internet connection and refresh the page.
                        </AlertDescription>
                    </Alert>
                )}
                
                <Card className="mt-8 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/10 border-b">
                        <CardTitle>Active Inventory</CardTitle>
                        <CardDescription>You are currently managing {agentListings.length} properties.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/5">
                                        <TableHead className="w-[100px] hidden md:table-cell">Image</TableHead>
                                        <TableHead>Property Details</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="hidden lg:table-cell">Type</TableHead>
                                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {agentListings.map(property => (
                                        <TableRow key={property.id} className="group hover:bg-muted/20 transition-colors">
                                            <TableCell className="hidden md:table-cell">
                                                <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted border">
                                                    <Image 
                                                        src={getSafeImageUrl(property.imageUrls?.[0], property.home_type)} 
                                                        alt={property.address || 'Property image'} 
                                                        fill 
                                                        className="object-cover" 
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1">{property.address}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <MapPin className="h-3 w-3" /> {property.city}, {property.state}
                                                </div>
                                                <div className="text-xs font-medium text-muted-foreground mt-1 sm:hidden">
                                                    {property.beds}bd • {property.baths}ba • {property.listing_type}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-primary">{formatNaira(property.price)}</div>
                                                {property.listing_type === 'rent' && <div className="text-[10px] text-muted-foreground uppercase font-bold">{property.price_period}</div>}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <span className="text-sm font-medium">{property.home_type}</span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge variant={property.status === 'New' ? 'default' : 'secondary'} className="font-bold">
                                                    {property.status || 'Active'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-muted">
                                                        <span className="sr-only">Open actions</span>
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Listing Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/listings/${property.id}/edit`} className="cursor-pointer">
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/property/${property.id}`} className="flex items-center w-full cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" /> View Live Page
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive cursor-pointer">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Remove Listing
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                            <AlertDialogTitle>Permanent Deletion</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{property.address}"? This listing and its data will be permanently removed from ApexFind search results.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Keep Listing</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteListing(property.id)} className="bg-destructive hover:bg-destructive/90">Delete Permanently</AlertDialogAction>
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
                        </div>
                        {agentListings.length === 0 && !listingsLoading && !listingsError && (
                            <div className="text-center py-24 px-6">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Building2 className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold">No active listings</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Build your portfolio and reach thousands of potential buyers by adding your first property.</p>
                                <Button asChild className="mt-8 h-12 px-8 font-bold" size="lg">
                                    <Link href="/dashboard/listings/new">+ Add Your First Listing</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

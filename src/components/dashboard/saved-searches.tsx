
'use client';

import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useMemo } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { SavedSearch } from "@/types";


export default function SavedSearches() {
  const { user } = useUser();
  const firestore = useFirestore();

  const savedSearchesQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/saved_searches`));
  }, [user, firestore]);

  const { data: searches, loading, error } = useCollection<SavedSearch>(savedSearchesQuery);

  if (loading) {
    return (
        <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-10 w-44" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
            </div>
        </div>
    )
  }
  
  if (error) {
    return <div className="text-destructive mt-8">Error: {error.message}</div>
  }

  return (
    <div className="mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
                <h2 className="text-2xl font-bold">You have {searches?.length || 0} saved searches</h2>
                <p className="text-muted-foreground">Manage your alerts and get notified about new properties.</p>
            </div>
            <Button asChild>
                <Link href="/search">+ Create New Search</Link>
            </Button>
        </div>

        {searches && searches.length > 0 ? (
            <div className="space-y-6">
                {searches.map((search) => (
                    <Card key={search.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start gap-4">
                            <div>
                                <CardTitle className="text-xl">{search.name}</CardTitle>
                                <CardDescription className="pt-2">{search.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Switch id={`alert-${search.id}`} checked={search.alertFrequency !== 'never'} />
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <Button variant="secondary" disabled={search.newMatchCount === 0}>
                                {search.newMatchCount > 0 ? `See ${search.newMatchCount} new matches` : 'No new matches'}
                            </Button>
                            <p className="text-sm text-muted-foreground">Alert Frequency: <span className="capitalize">{search.alertFrequency}</span></p>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
             <div className="mt-8 text-center py-24 bg-secondary rounded-lg">
                <h2 className="text-2xl font-semibold">No Saved Searches Yet</h2>
                <p className="text-muted-foreground mt-2">As you search, you can save your criteria to get alerts.</p>
                <Button className="mt-4" asChild>
                    <Link href="/search">Start a New Search</Link>
                </Button>
            </div>
        )}
    </div>
  );
}

'use client';

import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";
import { MoreVertical, Search, Trash2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { SavedSearch } from "@/types";
import { deleteSavedSearch } from "@/lib/searches";
import { useQueryClient } from "@tanstack/react-query";

export default function SavedSearches() {
  const { user } = useUser();
  const firestore = useFirestore();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const savedSearchesQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, `users/${user.uid}/saved_searches`),
        orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: searches, loading, error } = useCollection<SavedSearch>(savedSearchesQuery);

  const handleDelete = async (id: string) => {
    if (!user || !firestore) return;
    setIsDeleting(id);
    try {
        await deleteSavedSearch(firestore, user.uid, id);
        queryClient.invalidateQueries({ queryKey: ['firestore-collection'] });
    } catch (error) {
        console.error("Failed to delete search", error);
    } finally {
        setIsDeleting(null);
    }
  };

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
                <h2 className="text-2xl font-bold">Search Alerts ({searches?.length || 0})</h2>
                <p className="text-muted-foreground">Get notified the second a new home hits the market.</p>
            </div>
            <Button asChild className="font-bold">
                <Link href="/search">+ Create New Alert</Link>
            </Button>
        </div>

        {searches && searches.length > 0 ? (
            <div className="space-y-6 pb-20">
                {searches.map((search) => (
                    <Card key={search.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold">{search.name}</CardTitle>
                                <CardDescription className="pt-2 font-medium flex items-center gap-2">
                                    <Search className="h-3 w-3 text-primary" /> {search.description}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="hidden sm:flex items-center gap-2 mr-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Alerts</span>
                                    <Switch id={`alert-${search.id}`} checked={search.alertFrequency !== 'never'} />
                                </div>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full"><MoreVertical className="h-5 w-5"/></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem className="sm:hidden">
                                        Enable Notifications
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/search?${search.searchParams}`} className="cursor-pointer">
                                            <Search className="mr-2 h-4 w-4" /> View Results
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                        onClick={() => handleDelete(search.id)}
                                        disabled={isDeleting === search.id}
                                    >
                                        {isDeleting === search.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Delete Alert
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-muted/5 border-t py-4">
                            <Button variant="secondary" className="w-full sm:w-auto font-bold h-10" asChild>
                                <Link href={`/search?${search.searchParams}`}>
                                    {search.newMatchCount > 0 ? `See ${search.newMatchCount} New Matches` : 'See All Matches'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                    Frequency: <span className="text-foreground">{search.alertFrequency}</span>
                                </p>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                    Saved: <span className="text-foreground">{new Date(search.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</span>
                                </p>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
             <div className="mt-8 text-center py-24 bg-card border-2 border-dashed rounded-2xl">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-primary opacity-40" />
                </div>
                <h2 className="text-2xl font-bold">No Alerts Set</h2>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto px-4">Save your favorite search filters to get instant notifications when matching homes are listed.</p>
                <Button className="mt-8 h-12 px-8 font-bold" asChild>
                    <Link href="/search">Start a New Search</Link>
                </Button>
            </div>
        )}
    </div>
  );
}


'use client';

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, where } from 'firebase/firestore';
import type { Conversation } from "@/types";
import { Badge } from "@/components/ui/badge";


// Links for non-registered users
const publicNavLinks = [
  { name: "Buy", href: "/search" },
  { name: "Sell", href: "/sell" },
  { name: "Rent", href: "/search?type=rent" },
  { name: "Mortgage", href: "/mortgage" },
  { name: "Find Agents", href: "/agents" },
  { name: "Market Insights", href: "/insights" },
];

// Links for registered customers
const customerNavLinks = [
  ...publicNavLinks.filter(link => link.name !== 'Rent'), // Remove generic Rent
  { name: "My Rentals", href: "/rentals" }, // Add specific link
];

// Links for registered agents (excluding "Find Agents")
const agentNavLinks = customerNavLinks.filter(link => link.name !== 'Find Agents');


export default function Header() {
  const { user } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: userProfile } = useDoc<{ role?: 'customer' | 'agent' }>(userDocRef);

  const conversationsQuery = useMemo(() => {
      if (!user || !firestore) return null;
      return query(
          collection(firestore, 'conversations'),
          where('participants', 'array-contains', user.uid)
      );
  }, [user, firestore]);

  const { data: conversations } = useCollection<Conversation>(conversationsQuery);

  const totalUnreadCount = useMemo(() => {
    if (!conversations || !user) return 0;
    return conversations.reduce((acc, convo) => {
        return acc + (convo.unreadCounts?.[user.uid] || 0);
    }, 0);
  }, [conversations, user]);


  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const navLinks = useMemo(() => {
    if (!user) {
      return publicNavLinks;
    }
    if (userProfile?.role === 'agent') {
      return agentNavLinks;
    }
    // Default for authenticated users (customers)
    return customerNavLinks;
  }, [user, userProfile]);

  const userInitial = user?.displayName?.[0] || user?.email?.[0] || 'A';


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 text-primary"
            >
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
            <span className="text-xl font-bold">ApexFind</span>
          </Link>
          <nav className="hidden md:flex md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 md:flex">
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
                            </Avatar>
                             {totalUnreadCount > 0 && (
                                <Badge className="absolute top-0 right-0 h-5 w-5 p-0 flex items-center justify-center">{totalUnreadCount}</Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName || 'My Account'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                            </p>
                        </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard?tab=profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                        Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button asChild>
                    <Link href="/auth">Sign In</Link>
                </Button>
            )}
            </div>
            <Sheet>
            <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <SheetClose asChild>
                    <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary"><path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z" /><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" /></svg>
                        <span className="text-xl font-bold">ApexFind</span>
                    </Link>
                  </SheetClose>
                  {navLinks.map(link => (
                      <SheetClose asChild key={link.name}>
                        <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                          {link.name}
                        </Link>
                      </SheetClose>
                  ))}
                   {user && (
                        <SheetClose asChild>
                            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                Dashboard
                                {totalUnreadCount > 0 && (
                                    <Badge className="h-5 w-5 p-0 flex items-center justify-center">{totalUnreadCount}</Badge>
                                )}
                            </Link>
                        </SheetClose>
                   )}
                  {user ? (
                      <SheetClose asChild>
                        <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
                      </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Button asChild>
                        <Link href="/auth">Sign In</Link>
                      </Button>
                    </SheetClose>
                  )}
                </nav>
            </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}

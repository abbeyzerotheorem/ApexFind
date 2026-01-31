'use client';

import { useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, where } from 'firebase/firestore';
import type { Conversation } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


// Links for non-registered users and customers
const publicNavLinks = [
  { name: "Buy", href: "/search" },
  { name: "Sell", href: "/sell" },
  { name: "Rent", href: "/search?type=rent" },
  { name: "Mortgage", href: "/mortgage" },
  { name: "Find Agents", href: "/agents" },
  { name: "Market Insights", href: "/insights" },
  { name: "About", href: "/about" },
];

// Links for registered customers are the same as public
const customerNavLinks = publicNavLinks;

// Links for registered agents, they see the same as customers but without the "Find Agents" link.
const agentNavLinks = publicNavLinks
  .filter(link => link.name !== 'Find Agents');


export default function Header() {
  const { user } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: userProfile } = useDoc<{ role?: 'customer' | 'agent', displayName?: string, photoURL?: string }>(userDocRef);

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
    window.location.href = '/';
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

  const displayName = userProfile?.displayName || user?.displayName;
  const displayPhotoURL = userProfile?.photoURL || user?.photoURL;
  const userInitial = displayName?.[0] || user?.email?.[0] || 'A';


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/ApexFindlogo.png"
              alt="ApexFind Logo"
              width={28}
              height={28}
              className="h-7 w-7"
            />
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
            <div className="hidden items-center gap-2 md:flex">
            {user ? (
                <>
                    <Button variant="ghost" size="icon" className="relative" asChild>
                        <Link href="/messages">
                            <MessageSquare className="h-5 w-5" />
                            {totalUnreadCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{totalUnreadCount}</Badge>
                            )}
                            <span className="sr-only">Messages</span>
                        </Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={displayPhotoURL || ''} alt={displayName || ''} />
                                    <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{displayName || 'My Account'}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                                </p>
                            </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </DropdownMenuItem>
                             {userProfile?.role === 'agent' && (
                              <DropdownMenuItem asChild>
                                <Link href="/dashboard/listings">My Listings</Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/profile">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        Logout
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You will be returned to the homepage and will need to sign in again to access your dashboard.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSignOut}>Logout</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
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
                        <Image
                            src="/ApexFindlogo.png"
                            alt="ApexFind Logo"
                            width={24}
                            height={24}
                            className="h-6 w-6"
                        />
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
                        <>
                            <SheetClose asChild>
                                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                                    Dashboard
                                </Link>
                            </SheetClose>
                            <SheetClose asChild>
                                <Link href="/messages" className="flex items-center gap-4 text-muted-foreground hover:text-foreground">
                                    <span>Messages</span>
                                    {totalUnreadCount > 0 && (
                                        <Badge className="text-sm">{totalUnreadCount}</Badge>
                                    )}
                                </Link>
                            </SheetClose>
                        </>
                   )}
                  {user ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="justify-start">Logout</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You will be returned to the homepage and will need to sign in again to access your dashboard.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSignOut}>Logout</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

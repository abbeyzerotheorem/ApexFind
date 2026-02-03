
'use client';

import { useState, useMemo } from 'react';
import InstantValuation from '@/components/valuation/InstantValuation';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, User, Home, Star, ShieldCheck, TrendingUp, Building2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
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
import { Badge } from '@/components/ui/badge';

const sellFeatures = [
    {
        icon: TrendingUp,
        title: "Instant Market Data",
        description: "Access real-time pricing trends across Nigeria's top neighborhoods to price your home perfectly.",
        userType: "For Homeowners"
    },
    {
        icon: ShieldCheck,
        title: "Verified Agent Network",
        description: "We match you with LASRERA-vetted professionals who have a proven track record in your specific area.",
        userType: "For Homeowners"
    },
    {
        icon: Building2,
        title: "Premium Exposure",
        description: "Your listing gets featured on our high-traffic search pages, reaching thousands of motivated buyers daily.",
        userType: "For Agents"
    }
]

const testimonials = [
    {
        name: "Engr. Olumide Bakare",
        role: "Property Seller in Abuja",
        image: PlaceHolderImages.find(i => i.id === 'landlord-2')?.imageUrl ?? "",
        imageHint: "professional man",
        testimonial: "Selling my duplex in Maitama was surprisingly fast. The valuation tool gave me a realistic starting point, and the agent I found through ApexFind handled the documentation perfectly. Highly professional service."
    },
      {
        name: "Mrs. Ifeoma Okeke",
        role: "Landlord in Lekki Phase 1",
        image: PlaceHolderImages.find(i => i.id === 'landlord-1')?.imageUrl ?? "",
        imageHint: "business woman",
        testimonial: "I used the valuation tool to check the market value of my rental property. It was easy to use and gave me the confidence to adjust my rates. The platform is a game-changer for Nigerian property owners."
    }
]

export default function SellPage() {
    const [showValuation, setShowValuation] = useState(false);
    const heroImage = PlaceHolderImages.find(p => p.id === 'property-4');

    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();

    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    
    const userDocRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile } = useDoc<{ role?: 'customer' | 'agent' }>(userDocRef);

    const handleListPropertyClick = () => {
        if (!user) {
            setShowAuthDialog(true);
            return;
        }
        if (userProfile?.role === 'agent') {
            router.push('/dashboard/listings/new');
        } else {
            setShowRoleDialog(true);
        }
    };

    return (
        <>
            <div className="relative bg-background min-h-screen">
                 {/* Hero Section */}
                <section className="relative h-[65vh] min-h-[550px] flex items-center justify-center text-center text-white">
                    {heroImage && (
                        <Image
                        src={heroImage.imageUrl}
                        alt="A modern Nigerian house exterior"
                        fill
                        className="object-cover"
                        priority
                        />
                    )}
                    <div className="absolute inset-0 bg-black/65" />
                    <div className="relative z-10 p-4 max-w-5xl mx-auto">
                        <Badge className="mb-6 bg-primary text-primary-foreground font-black px-4 py-1 text-sm uppercase tracking-widest shadow-lg">
                            Now Serving 36 States
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.1]">
                            Sell Your Property <br/><span className="text-primary">With Confidence</span>
                        </h1>
                        <p className="mt-8 max-w-2xl mx-auto text-lg text-gray-200 md:text-xl font-medium leading-relaxed">
                            From instant automated valuations to matching with Nigeria's top-rated agents, we provide the data and expertise you need for a successful sale.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-xl" onClick={() => setShowValuation(true)}>
                                <Home className="mr-2 h-5 w-5" /> Free Instant Valuation
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-black" onClick={handleListPropertyClick}>
                                <User className="mr-2 h-5 w-5" /> Agent Portal
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Primary Actions Section */}
                <section className="py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Choose Your Pathway</h2>
                            <p className="mt-4 text-muted-foreground text-lg">Whether you're just curious or ready to close a deal, we've got you covered.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
                             <Card className="flex flex-col shadow-xl border-2 hover:border-primary/50 transition-all group">
                                <CardHeader className="pb-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                        <Home className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-3xl font-black">For Homeowners</CardTitle>
                                    <CardDescription className="text-lg">Get a professional estimate of your property's value.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground leading-relaxed">
                                        Our AI-driven tool analyzes thousands of recent listings and market trends in your specific city to give you a real-time valuation. It's the perfect first step to understanding your property's potential.
                                    </p>
                                    <ul className="mt-6 space-y-3">
                                        <li className="flex items-center gap-3 text-sm font-bold text-foreground">
                                            <ShieldCheck className="h-5 w-5 text-primary" /> 100% Free & Instant
                                        </li>
                                        <li className="flex items-center gap-3 text-sm font-bold text-foreground">
                                            <ShieldCheck className="h-5 w-5 text-primary" /> Data-driven Accuracy
                                        </li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="pt-6 border-t bg-muted/5">
                                     <Button size="lg" className="w-full h-12 font-bold" onClick={() => setShowValuation(true)}>
                                        Start My Valuation
                                    </Button>
                                </CardFooter>
                            </Card>
                             <Card className="flex flex-col border-primary/20 bg-primary/5 shadow-xl border-2 hover:border-primary/50 transition-all group">
                                <CardHeader className="pb-4">
                                    <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-3xl font-black">For Real Estate Agents</CardTitle>
                                    <CardDescription className="text-lg">Reach motivated buyers and grow your business.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground leading-relaxed">
                                        Join ApexFind's network of verified professionals. Gain access to high-intent leads, professional listing management tools, and deep market insights to help you close more sales.
                                    </p>
                                    <ul className="mt-6 space-y-3">
                                        <li className="flex items-center gap-3 text-sm font-bold text-foreground">
                                            <ShieldCheck className="h-5 w-5 text-primary" /> Professional Verification Badge
                                        </li>
                                        <li className="flex items-center gap-3 text-sm font-bold text-foreground">
                                            <ShieldCheck className="h-5 w-5 text-primary" /> Direct Client Messaging
                                        </li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="pt-6 border-t bg-primary/10">
                                    <Button size="lg" className="w-full h-12 font-bold" onClick={handleListPropertyClick}>
                                        List a Property Now
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Why Sell With Us Section */}
                <section className="py-24 bg-secondary">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-4xl font-black tracking-tight text-foreground">
                                Why Sell with ApexFind?
                            </h2>
                            <p className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground">
                                We're dedicated to making your property sale faster, easier, and more profitable.
                            </p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
                            {sellFeatures.map((feature) => (
                            <div key={feature.title} className="text-center group">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg group-hover:-translate-y-2 transition-transform duration-300">
                                    <feature.icon className="h-8 w-8" />
                                </div>
                                <p className="mt-6 text-xs font-black uppercase tracking-widest text-primary">{feature.userType}</p>
                                <h3 className="mt-2 text-xl font-bold text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="mt-3 text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-24">
                     <div className="container mx-auto px-4 max-w-7xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div>
                                <h2 className="text-4xl font-black tracking-tight">Seller Success Stories</h2>
                                <p className="text-lg text-muted-foreground mt-2">Hear from property owners who closed their deals on ApexFind.</p>
                            </div>
                            <Button variant="outline" className="font-bold border-2 h-12" asChild>
                                <Link href="/agents">Find an Agent to Sell My Home</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {testimonials.map((testimonial) => (
                                <Card key={testimonial.name} className="border-none shadow-xl bg-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-5"><Star size={120} className="fill-primary" /></div>
                                    <CardContent className="p-10 relative z-10">
                                        <div className="flex items-center mb-6">
                                            <Avatar className="h-16 w-16 mr-4 border-2 border-primary/20 shadow-md">
                                                <AvatarImage src={testimonial.image} alt={testimonial.name} data-ai-hint={testimonial.imageHint} className="object-cover" />
                                                <AvatarFallback className="bg-primary/10 text-primary font-black">{testimonial.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-black text-xl text-foreground">{testimonial.name}</p>
                                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{testimonial.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex mb-6">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-lg text-muted-foreground italic leading-relaxed">"{testimonial.testimonial}"</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 border-t bg-primary/5">
                    <div className="container mx-auto px-4 text-center max-w-3xl">
                        <h2 className="text-3xl font-black mb-6">Ready to list your property?</h2>
                        <p className="text-lg text-muted-foreground mb-10">Join thousands of Nigerian homeowners and agents who trust ApexFind for their real estate transactions.</p>
                        <Button size="lg" className="h-14 px-10 text-lg font-black shadow-xl" onClick={handleListPropertyClick}>
                            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </section>
            </div>

            {showValuation && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowValuation(false)}>
                <div className="bg-background rounded-3xl max-w-4xl w-full max-h-[95vh] relative flex flex-col shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowValuation(false)}
                    className="absolute top-4 right-4 z-20 rounded-full bg-muted/50 hover:bg-muted"
                  >
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close valuation</span>
                  </Button>
                  <div className="overflow-y-auto custom-scrollbar">
                     <InstantValuation />
                  </div>
                </div>
              </div>
            )}

            <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-black">Authentication Required</AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    You need to be signed in to an agent account to list properties. Please sign in or create a new agent account to continue.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel className="h-12 font-bold">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push('/auth')} className="h-12 font-bold">Sign In / Sign Up</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <User className="h-8 w-8" />
                  </div>
                  <AlertDialogTitle className="text-2xl font-black text-center">Agent Account Required</AlertDialogTitle>
                  <AlertDialogDescription className="text-base text-center">
                    It looks like you're signed in as a standard user. Only verified **Real Estate Agents** can list properties on ApexFind.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="bg-muted/30 p-4 rounded-xl text-sm space-y-2 my-4">
                    <p className="font-bold text-foreground">As an Agent you get:</p>
                    <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                        <li>Unlimited property listings</li>
                        <li>Direct lead generation</li>
                        <li>Professional analytics dashboard</li>
                    </ul>
                </div>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="h-12 font-bold flex-1">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push('/dashboard/profile')} className="h-12 font-bold flex-1 bg-primary text-primary-foreground">Upgrade My Profile</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

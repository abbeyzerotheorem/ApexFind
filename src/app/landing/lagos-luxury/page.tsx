
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ShieldCheck, MapPin, Building2, Phone, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function LandingPageHeader() {
    return (
        <header className="absolute top-0 left-0 right-0 z-20 p-4">
            <div className="container mx-auto flex justify-between items-center">
                 <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/ApexFindlogo.png"
                        alt="ApexFind Logo"
                        width={28}
                        height={28}
                        className="h-7 w-7"
                    />
                    <span className="text-xl font-bold text-white">ApexFind</span>
                </Link>
                <Button variant="outline" className="text-white border-white bg-transparent hover:bg-white hover:text-black" asChild>
                    <Link href="/contact">Contact Us</Link>
                </Button>
            </div>
        </header>
    );
}

function LandingPageFooter() {
    return (
         <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
            <div className="container mx-auto px-4 text-center">
                 <p>&copy; {new Date().getFullYear()} ApexFind Luxury Division. All rights reserved.</p>
                 <div className="mt-6 flex justify-center gap-6">
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Support</Link>
                 </div>
            </div>
        </footer>
    )
}

const features = [
    {
        icon: MapPin,
        title: "Prime Locations",
        description: "Reside in Lagos's most prestigious neighborhoods, from the waterfront of Eko Atlantic to the serene avenues of Ikoyi."
    },
    {
        icon: Building2,
        title: "Exquisite Designs",
        description: "Experience architectural marvels and world-class interiors designed for the ultimate comfort and aesthetic pleasure."
    },
    {
        icon: ShieldCheck,
        title: "Unmatched Security",
        description: "Enjoy peace of mind with state-of-the-art security systems and personnel in every property we feature."
    }
]

export default function LagosLuxuryLandingPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'property-5');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate lead capture
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <LandingPageHeader />
            
            {/* Hero Section */}
            <section className="relative h-screen min-h-[750px] flex items-center">
                 {heroImage && (
                    <Image
                    src={heroImage.imageUrl}
                    alt="Luxury apartment with a pool view"
                    fill
                    className="object-cover"
                    priority
                    data-ai-hint="luxury penthouse"
                    />
                )}
                <div className="absolute inset-0 bg-black/70" />
                <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="text-center lg:text-left space-y-6">
                        <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1 font-bold uppercase tracking-widest">
                            Limited Availability
                        </Badge>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
                            Discover Unmatched Luxury <br/><span className="text-primary">in Lagos</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-xl text-gray-300 leading-relaxed">
                           Gain exclusive access to a curated collection of high-end apartments in Lagos's most coveted locations.
                        </p>
                    </div>
                    <div>
                        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-white text-3xl font-black">Get Exclusive Access</CardTitle>
                                <CardDescription className="text-gray-400 text-base pt-2">
                                    Our luxury property specialists will contact you within 2 hours.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                {submitted ? (
                                    <div className="text-center py-10 space-y-4 animate-in zoom-in-95">
                                        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold">Inquiry Received</h3>
                                        <p className="text-gray-400">A senior consultant has been assigned to your request.</p>
                                        <Button variant="outline" className="mt-4 border-white/20 text-white" onClick={() => setSubmitted(false)}>Send Another Request</Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleLeadSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-gray-300 font-bold">Full Name</Label>
                                            <Input id="name" placeholder="Chief John Doe" required className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 h-14 text-lg" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-gray-300 font-bold">Email Address</Label>
                                            <Input id="email" type="email" placeholder="john@luxury.ng" required className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 h-14 text-lg" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-gray-300 font-bold">Phone Number</Label>
                                            <Input id="phone" placeholder="+234 800..." required className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 h-14 text-lg" />
                                        </div>
                                        <Button size="lg" type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 h-14 text-xl font-black shadow-lg">
                                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                            Request Consultation
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-800/50">
                <div className="container mx-auto px-4">
                     <div className="text-center mb-20">
                        <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                            The Apex of Lagos Living
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 leading-relaxed">
                            Our portfolio is more than just apartments; it's a curated lifestyle for the discerning few.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-16 text-center">
                        {features.map(feature => (
                             <div key={feature.title} className="flex flex-col items-center group">
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl border border-primary/20">
                                  <feature.icon className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black text-white">
                                  {feature.title}
                                </h3>
                                <p className="mt-4 text-gray-400 leading-relaxed">
                                  {feature.description}
                                </p>
                              </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Trust Signals / Testimonial */}
             <section className="py-24">
                <div className="container mx-auto px-4 max-w-5xl text-center">
                    <h2 className="text-3xl font-black mb-12 uppercase tracking-widest text-primary">Trusted by Icons</h2>
                    <Card className="bg-white/5 border-white/10 relative overflow-hidden backdrop-blur-sm">
                        <CardContent className="p-16 relative z-10">
                            <p className="text-2xl italic text-gray-200 mb-8 leading-relaxed font-medium">
                                "The ApexFind team provided an exceptional service, helping me secure a stunning penthouse in Eko Atlantic. Their portfolio is truly exclusive and their discretion is unmatched."
                            </p>
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-12 h-1 bg-primary mb-4 rounded-full" />
                                <p className="font-black text-xl text-white tracking-widest">CHIEF T. ALAKIJA</p>
                                <p className="text-primary text-sm font-bold uppercase mt-1">Property Investor</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
             </section>

            {/* Direct Contact Section */}
            <section className="py-24 bg-gray-900 border-t border-gray-800">
                 <div className="container mx-auto px-4 text-center max-w-3xl">
                     <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                        Ready to Begin Your Journey?
                    </h2>
                    <p className="mt-6 text-xl text-gray-400 leading-relaxed">
                        For a private, strictly confidential consultation, please contact our luxury property division directly.
                    </p>
                    <div className="mt-12">
                         <Button size="lg" variant="outline" className="text-white border-white bg-transparent hover:bg-white hover:text-black h-16 px-10 text-xl font-black shadow-2xl transition-all" asChild>
                            <a href="tel:+23480027393463">
                                <Phone className="mr-3 h-6 w-6" /> Call Private Division
                            </a>
                        </Button>
                    </div>
                 </div>
            </section>
            <LandingPageFooter />
        </div>
    );
}

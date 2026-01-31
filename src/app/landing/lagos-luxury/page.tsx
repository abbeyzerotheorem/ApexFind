
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ShieldCheck, MapPin, Building2, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Minimal navigation for the landing page
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
                <Button variant="outline" className="text-white border-white bg-transparent hover:bg-white hover:text-black">
                    Contact Us
                </Button>
            </div>
        </header>
    );
}

function LandingPageFooter() {
    return (
         <footer className="bg-gray-900 text-gray-400 py-8">
            <div className="container mx-auto px-4 text-center">
                 <p>&copy; {new Date().getFullYear()} ApexFind. All rights reserved.</p>
                 <div className="mt-4 flex justify-center gap-4">
                    <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-white">Terms of Service</Link>
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

    return (
        <div className="bg-gray-900 text-white">
            <LandingPageHeader />
            
            {/* Hero Section */}
            <section className="relative h-screen min-h-[700px] flex items-center">
                 {heroImage && (
                    <Image
                    src={heroImage.imageUrl}
                    alt="Luxury apartment with a pool view"
                    fill
                    className="object-cover"
                    priority
                    />
                )}
                <div className="absolute inset-0 bg-black/70" />
                <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                            Discover Unmatched Luxury in Lagos
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg text-gray-200">
                           Gain exclusive access to a curated collection of high-end apartments in Lagos's most coveted locations.
                        </p>
                    </div>
                    <div>
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                            <CardHeader className="text-center">
                                <CardTitle className="text-white text-2xl">Get Exclusive Access</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Fill out the form to connect with a luxury property specialist.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                                        <Input id="name" placeholder="Enter your name" className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 h-12" />
                                    </div>
                                     <div className="space-y-1">
                                        <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                                        <Input id="email" type="email" placeholder="Enter your email" className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 h-12" />
                                    </div>
                                     <div className="space-y-1">
                                        <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                                        <Input id="phone" placeholder="Enter your phone number" className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 h-12" />
                                    </div>
                                    <Button size="lg" className="w-full bg-primary h-12 text-lg">
                                        Submit
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-800">
                <div className="container mx-auto px-4">
                     <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold tracking-tight text-white">
                            The Apex of Lagos Living
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
                            Our portfolio is more than just apartments; it's a lifestyle.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {features.map(feature => (
                             <div key={feature.title} className="flex flex-col items-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-6">
                                  <feature.icon className="h-8 w-8" />
                                </div>
                                <h3 className="mt-2 text-xl font-bold text-white">
                                  {feature.title}
                                </h3>
                                <p className="mt-2 text-gray-400">
                                  {feature.description}
                                </p>
                              </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Trust Signals / Testimonial */}
             <section className="py-20">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-3xl font-bold mb-8">Trusted by Discerning Clients</h2>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-10">
                            <p className="text-xl italic text-gray-300 mb-6">"The ApexFind team provided an exceptional service, helping me secure a stunning penthouse in Eko Atlantic. Their portfolio is truly exclusive and their discretion is unmatched."</p>
                            <div className="flex items-center justify-center">
                                <p className="font-bold text-white"> - Chief T. Alakija</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
             </section>

            {/* Direct Contact Section */}
            <section className="py-20 bg-gray-900 border-t border-gray-800">
                 <div className="container mx-auto px-4 text-center max-w-3xl">
                     <h2 className="text-4xl font-bold tracking-tight text-white">
                        Ready to Begin Your Journey?
                    </h2>
                    <p className="mt-4 mx-auto text-lg text-gray-300">
                        For a private consultation, please contact our luxury property division directly.
                    </p>
                    <div className="mt-8">
                         <Button size="lg" variant="outline" className="text-white border-white bg-transparent hover:bg-white hover:text-black h-14 text-xl">
                            <Phone className="mr-3" /> Call Us Now
                        </Button>
                    </div>
                 </div>
            </section>
            <LandingPageFooter />
        </div>
    );
}

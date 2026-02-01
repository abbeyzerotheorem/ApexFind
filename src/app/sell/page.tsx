
'use client';

import { useState } from 'react';
import InstantValuation from '@/components/valuation/InstantValuation';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, User, Home, Star } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const sellFeatures = [
    {
        icon: Home,
        title: "Instant Valuation",
        description: "Get a data-driven estimate of your home's value in minutes.",
        userType: "For Homeowners"
    },
    {
        icon: User,
        title: "Expert Agent Matching",
        description: "Connect with top-rated local agents who know your market inside-out.",
        userType: "For Homeowners"
    },
    {
        icon: ArrowRight,
        title: "Effortless Listing",
        description: "Our streamlined form lets you list your property in minutes, reaching thousands of potential buyers.",
        userType: "For Agents"
    }
]

const testimonials = [
    {
        name: "Mr. Chidi Nwosu",
        role: "Property Seller in Abuja",
        image: PlaceHolderImages.find(i => i.id === 'landlord-2')?.imageUrl ?? "",
        imageHint: PlaceHolderImages.find(i => i.id === 'landlord-2')?.imageHint ?? "",
        testimonial: "Selling my property through ApexFind was seamless. The platform gave my listing great visibility, and I connected with a serious buyer in less than a month. The process was transparent and professional from start to finish."
    },
      {
        name: "Mrs. Fatima Bello",
        role: "Landlord in Lagos",
        image: PlaceHolderImages.find(i => i.id === 'landlord-1')?.imageUrl ?? "",
        imageHint: PlaceHolderImages.find(i => i.id === 'landlord-1')?.imageHint ?? "",
        testimonial: "The instant valuation tool was surprisingly accurate and gave me the confidence to list my property. I found a great agent through the platform who handled everything. Highly recommended for any Nigerian property owner!"
    }
]

export default function SellPage() {
    const [showValuation, setShowValuation] = useState(false);
    const heroImage = PlaceHolderImages.find(p => p.id === 'property-4');

    return (
        <>
            <div className="relative bg-background">
                 {/* Hero Section */}
                <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center text-center text-white">
                    {heroImage && (
                        <Image
                        src={heroImage.imageUrl}
                        alt="A modern Nigerian house with a for sale sign"
                        fill
                        className="object-cover"
                        priority
                        />
                    )}
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="relative z-10 p-4">
                    <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
                        Sell Your Property Your Way
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-200 md:text-xl">
                        Whether you're exploring your options or ready to list, ApexFind provides the tools and expertise for a successful sale in Nigeria.
                    </p>
                    </div>
                </section>

                {/* Options Section */}
                <section className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                             <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-2xl">For Homeowners</CardTitle>
                                    <CardDescription>Curious about your property's value? Start with a free, instant estimate.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground">
                                        Our tool analyzes millions of data points on Nigerian properties to give you a real-time valuation. It's the perfect first step to understanding your financial position, even if you're not ready to sell.
                                    </p>
                                </CardContent>
                                <CardContent>
                                     <Button size="lg" className="w-full" onClick={() => setShowValuation(true)}>
                                        Get Instant Estimate
                                    </Button>
                                </CardContent>
                            </Card>
                             <Card className="flex flex-col border-primary bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-2xl">For Real Estate Agents</CardTitle>
                                    <CardDescription>List your properties and connect with thousands of motivated buyers today.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground">
                                        Join our network of verified professionals. Our platform gives you the tools to manage your listings, track performance, and communicate seamlessly with potential clients.
                                    </p>
                                </CardContent>
                                <CardContent>
                                    <Button size="lg" className="w-full" asChild>
                                        <Link href="/dashboard/listings/new">List a Property</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Why Sell With Us Section */}
                <section className="py-16 sm:py-24 bg-secondary">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Why Sell with ApexFind?
                            </h2>
                            <p className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground">
                                We're dedicated to making your property sale faster, easier, and more profitable.
                            </p>
                        </div>
                        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
                            {sellFeatures.map((feature) => (
                            <div key={feature.title} className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <feature.icon className="h-6 w-6" />
                                </div>
                                <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-primary">{feature.userType}</p>
                                <h3 className="mt-2 text-xl font-bold text-foreground">
                                {feature.title}
                                </h3>
                                <p className="mt-2 text-muted-foreground">
                                {feature.description}
                                </p>
                            </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-16 sm:py-24">
                     <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Success Stories from Sellers</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {testimonials.map((testimonial) => (
                                <Card key={testimonial.name}>
                                    <CardContent className="p-8">
                                        <div className="flex items-center mb-4">
                                            <Avatar className="h-14 w-14 mr-4">
                                                <AvatarImage src={testimonial.image} alt={testimonial.name} data-ai-hint={testimonial.imageHint} />
                                                <AvatarFallback>{testimonial.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-foreground">{testimonial.name}</p>
                                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-muted-foreground italic">"{testimonial.testimonial}"</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {showValuation && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowValuation(false)}>
                <div className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] relative flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowValuation(false)}
                    className="absolute top-2 right-2 z-10 rounded-full bg-background/50 hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close valuation</span>
                  </Button>
                  <div className="overflow-y-auto">
                     <InstantValuation />
                  </div>
                </div>
              </div>
            )}
        </>
    );
}

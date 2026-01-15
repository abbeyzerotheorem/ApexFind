

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Check, Circle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const features = [
    { name: "Online Applications", description: "Receive and review rental applications seamlessly." },
    { name: "Tenant Screening", description: "Access comprehensive background and credit checks." },
    { name: "Online Rent Collection", description: "Get paid on time, every time, with automated payments." },
    { name: "Listing Syndication", description: "Post your rental on ApexFind and other major listing sites." },
];

const landlordTestimonials = [
    {
        name: "Chioma Nwosu",
        location: "Lagos Landlord",
        testimonial: "ApexFind has been a game-changer for my rental business. The tenant screening is top-notch, and online rent collection saves me so much time. I found a reliable tenant in less than a week!",
        imageUrl: PlaceHolderImages.find((img) => img.id === "landlord-1")?.imageUrl ?? "",
        imageHint: PlaceHolderImages.find((img) => img.id === "landlord-1")?.imageHint ?? "",
    },
    {
        name: "Adamu Garba",
        location: "Abuja Property Manager",
        testimonial: "The platform is incredibly user-friendly. Listing a property is straightforward, and the quality of applicants I receive has improved significantly. I highly recommend ApexFind to any landlord.",
        imageUrl: PlaceHolderImages.find((img) => img.id === "landlord-2")?.imageUrl ?? "",
        imageHint: PlaceHolderImages.find((img) => img.id === "landlord-2")?.imageHint ?? "",
    }
]

export default function RentalsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-grow">
                <section className="bg-secondary py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                                Effortless Rental Management
                            </h1>
                            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                                All the tools you need to find great tenants, manage your properties, and grow your rental business.
                            </p>
                            <div className="mt-10">
                                <Button size="lg">
                                    List Your Rental Property
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="py-20 sm:py-24">
                     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                                Built for Landlords Like You
                            </h2>
                             <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                                From listing to lease, we’ve got you covered.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature) => (
                                <div key={feature.name} className="flex flex-col items-center text-center">
                                     <CheckCircle className="h-10 w-10 text-primary" />
                                    <h3 className="mt-4 text-xl font-semibold">{feature.name}</h3>
                                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                         <div className="mt-16 text-center">
                             <Button size="lg" variant="outline">Learn More About Our Tools</Button>
                        </div>
                    </div>
                </section>

                <section className="bg-secondary py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                             <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                                Simple, Transparent Pricing
                            </h2>
                             <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                                Choose the plan that's right for you.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>Basic</CardTitle>
                                    <CardDescription>For landlords just getting started.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-4xl font-bold">Free</p>
                                    <ul className="mt-6 space-y-4">
                                        <li className="flex items-start gap-3"><Check className="h-6 w-6 text-primary flex-shrink-0" /><span>List one property at a time</span></li>
                                        <li className="flex items-start gap-3"><Check className="h-6 w-6 text-primary flex-shrink-0" /><span>Online applications</span></li>
                                        <li className="flex items-start gap-3"><Check className="h-6 w-6 text-primary flex-shrink-0" /><span>Basic tenant screening</span></li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" variant="outline">Get Started</Button>
                                </CardFooter>
                            </Card>
                             <Card className="border-primary flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between">
                                        <CardTitle>Premium</CardTitle>
                                        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Most Popular</div>
                                    </div>
                                    <CardDescription>For landlords who want to maximize their reach.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                     <p><span className="text-4xl font-bold">₦25,000</span><span className="text-muted-foreground">/listing</span></p>
                                    <ul className="mt-6 space-y-4">
                                        <li className="flex items-start gap-3"><Check className="h-6 w-6 text-primary flex-shrink-0" /><span>List unlimited properties</span></li>
                                        <li className="flex items-start gap-3"><Check className="h-6 w-6 text-primary flex-shrink-0" /><span>Syndication to top rental sites</span></li>
                                        <li className="flex items-start gap-3"><Check className="h-6 w-6 text-primary flex-shrink-0" /><span>Advanced tenant screening & credit checks</span></li>
                                        <li className="flex items-start gap-3"><Check className="h-6 w-6 text-primary flex-shrink-0" /><span>Online rent collection</span></li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                     <Button className="w-full">Choose Premium</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </section>
                
                <section className="py-20 sm:py-24">
                     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                         <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                                What Landlords Are Saying
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                            {landlordTestimonials.map((testimonial) => (
                                <blockquote key={testimonial.name} className="flex flex-col items-center text-center">
                                    <p className="text-lg text-foreground leading-relaxed">"{testimonial.testimonial}"</p>
                                    <footer className="mt-6">
                                        <Avatar className="h-16 w-16 mx-auto">
                                            <AvatarImage src={testimonial.imageUrl} alt={testimonial.name} data-ai-hint={testimonial.imageHint}/>
                                            <AvatarFallback>{testimonial.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                        </Avatar>
                                        <div className="mt-3">
                                            <p className="font-bold text-foreground">{testimonial.name}</p>
                                            <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                                        </div>
                                    </footer>
                                </blockquote>
                            ))}
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    )
}

    
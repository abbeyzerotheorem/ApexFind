
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const features = [
    { name: "Online Applications", description: "Receive and review rental applications seamlessly." },
    { name: "Tenant Screening", description: "Access comprehensive background and credit checks." },
    { name: "Online Rent Collection", description: "Get paid on time, every time, with automated payments." },
    { name: "Listing Syndication", description: "Post your rental on ApexFind and other major listing sites." },
];

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

            </main>
            <Footer />
        </div>
    )
}

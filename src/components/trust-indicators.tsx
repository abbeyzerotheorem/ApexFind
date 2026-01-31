import { ShieldCheck, Home, Users } from 'lucide-react';

const trustFeatures = [
    {
        icon: ShieldCheck,
        title: "Verified Listings",
        description: "Every property is checked by our team to ensure quality and accuracy."
    },
    {
        icon: Users,
        title: "Expert Agents",
        description: "Connect with top-rated agents who are experts in their local markets."
    },
    {
        icon: Home,
        title: "Secure Transactions",
        description: "We provide a secure platform for all your real estate transactions."
    }
]

export default function TrustIndicators() {
    return (
        <section className="bg-secondary py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {trustFeatures.map((feature) => (
                        <div key={feature.title} className="p-6">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-foreground">{feature.title}</h3>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

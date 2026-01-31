import { Star } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from './ui/card';


const testimonials = [
    {
        name: "Bisi Adekunle",
        role: "Home Buyer in Lekki",
        image: PlaceHolderImages.find(i => i.id === 'agent-1')?.imageUrl ?? "",
        imageHint: PlaceHolderImages.find(i => i.id === 'agent-1')?.imageHint ?? "",
        testimonial: "ApexFind made my home search incredibly easy. I found my dream apartment in Lekki within weeks. The agents are professional and trustworthy."
    },
    {
        name: "Emeka Nwosu",
        role: "Property Seller in Abuja",
        image: PlaceHolderImages.find(i => i.id === 'agent-2')?.imageUrl ?? "",
        imageHint: PlaceHolderImages.find(i => i.id === 'agent-2')?.imageHint ?? "",
        testimonial: "Selling my property through ApexFind was seamless. The platform gave my listing great visibility, and I connected with a serious buyer quickly."
    },
      {
        name: "Fatima Ibrahim",
        role: "Renter in Port Harcourt",
        image: PlaceHolderImages.find(i => i.id === 'agent-4')?.imageUrl ?? "",
        imageHint: PlaceHolderImages.find(i => i.id === 'agent-4')?.imageHint ?? "",
        testimonial: "As a first-time renter, I was nervous. The agents on ApexFind were so helpful and guided me through the entire process. Highly recommended!"
    }
]

export default function Testimonials() {
    return (
        <section className="bg-secondary py-16 sm:py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.name}>
                            <CardContent className="p-8">
                                <div className="flex items-center mb-4">
                                    <Avatar className="h-12 w-12 mr-4">
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
    )
}


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, Building, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props} fill="currentColor">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.85L2.3 22l5.42-1.42c1.42.75 3.01 1.18 4.67 1.18h.01c5.46 0 9.91-4.45 9.91-9.91 0-5.47-4.45-9.92-9.91-9.92zM17.15 15.5c-.29-.14-1.71-.84-1.98-.94-.27-.1-.47-.15-.66.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.43-1.72-1.6-2-.17-.29-.02-.44.13-.59.13-.13.3-.34.45-.51s.2-.3.3-.5c.1-.2.05-.37-.03-.52s-.66-1.6-1-2.18c-.22-.47-.45-.4-.63-.4-.18 0-.38.03-.58.03-.2 0-.52.07-.79.37s-1.03 1-1.26 2.4c-.23 1.4.1 2.8.23 3s1.24 2.37 3 3.52c1.76 1.15 3.03 1.54 4.09 1.8.35.1.66.07.9-.05.29-.12.92-1.07 1.22-1.45.3-.38.3-.7.2-1.08z" />
    </svg>
);

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setFormSubmitted(true);
        }, 1500);
    };

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <section className="bg-secondary/50 py-12 sm:py-20 border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">How can we help?</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Our team is available to assist you with property inquiries, agent verification, or technical support.
                    </p>
                </div>
            </section>

            {/* Contact Options Grid */}
            <section className="py-16">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-8">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-6">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg">Call Us</h3>
                                <p className="text-sm text-muted-foreground mt-2">Mon-Fri, 9am-5pm WAT</p>
                                <a href="tel:+23480027393463" className="mt-4 block font-bold text-primary hover:underline">+234 800-APEX-FIND</a>
                            </CardContent>
                        </Card>
                         <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-8">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-6">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg">Email Support</h3>
                                <p className="text-sm text-muted-foreground mt-2">Expect a reply within 24h</p>
                                <a href="mailto:support@apexfind.ng" className="mt-4 block font-bold text-primary hover:underline">support@apexfind.ng</a>
                            </CardContent>
                        </Card>
                         <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-8">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#25D366] mb-6">
                                    <WhatsAppIcon className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg">WhatsApp</h3>
                                <p className="text-sm text-muted-foreground mt-2">Fastest for quick inquiries</p>
                                <a href="https://wa.me/2348012345678" target="_blank" rel="noopener noreferrer" className="mt-4 block font-bold text-[#25D366] hover:underline">+234 801 234 5678</a>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
            
            {/* Main Content (Form & Location) */}
            <section className="py-16 bg-secondary/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <Card className="shadow-lg border-none">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Submit an Inquiry</CardTitle>
                                    <CardDescription>Our support specialists will review your message and get back to you shortly.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {formSubmitted ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="bg-green-100 p-4 rounded-full mb-6">
                                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-foreground">Message Received</h3>
                                            <p className="text-muted-foreground mt-2 max-w-xs">
                                                Thank you for reaching out. We've received your request and will contact you via email shortly.
                                            </p>
                                            <Button variant="outline" className="mt-8" onClick={() => setFormSubmitted(false)}>Send Another Message</Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input id="name" placeholder="John Doe" required className="h-11" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address</Label>
                                                    <Input id="email" type="email" placeholder="john@example.com" required className="h-11" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category">What can we help with?</Label>
                                                <Select required>
                                                    <SelectTrigger id="category" className="h-11">
                                                        <SelectValue placeholder="Select a topic" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="general">Property Inquiry</SelectItem>
                                                        <SelectItem value="agent">Agent Verification</SelectItem>
                                                        <SelectItem value="listing">List My Property</SelectItem>
                                                        <SelectItem value="technical">Technical Issue</SelectItem>
                                                        <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="message">Message Details</Label>
                                                <Textarea id="message" rows={5} placeholder="Tell us more about your request..." required className="resize-none" />
                                            </div>
                                            <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Sending...</span>
                                                ) : 'Send Message'}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        {/* Location Details */}
                        <div className="space-y-10">
                             <div className="space-y-6">
                                <h2 className="text-3xl font-bold">Our Headquarters</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 bg-primary/10 p-2 rounded-lg"><Building className="h-5 w-5 text-primary" /></div>
                                        <div>
                                            <p className="font-bold text-lg leading-none mb-1">ApexFind Tech Ltd</p>
                                            <p className="text-muted-foreground">123 Apex Towers, Victoria Island, Lagos, Nigeria</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 bg-primary/10 p-2 rounded-lg"><Clock className="h-5 w-5 text-primary" /></div>
                                         <div>
                                            <p className="font-bold text-lg leading-none mb-1">Business Hours</p>
                                            <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM (WAT)</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                            <div className="aspect-video w-full overflow-hidden rounded-2xl border shadow-lg bg-muted relative">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    src="https://www.openstreetmap.org/export/embed.html?bbox=3.4118,6.4197,3.4318,6.4397&layer=mapnik&marker=6.4297,3.4218"
                                    className="absolute inset-0 grayscale contrast-125"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

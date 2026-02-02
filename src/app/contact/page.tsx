
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, Building, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props} fill="currentColor">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.85L2.3 22l5.42-1.42c1.42.75 3.01 1.18 4.67 1.18h.01c5.46 0 9.91-4.45 9.91-9.91 0-5.47-4.45-9.92-9.91-9.92zM17.15 15.5c-.29-.14-1.71-.84-1.98-.94-.27-.1-.47-.15-.66.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.43-1.72-1.6-2-.17-.29-.02-.44.13-.59.13-.13.3-.34.45-.51s.2-.3.3-.5c.1-.2.05-.37-.03-.52s-.66-1.6-1-2.18c-.22-.47-.45-.4-.63-.4-.18 0-.38.03-.58.03-.2 0-.52.07-.79.37s-1.03 1-1.26 2.4c-.23 1.4.1 2.8.23 3s1.24 2.37 3 3.52c1.76 1.15 3.03 1.54 4.09 1.8.35.1.66.07.9-.05.29-.12.92-1.07 1.22-1.45.3-.38.3-.7.2-1.08z" />
    </svg>
);

export default function ContactPage() {
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitted(true);
    };

    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="bg-secondary py-12 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Get in Touch</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        We're here to help. Whether you're a buyer, seller, or agent, find the best way to reach us below.
                    </p>
                </div>
            </section>

            {/* Contact Options Grid */}
            <section className="py-16 sm:py-24">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <Card>
                            <CardHeader>
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <CardTitle className="mt-4">Call Us</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">For immediate assistance</p>
                                <a href="tel:+23480027393463" className="mt-2 block font-semibold text-primary hover:underline">+234 800-APEX-FIND</a>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <CardTitle className="mt-4">Email Us</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">For general inquiries</p>
                                <a href="mailto:support@apexfind.ng" className="mt-2 block font-semibold text-primary hover:underline">support@apexfind.ng</a>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#25D366] text-white">
                                    <WhatsAppIcon className="h-6 w-6" />
                                </div>
                                <CardTitle className="mt-4">WhatsApp</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">For quick chats</p>
                                <a href="https://wa.me/2348012345678" target="_blank" rel="noopener noreferrer" className="mt-2 block font-semibold text-primary hover:underline">+234 801 234 5678</a>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
            
            {/* Main Content (Form & Location) */}
            <section className="py-16 sm:py-24 bg-secondary">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Send us a Message</CardTitle>
                                    <CardDescription>Fill out the form and we'll get back to you within 24-48 hours.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {formSubmitted ? (
                                        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 [&>svg]:text-green-600">
                                            <AlertTitle>Thank You!</AlertTitle>
                                            <AlertDescription>
                                                Your message has been sent. Our team will get back to you shortly.
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input id="name" placeholder="Enter your full name" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address</Label>
                                                    <Input id="email" type="email" placeholder="Enter your email" required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Select required>
                                                    <SelectTrigger id="category">
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="general">General Inquiry</SelectItem>
                                                        <SelectItem value="technical">Technical Support</SelectItem>
                                                        <SelectItem value="agent">Agent Support</SelectItem>
                                                        <SelectItem value="partnership">Partnership</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="message">Message</Label>
                                                <Textarea id="message" rows={5} placeholder="How can we help you?" required />
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor="attachment">Attachment (Optional)</Label>
                                                <Input id="attachment" type="file" />
                                            </div>
                                            <Button type="submit" className="w-full">Send Message</Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        {/* Location Details */}
                        <div className="space-y-8">
                             <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Our Office</h2>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0"><Building className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <p className="font-semibold">ApexFind Lagos HQ</p>
                                        <p className="text-muted-foreground">123 Apex Towers, Victoria Island, Lagos, Nigeria</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0"><Clock className="h-5 w-5 text-primary" /></div>
                                     <div>
                                        <p className="font-semibold">Business Hours</p>
                                        <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM (WAT)</p>
                                    </div>
                                </div>
                             </div>
                            <div className="aspect-video w-full overflow-hidden rounded-lg border">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    src="https://www.openstreetmap.org/export/embed.html?bbox=3.4118,6.4197,3.4318,6.4397&layer=mapnik&marker=6.4297,3.4218"
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

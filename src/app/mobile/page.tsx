
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { 
  Bell, 
  MessageSquare, 
  EyeOff, 
  Camera, 
  Layers, 
  Download, 
  Apple, 
  Smartphone,
  ScanSearch,
  MapPin,
  Star
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const mainFeatures = [
  {
    icon: Bell,
    title: "Instant Property Alerts",
    description: "Get notified the second a property matching your criteria hits the market. Beat the competition with real-time push notifications."
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description: "Chat directly with verified agents and owners. Send voice notes, documents, and schedule viewings instantly."
  },
  {
    icon: EyeOff,
    title: "Offline Viewing",
    description: "Save your favorite listings and view them even without an internet connection. Perfect for areas with limited data coverage."
  },
  {
    icon: ScanSearch,
    title: "Image Recognition Search",
    description: "See a house you like? Take a photo and ApexFind will find similar listings or provide market data for that specific area."
  },
  {
    icon: Layers,
    title: "AR Virtual Staging",
    description: "Visualize how your furniture fits into a space using our Augmented Reality tool. Try different layouts before you move in."
  }
];

const mobileExclusive = [
  {
    icon: Camera,
    title: "Quick Property Scan",
    description: "Scan physical 'For Sale' signs to get instant digital details."
  },
  {
    icon: MapPin,
    title: "Geo-Fence Alerts",
    description: "Receive alerts when you're physically near a property that matches your favorites."
  },
  {
    icon: Star,
    title: "App-Only Listings",
    description: "Access exclusive early-bird properties available only on the mobile app."
  }
];

export default function MobileAppPage() {
  const mockupImage = PlaceHolderImages.find(img => img.id === 'mobile-app-mockup');

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32 bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <Badge variant="secondary" className="mb-4 text-primary bg-primary/10">
                Newly Updated v2.0
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                ApexFind in your pocket
              </h1>
              <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                Find your dream home in Nigeria with the power of AI and AR. Our mobile app offers features you won't find anywhere else.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-14 px-8 text-lg font-bold gap-3">
                  <Download className="h-5 w-5" /> Download App
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold" asChild>
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start grayscale opacity-60">
                <Apple className="h-8 w-8" />
                <Smartphone className="h-8 w-8" />
                <span className="font-bold text-lg">AppGallery</span>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl overflow-hidden max-w-[300px] border-8 border-gray-900 aspect-[9/19]">
                {mockupImage && (
                  <Image
                    src={mockupImage.imageUrl}
                    alt="ApexFind Mobile App"
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Engineered for the Modern Home Seeker
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We've packed the ApexFind app with powerful tools to make your property journey smoother and faster.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature) => (
              <Card key={feature.title} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Exclusive Section */}
      <section className="bg-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
                Mobile-Only Features
              </h2>
              <div className="space-y-8">
                {mobileExclusive.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{item.title}</h4>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-16 lg:mt-0 p-8 bg-background rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-center">Ready to get started?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16 flex items-center gap-3 justify-start px-6">
                  <Apple className="h-6 w-6" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase">Download on</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-16 flex items-center gap-3 justify-start px-6">
                  <Smartphone className="h-6 w-6" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase">Get it on</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-16 flex items-center gap-3 justify-start px-6">
                  <Download className="h-6 w-6" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase">Huawei</div>
                    <div className="text-sm font-bold">AppGallery</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-16 flex items-center gap-3 justify-start px-6">
                  <Layers className="h-6 w-6" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase">Direct</div>
                    <div className="text-sm font-bold">Download APK</div>
                  </div>
                </Button>
              </div>
              <p className="mt-8 text-xs text-muted-foreground text-center">
                Compatible with iOS 14.0+ and Android 8.0+. <br />
                Direct APK download is recommended for users with slow store access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-primary rounded-3xl p-12 text-primary-foreground shadow-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl mb-6">Experience the future of Nigerian real estate</h2>
            <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto">
              Join 50,000+ Nigerians finding, buying, and renting homes with smarter tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="font-bold">
                Get the App Now
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

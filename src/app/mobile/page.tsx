
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
  Star,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleDownloadClick = () => {
    toast({
      title: "Coming Soon!",
      description: "We are putting the final touches on our iOS and Android apps. You'll be notified as soon as they're live!",
    });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32 bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <Badge variant="secondary" className="mb-4 text-primary bg-primary/10 font-bold uppercase tracking-widest">
                New Version 2.0
              </Badge>
              <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl leading-[1.1]">
                ApexFind in your pocket
              </h1>
              <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                Find your dream home in Nigeria with the power of AI and AR. Our mobile app offers features you won't find anywhere else.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-14 px-8 text-lg font-black gap-3 shadow-xl" onClick={handleDownloadClick}>
                  <Download className="h-5 w-5" /> Download App
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-2" asChild>
                  <a href="#features">Explore Features</a>
                </Button>
              </div>
              <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start grayscale opacity-40">
                <div className="flex items-center gap-2"><Apple className="h-6 w-6" /><span className="font-bold">App Store</span></div>
                <div className="flex items-center gap-2"><Smartphone className="h-6 w-6" /><span className="font-bold">Play Store</span></div>
              </div>
            </div>
            <div className="mt-16 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-[2.5rem] shadow-2xl overflow-hidden max-w-[320px] border-[12px] border-gray-900 aspect-[9/19] bg-white">
                {mockupImage && (
                  <Image
                    src={mockupImage.imageUrl}
                    alt="ApexFind Mobile App"
                    fill
                    className="object-cover"
                    priority
                    data-ai-hint="mobile app interface"
                  />
                )}
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 sm:py-32 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Engineered for the Modern Seeker
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We've packed the ApexFind app with powerful, location-aware tools to make your property journey effortless.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature) => (
              <Card key={feature.title} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                <CardContent className="p-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-primary/10">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Exclusive Section */}
      <section className="bg-secondary/50 py-24 sm:py-32 border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
            <div className="space-y-10">
              <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl mb-8">
                Mobile-Only Perks
              </h2>
              <div className="space-y-10">
                {mobileExclusive.map((item) => (
                  <div key={item.title} className="flex gap-6">
                    <div className="flex-shrink-0 w-14 h-14 bg-background rounded-2xl flex items-center justify-center shadow-md border group-hover:scale-110 transition-transform">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-foreground">{item.title}</h4>
                      <p className="text-muted-foreground text-lg mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-16 lg:mt-0 p-10 bg-background rounded-[2.5rem] shadow-2xl border-2">
              <h3 className="text-2xl font-black mb-8 text-center">Ready to experience ApexFind?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex items-center gap-4 justify-start px-8 border-2 hover:bg-primary/5 transition-all" onClick={handleDownloadClick}>
                  <Apple className="h-8 w-8" />
                  <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">App Store</div>
                    <div className="text-base font-black">Coming Soon</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 flex items-center gap-4 justify-start px-8 border-2 hover:bg-primary/5 transition-all" onClick={handleDownloadClick}>
                  <Smartphone className="h-8 w-8" />
                  <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Play Store</div>
                    <div className="text-base font-black">Coming Soon</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 flex items-center gap-4 justify-start px-8 border-2 hover:bg-primary/5 transition-all" onClick={handleDownloadClick}>
                  <Download className="h-8 w-8" />
                  <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Direct Access</div>
                    <div className="text-base font-black">Download APK</div>
                  </div>
                </Button>
                <div className="h-20 flex items-center gap-4 justify-center bg-muted/30 rounded-lg border-2 border-dashed">
                    <p className="text-xs font-bold text-muted-foreground text-center">More stores being added</p>
                </div>
              </div>
              <p className="mt-10 text-sm text-muted-foreground text-center leading-relaxed">
                Compatible with iOS 15.0+ and Android 10.0+. <br />
                Early access users get **Premium Search Alerts** for free for 1 year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-primary rounded-[3rem] p-12 sm:p-20 text-primary-foreground shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Smartphone size={240} /></div>
            <h2 className="text-4xl font-black sm:text-6xl mb-8 leading-tight relative z-10">The future of Nigerian <br/>real estate is mobile</h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto font-medium relative z-10">
              Join 50,000+ Nigerians finding, buying, and renting homes with smarter, AI-driven tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Button size="lg" variant="secondary" className="h-16 px-10 text-xl font-black shadow-xl" onClick={handleDownloadClick}>
                Get Early Access
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                <Link href="/auth">Create Account Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

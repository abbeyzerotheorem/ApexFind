
'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Search, HelpCircle, ShieldAlert, Key, Home, UserCheck, MessageCircle, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const FAQ_CATEGORIES = [
  {
    id: 'buyers',
    title: 'For Buyers',
    icon: UserCheck,
    questions: [
      {
        q: 'How do I verify property ownership in Nigeria?',
        a: 'Property verification is handled through the State Land Registry. You should request the title documents (C of O, Governor\'s Consent, or Registered Deed of Assignment) and conduct a search at the registry. We recommend engaging a qualified lawyer for this process.'
      },
      {
        q: 'What are the standard agency fees in Nigeria?',
        a: 'The standard professional commission for real estate agents in Nigeria is typically between 5% and 10% of the property purchase price, usually paid by the buyer. Legal fees are generally 5%. Always confirm these terms before making any commitment.'
      },
      {
        q: 'What is a "Governor\'s Consent"?',
        a: 'A Governor\'s Consent is a document signed by the State Governor (or their representative) approving the transfer of interest in a property from one person to another. It is required for a property transaction to be fully legal in many Nigerian states.'
      }
    ]
  },
  {
    id: 'sellers',
    title: 'For Sellers',
    icon: Home,
    questions: [
      {
        q: 'How can I get an accurate valuation for my home?',
        a: 'You can use our Instant Valuation tool located on the "Sell" page. For a more detailed assessment, we can connect you with a NIESV-certified valuer in our agent network.'
      },
      {
        q: 'What documents do I need to sell my property?',
        a: 'You must provide original title documents (C of O or equivalent), a registered survey plan, recent land use charge receipts, and a valid government ID. Clean documentation significantly speeds up the sale process.'
      }
    ]
  },
  {
    id: 'safety',
    title: 'Safety & Trust',
    icon: ShieldAlert,
    questions: [
      {
        q: 'How does ApexFind verify its agents?',
        a: 'We require agents to provide their professional license numbers (e.g., LASRERA or ESVARBON) and proof of membership in recognized professional bodies. Look for the "Verified" badge on agent profiles.'
      },
      {
        q: 'What are the signs of a property scam?',
        a: 'Beware of properties priced significantly below market value, agents who demand "inspection fees" or "commitment fees" before you see the property, or individuals who cannot provide physical access or verifiable documents.'
      }
    ]
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return FAQ_CATEGORIES.map(category => ({
      ...category,
      questions: category.questions.filter(
        item => item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
      )
    })).filter(category => category.questions.length > 0);
  }, [searchQuery]);

  const handleLiveChatClick = () => {
    toast({
      title: "Coming Soon",
      description: "Our Live Chat support is currently under maintenance. Please use the Contact Us form for immediate assistance.",
    });
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 sm:py-24 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">ApexFind Support</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Everything you need to navigate the Nigerian real estate market with confidence.
          </p>
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              className="pl-10 h-14 text-lg shadow-sm bg-white" 
              placeholder="Search help articles (e.g. C of O, fees, scams)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-16 space-y-12">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((category) => (
            <div key={category.id} id={category.id} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{category.title}</h2>
              </div>
              <Accordion type="single" collapsible className="w-full bg-card border rounded-lg overflow-hidden shadow-sm">
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} value={`item-${category.id}-${index}`} className="px-4 border-b last:border-0">
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-4 text-foreground/90">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 leading-relaxed text-base">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-xl font-semibold">No results found</h3>
            <p className="mt-2 text-muted-foreground">Try different keywords or browse our main categories.</p>
            <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>Clear Search</Button>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-24">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 sm:p-12 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <HelpCircle size={120} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                <div>
                  <h2 className="text-3xl font-bold text-white">Still have questions?</h2>
                  <p className="mt-4 text-primary-foreground/90 text-lg">
                    Our support team is deeply rooted in the Nigerian real estate sector and ready to help.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 text-lg font-bold shadow-lg" asChild>
                    <Link href="/contact">
                      Contact Support <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto h-14 text-lg font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={handleLiveChatClick}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" /> Live Support Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

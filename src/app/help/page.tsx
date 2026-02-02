'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, HelpCircle, ShieldAlert, Key, Home, UserCheck, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FAQ_CATEGORIES = [
  {
    id: 'buyers',
    title: 'For Buyers',
    icon: UserCheck,
    questions: [
      {
        q: 'How to verify property ownership in Nigeria?',
        a: 'Verification is crucial. You should request the property\'s title documents (like a Certificate of Occupancy or Governor\'s Consent) and conduct a search at the State Land Registry. We highly recommend hiring a legal professional to assist with this process.'
      },
      {
        q: 'What documents do I need to buy a house?',
        a: 'Commonly required documents include a valid means of identification (Passport, National ID, or Driver\'s License), a Tax Identification Number (TIN), and the formal offer letter from the seller. Your lawyer will also prepare a Deed of Assignment.'
      },
      {
        q: 'How to avoid property fraud?',
        a: 'Always insist on a physical inspection, never pay before verifying documents at the land registry, and only work with verified agents. ApexFind vets agents to add an extra layer of security, but due diligence is always your responsibility.'
      },
      {
        q: 'Understanding agency fees in Nigeria?',
        a: 'In Nigeria, the standard agency commission is typically 5% to 10% of the property purchase price, paid by the buyer. Legal fees are usually another 5%. Always confirm these percentages before closing a deal.'
      }
    ]
  },
  {
    id: 'sellers',
    title: 'For Sellers',
    icon: Home,
    questions: [
      {
        q: 'How to price my property correctly?',
        a: 'You can use ApexFind\'s Instant Valuation tool to get a data-driven estimate. Additionally, looking at similar listings in your neighborhood and consulting with a local expert agent can help you set a competitive price.'
      },
      {
        q: 'Required documents for a property sale?',
        a: 'You must have clear title documents (C of O, Deed of Assignment, etc.), a registered survey plan, and updated land charge receipts. Having these ready speeds up the sales process significantly.'
      },
      {
        q: 'What are the tax implications of selling property?',
        a: 'Sellers in Nigeria are generally subject to Capital Gains Tax (CGT) on the profit made from the sale. It is advisable to consult with a tax professional to understand your specific obligations.'
      }
    ]
  },
  {
    id: 'renters',
    title: 'For Renters',
    icon: Key,
    questions: [
      {
        q: 'What are my rights as a tenant in Nigeria?',
        a: 'Tenants have the right to a written lease agreement, the right to "quiet enjoyment" of the property, and strict protection against unlawful eviction. Landlords must provide proper notice (e.g., 6 months for a yearly tenancy) before seeking possession.'
      },
      {
        q: 'How do security deposit regulations work?',
        a: 'Security deposits are common and should be refundable at the end of the tenancy, provided there are no damages beyond normal wear and tear. Ensure the terms for the deposit refund are clearly stated in your lease agreement.'
      },
      {
        q: 'Lease agreement guidance',
        a: 'Never rely on a verbal agreement. A written lease agreement signed by both parties and witnessed is essential. It should detail the rent amount, duration, maintenance responsibilities, and notice periods.'
      }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Help',
    icon: HelpCircle,
    questions: [
      {
        q: 'How to create an account?',
        a: 'Click the "Sign In" button in the header, then select the "Sign Up" tab. You can create an account using your email address or your Google account. You will be asked to choose between a "Home Seeker" or "Agent" role.'
      },
      {
        q: 'How to upload a property listing?',
        a: 'Only users with an Agent account can upload listings. Once signed in, go to your "Agent Dashboard," click on "My Listings," and then select "+ Add New Listing." Follow the prompts to add photos and details.'
      },
      {
        q: 'Having payment issues?',
        a: 'If you encounter any issues while paying for premium features or promotions, please contact our technical support team immediately via the Contact Us page or WhatsApp.'
      }
    ]
  },
  {
    id: 'safety',
    title: 'Safety Guidelines',
    icon: ShieldAlert,
    questions: [
      {
        q: 'Safe transaction practices',
        a: 'Never transfer money to an individual or company without a verified physical office and a valid contract. Use bank transfers for tracking purposes rather than cash payments.'
      },
      {
        q: 'Tips for safe property viewings',
        a: 'Always schedule viewings during daylight hours. It is also wise to bring a friend or relative with you, and ensure you meet the agent in a public place if you are unfamiliar with the area.'
      },
      {
        q: 'What are the common scam warning signs?',
        a: 'Beware of properties priced significantly below market value, agents who pressure you to pay "commitment fees" before an inspection, or sellers who claim to be out of the country and cannot meet in person.'
      }
    ]
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 sm:py-24 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">How can we help you?</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Search our help articles or browse by category to find answers to common questions about real estate in Nigeria.
          </p>
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              className="pl-10 h-14 text-lg shadow-sm" 
              placeholder="Search help articles..." 
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
              <Accordion type="single" collapsible className="w-full bg-card border rounded-lg overflow-hidden">
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} value={`item-${category.id}-${index}`} className="px-4 border-b-0 last:border-0">
                    <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
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
            <p className="mt-2 text-muted-foreground">Try different keywords or contact our support team.</p>
            <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>Clear Search</Button>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-24">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 sm:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white">Still need help?</h2>
                  <p className="mt-4 text-primary-foreground/80 text-lg">
                    Our dedicated support team is available to assist you with any questions or concerns you might have.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 text-lg font-semibold" asChild>
                    <Link href="/contact">
                      Contact Support <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 text-lg font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                    <button onClick={() => alert('Live chat is coming soon!')}>
                      <MessageCircle className="mr-2 h-5 w-5" /> Start Live Chat
                    </button>
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

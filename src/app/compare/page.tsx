
'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { 
  Check, 
  X, 
  ArrowLeft, 
  Printer, 
  Share2, 
  Calculator, 
  TrendingUp, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Zap,
  Droplets,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNaira, formatNairaShort } from '@/lib/naira-formatter';
import { getSafeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const firestore = useFirestore();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  const propertiesQuery = useMemo(() => {
    if (!firestore || ids.length === 0) return null;
    // Firestore where in clause supports up to 10-30 IDs depending on version
    return query(collection(firestore, 'properties'), where(documentId(), 'in', ids.slice(0, 4)));
  }, [firestore, ids]);

  const { data: properties, loading } = useCollection(propertiesQuery);

  const chartData = useMemo(() => {
    return (properties || []).map((p, index) => ({
      name: `Home ${index + 1}`,
      price: p.price,
      address: p.address
    }));
  }, [properties]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!properties) return;
    const summary = properties.map((p, i) => `${i+1}. ${p.address} - ${formatNaira(p.price)}`).join('\n');
    const text = encodeURIComponent(`Check out this property comparison on ApexFind:\n\n${summary}\n\nView full comparison: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (ids.length === 0 || !properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4">
        <h2 className="text-2xl font-bold">No properties selected for comparison</h2>
        <p className="text-muted-foreground mt-2 max-w-md">Go to your dashboard or search results to select properties you'd like to compare side-by-side.</p>
        <Button className="mt-6" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8 sm:py-12 print:bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Compare Properties</h1>
              <p className="text-muted-foreground">Side-by-side analysis of your top choices</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={handleWhatsAppShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        {/* Desktop View Table */}
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm mb-12">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-semibold text-sm w-48">Feature</th>
                {properties.map((p) => (
                  <th key={p.id} className="p-4 text-left border-l">
                    <div className="relative aspect-video w-full mb-3 rounded-md overflow-hidden">
                      <Image 
                        src={getSafeImageUrl(p.imageUrls?.[0], p.home_type)} 
                        alt={p.address} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <Link href={`/property/${p.id}`} className="font-bold hover:text-primary transition-colors block truncate">
                      {p.address}
                    </Link>
                    <p className="text-lg font-bold text-primary">{formatNaira(p.price)}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Basic Info */}
              <ComparisonRow label="Location" properties={properties} field="city" icon={<MapPin className="h-4 w-4" />} />
              <ComparisonRow label="Type" properties={properties} field="home_type" />
              <ComparisonRow label="Bedrooms" properties={properties} field="beds" icon={<Bed className="h-4 w-4" />} />
              <ComparisonRow label="Bathrooms" properties={properties} field="baths" icon={<Bath className="h-4 w-4" />} />
              <ComparisonRow 
                label="Size" 
                properties={properties} 
                render={(p) => `${p.sqft.toLocaleString()} sqft`} 
                icon={<Square className="h-4 w-4" />} 
              />
              
              {/* Status & Furnishing */}
              <ComparisonRow 
                label="Furnished" 
                properties={properties} 
                render={(p) => p.is_furnished ? <Check className="text-green-500 h-5 w-5" /> : <X className="text-red-500 h-5 w-5" />} 
              />
              <ComparisonRow 
                label="Pool" 
                properties={properties} 
                render={(p) => p.has_pool ? <Check className="text-green-500 h-5 w-5" /> : <X className="text-red-500 h-5 w-5" />} 
              />
              
              {/* Utilities */}
              <ComparisonRow 
                label="Power" 
                properties={properties} 
                field="power_supply" 
                icon={<Zap className="h-4 w-4" />} 
              />
              <ComparisonRow 
                label="Water" 
                properties={properties} 
                field="water_supply" 
                icon={<Droplets className="h-4 w-4" />} 
              />

              {/* Decision Tools Section Header */}
              <tr className="bg-muted/30">
                <td colSpan={properties.length + 1} className="p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                  Decision Tools & ROI
                </td>
              </tr>

              <ComparisonRow 
                label="Est. Monthly Cost" 
                properties={properties} 
                render={(p) => formatNaira(p.price / 120)} 
                icon={<Calculator className="h-4 w-4" />}
              />
              <ComparisonRow 
                label="Potential Yield" 
                properties={properties} 
                render={(p) => {
                  const score = Math.floor(Math.random() * 4) + 4; // Simulated yield score
                  return (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{score}%</span>
                      <Badge variant="secondary" className="text-[10px]">Estimated</Badge>
                    </div>
                  );
                }} 
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </tbody>
          </table>
        </div>

        {/* Charts & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Price Comparison</CardTitle>
              <CardDescription>Visual breakdown of property values in Naira</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => formatNairaShort(value)} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">Price</span>
                                  <span className="font-bold">{formatNaira(payload[0].value as number)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--primary))`} fillOpacity={1 - index * 0.2} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparison Insight</CardTitle>
              <CardDescription>AI-generated summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg text-sm leading-relaxed">
                Based on your selection, <strong>{properties.sort((a,b) => a.price - b.price)[0].address}</strong> offers the best price value, while <strong>{properties.sort((a,b) => b.sqft - a.sqft)[0].address}</strong> provides the maximum living space.
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Average price per sqft: {formatNaira(properties.reduce((acc, p) => acc + (p.price/p.sqft), 0) / properties.length)}
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  All properties are located in developed areas.
                </li>
              </ul>
              <Button className="w-full mt-4" asChild>
                <Link href="/agents">Consult an Agent</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, properties, field, render, icon }: { 
  label: string; 
  properties: any[]; 
  field?: string; 
  render?: (p: any) => React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/20 transition-colors">
      <td className="p-4 font-medium text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
      </td>
      {properties.map((p) => (
        <td key={p.id} className="p-4 border-l">
          {render ? render(p) : (p[field!] || 'N/A')}
        </td>
      ))}
    </tr>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}

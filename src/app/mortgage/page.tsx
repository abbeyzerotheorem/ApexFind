'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatNaira } from '@/lib/naira-formatter';
import { Banknote, Percent, Calendar, Building2, Loader2, FileText, Printer, Building, UserCheck, Info } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const requiredDocuments = [
    "Duly completed Application Form",
    "Evidence of NHF contributions (for NHF loans)",
    "Valid Identity (Int'l Passport, Driver's License, or NIN)",
    "Proof of Income (Certified 6-month payslips & Employment Letter)",
    "Bank Statements for the last 12 months",
    "Property Title Documents (C of O, Governor's Consent, or Registered Deed)",
    "Approved Building Plans & Valuation Report from a NIESV-certified valuer",
    "Three (3) years Tax Clearance Certificate",
    "Offer Letter from the Seller/Developer",
];

export default function MortgagePage() {
    const [homePrice, setHomePrice] = useState(50000000);
    const [downPayment, setDownPayment] = useState(10000000);
    const [loanTerm, setLoanTerm] = useState(15);
    const [interestRate, setInterestRate] = useState(18.5);

    const debouncedHomePrice = useDebounce(homePrice, 500);
    const debouncedDownPayment = useDebounce(downPayment, 500);
    const debouncedLoanTerm = useDebounce(loanTerm, 500);
    const debouncedInterestRate = useDebounce(interestRate, 500);

    const downPaymentPercentage = useMemo(() => (debouncedHomePrice > 0 ? (debouncedDownPayment / debouncedHomePrice) * 100 : 0), [debouncedHomePrice, debouncedDownPayment]);

    const { data: result, isLoading, isError } = useQuery({
        queryKey: ['mortgage-calculation', debouncedHomePrice, debouncedDownPayment, debouncedLoanTerm, debouncedInterestRate],
        queryFn: async () => {
            if (debouncedHomePrice <= 0 || debouncedDownPayment >= debouncedHomePrice) return null;
            const response = await fetch('/api/mortgage/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyPrice: debouncedHomePrice,
                    downPaymentPercent: downPaymentPercentage,
                    loanTerm: debouncedLoanTerm,
                    interestRate: debouncedInterestRate
                })
            });
            if (!response.ok) throw new Error('Failed to calculate mortgage');
            return response.json();
        },
        enabled: debouncedHomePrice > 0 && debouncedDownPayment < debouncedHomePrice,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
    
    const paymentBreakdownData = useMemo(() => [
        { name: 'Principal', value: result?.loanAmount > 0 ? result.loanAmount : 0, fill: 'hsl(var(--primary))' },
        { name: 'Total Interest', value: result?.totalInterest > 0 ? result.totalInterest : 0, fill: 'hsl(var(--accent))' },
    ], [result]);

    const handlePriceInputChange = (val: string) => {
        const num = Number(val.replace(/[^0-9]/g, ''));
        setHomePrice(num);
    };

    const handleDownPaymentInputChange = (val: string) => {
        const num = Number(val.replace(/[^0-9]/g, ''));
        setDownPayment(num);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                        Mortgage Calculator
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground leading-relaxed">
                        Calculate your monthly payments and explore financing options from top Nigerian lenders.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Inputs */}
                    <Card className="lg:col-span-2 h-fit border shadow-sm">
                        <CardHeader className="border-b bg-muted/5">
                            <CardTitle>Calculator Inputs</CardTitle>
                            <CardDescription>Adjust the variables to see your estimated costs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 py-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="home-price" className="font-bold">Home Price (₦)</Label>
                                    <span className="text-xs font-mono text-primary font-bold">{formatNaira(homePrice)}</span>
                                </div>
                                <Input 
                                    id="home-price" 
                                    value={homePrice.toLocaleString()} 
                                    onChange={(e) => handlePriceInputChange(e.target.value)} 
                                    className="font-bold text-lg"
                                />
                                <Slider value={[homePrice]} onValueChange={(v) => setHomePrice(v[0])} max={1000000000} step={1000000} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="down-payment" className="font-bold">Down Payment (₦)</Label>
                                    <span className="text-xs font-mono text-primary font-bold">{downPaymentPercentage.toFixed(1)}%</span>
                                </div>
                                <Input 
                                    id="down-payment" 
                                    value={downPayment.toLocaleString()} 
                                    onChange={(e) => handleDownPaymentInputChange(e.target.value)} 
                                    className="font-bold text-lg"
                                />
                                <Slider value={[downPayment]} onValueChange={(v) => setDownPayment(v[0])} max={homePrice} step={500000} />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="loan-term" className="font-bold">Term (Years)</Label>
                                    <Input id="loan-term" type="number" value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} />
                                    <Slider value={[loanTerm]} onValueChange={(v) => setLoanTerm(v[0])} max={30} min={5} step={1} />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="interest-rate" className="font-bold">Rate (%)</Label>
                                    <Input id="interest-rate" type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} step="0.1" />
                                    <Slider value={[interestRate]} onValueChange={(v) => setInterestRate(v[0])} max={30} min={1} step={0.1} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Results */}
                    <div className="lg:col-span-3 space-y-8">
                         <Card className="text-center border-2 border-primary/20 shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Estimated Monthly Payment</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-8">
                                {isLoading ? (
                                    <div className="flex justify-center"><Skeleton className="h-16 w-64" /></div>
                                ) : (
                                    <p className="text-5xl sm:text-6xl font-black text-primary tracking-tighter">
                                        {isError ? 'N/A' : formatNaira(result?.monthlyPayment || 0)}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-4 italic max-w-sm mx-auto">
                                    *Estimates exclude insurance, service charges, and property taxes.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border shadow-sm">
                                <CardHeader className="border-b bg-muted/5">
                                    <CardTitle className="text-lg">Loan Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="py-6 space-y-4">
                                    {isLoading ? (
                                        <div className="space-y-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center pb-2 border-b">
                                                <span className="text-sm text-muted-foreground">Principal Loan</span>
                                                <span className="font-bold">{formatNaira(result?.loanAmount || 0)}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b">
                                                <span className="text-sm text-muted-foreground">Total Interest</span>
                                                <span className="font-bold text-accent">{formatNaira(result?.totalInterest || 0)}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-sm font-bold">Total Cost</span>
                                                <span className="font-black text-lg">{formatNaira(result?.totalPayment || 0)}</span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm">
                                <CardHeader className="border-b bg-muted/5">
                                    <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent className="py-6 h-[180px]">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={paymentBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={8}>
                                                {paymentBreakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatNaira(value)} />
                                            <Legend verticalAlign="bottom" iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                         <Card className="border shadow-sm overflow-hidden">
                            <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Lending Options</CardTitle>
                                    <CardDescription className="text-xs">Representative commercial rates in Nigeria.</CardDescription>
                                </div>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Live Market Rates</Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead className="pl-6">Institution</TableHead>
                                                <TableHead>Est. Rate</TableHead>
                                                <TableHead className="hidden sm:table-cell">Equity Req.</TableHead>
                                                <TableHead className="text-right pr-6">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result?.nigerianBanks?.map((bank: any) => (
                                                <TableRow key={bank.name} className="hover:bg-muted/10 transition-colors">
                                                    <TableCell className="font-bold pl-6">{bank.name}</TableCell>
                                                    <TableCell className="font-mono">{bank.rate}%</TableCell>
                                                    <TableCell className="hidden sm:table-cell text-muted-foreground">{bank.minDownPayment}% Equity</TableCell>
                                                    <TableCell className="text-right pr-6">
                                                         <Button variant="ghost" size="sm" className="font-bold text-primary hover:text-primary hover:bg-primary/10" asChild>
                                                            <Link href="/agents">Consult Agent</Link>
                                                         </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card className="border shadow-sm">
                        <CardHeader className="border-b bg-muted/5">
                            <CardTitle className="flex items-center gap-2 font-bold"><FileText className="h-5 w-5 text-primary" /> Application Requirements</CardTitle>
                            <CardDescription>Essential documents for most Nigerian primary mortgage institutions (PMIs).</CardDescription>
                        </CardHeader>
                        <CardContent className="py-8">
                            <ul className="grid grid-cols-1 gap-4">
                                {requiredDocuments.map((doc, index) => (
                                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 text-sm">
                                        <div className="h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                            <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                                        </div>
                                        <span className="font-medium">{doc}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                     <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><UserCheck size={160} /></div>
                        <CardHeader className="relative z-10 pt-10">
                            <CardTitle className="text-3xl font-black mb-2">Need a Mortgage Expert?</CardTitle>
                            <CardDescription className="text-primary-foreground/80 text-lg leading-relaxed">
                                Our verified agents work closely with Nigerian banks to secure the best rates and guide you through the complex documentation process.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 py-6">
                           <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" variant="secondary" className="h-14 px-8 font-black text-lg shadow-lg" asChild>
                                <Link href="/agents">Find a Financing Specialist</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 font-bold border-white/30 bg-white/10 hover:bg-white/20 text-white" onClick={() => window.print()}>
                                <Printer className="mr-2 h-5 w-5" /> Print Report
                            </Button>
                           </div>
                        </CardContent>
                        <CardFooter className="relative z-10 pt-4 pb-10">
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full text-xs font-bold uppercase tracking-widest">
                                <Info size={14} /> Recommended for First-Time Buyers
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="mt-16 bg-secondary/50 p-8 sm:p-16 rounded-3xl border text-center">
                    <h2 className="text-3xl font-black text-foreground sm:text-4xl">Navigating Financing in Nigeria</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
                        Home ownership is a major milestone. Understanding your options can save you millions in interest.
                    </p>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
                        <div className="space-y-4">
                             <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Banknote className="h-6 w-6" /></div>
                             <h3 className="text-xl font-bold">NHF Scheme</h3>
                             <p className="text-sm text-muted-foreground leading-relaxed">The National Housing Fund (NHF) offers loans at a fixed 6% rate for amounts up to ₦15 Million. It's the most affordable option for eligible contributors to the fund.</p>
                        </div>
                        <div className="space-y-4">
                             <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Percent className="h-6 w-6" /></div>
                            <h3 className="text-xl font-bold">Commercial Rates</h3>
                             <p className="text-sm text-muted-foreground leading-relaxed">Standard bank mortgages currently range from 17% to 25% APR. These are best suited for high-income earners or those looking for fast processing times.</p>
                        </div>
                        <div className="space-y-4">
                             <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Calendar className="h-6 w-6" /></div>
                            <h3 className="text-xl font-bold">Loan Tenure</h3>
                             <p className="text-sm text-muted-foreground leading-relaxed">While global tenures reach 30 years, Nigerian loans typically cap at 10-20 years. Always aim for the longest possible term to lower your monthly burden.</p>
                        </div>
                        <div className="space-y-4">
                             <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Building2 className="h-6 w-6" /></div>
                            <h3 className="text-xl font-bold">Pre-Approval</h3>
                             <p className="text-sm text-muted-foreground leading-relaxed">Before viewing homes, get a pre-qualification letter from your bank. This proves your buying power and makes you a serious contender in high-demand areas.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

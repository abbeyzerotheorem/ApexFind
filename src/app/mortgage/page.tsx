
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
import { formatNaira, formatNairaShort } from '@/lib/naira-formatter';
import { Banknote, Percent, Calendar, Building2, Loader2, FileText, Printer, Building, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const requiredDocuments = [
    "Completed application form",
    "Proof of Identity (Passport, Driver's License, National ID)",
    "Proof of Income (Payslips for 6 months, Employment Letter)",
    "Bank Statements for the last 6-12 months",
    "Credit History Report",
    "Offer Letter for the property",
    "Title documents of the property (e.g., C of O, Deed of Assignment)",
    "Approved building plans (if applicable)",
    "Valuation report from a bank-approved estate valuer",
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


    return (
        <div className="flex min-h-screen flex-col bg-background py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                        Mortgage Calculator
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Estimate your monthly mortgage payments with our easy-to-use calculator, tailored for the Nigerian market.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <Card className="lg:col-span-2 h-fit">
                        <CardHeader>
                            <CardTitle>Loan Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="home-price">Home Price</Label>
                                <Input id="home-price" value={formatNaira(homePrice)} onChange={(e) => setHomePrice(Number(e.target.value.replace(/[^0-9]/g, '')))} />
                                <Slider value={[homePrice]} onValueChange={(v) => setHomePrice(v[0])} max={200000000} step={1000000} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="down-payment">Down Payment</Label>
                                <Input id="down-payment" value={formatNaira(downPayment)} onChange={(e) => setDownPayment(Number(e.target.value.replace(/[^0-9]/g, '')))} />
                                <Slider value={[downPayment]} onValueChange={(v) => setDownPayment(v[0])} max={homePrice} step={500000} />
                                 <div className="text-right text-sm text-muted-foreground">{downPaymentPercentage.toFixed(1)}%</div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="loan-term">Loan Term (Years)</Label>
                                <Input id="loan-term" type="number" value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} />
                                <Slider value={[loanTerm]} onValueChange={(v) => setLoanTerm(v[0])} max={30} step={1} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                                <Input id="interest-rate" type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} step="0.1" />
                                <Slider value={[interestRate]} onValueChange={(v) => setInterestRate(v[0])} max={30} step={0.1} />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <div className="lg:col-span-3 space-y-8">
                         <Card className="text-center">
                            <CardHeader>
                                <CardTitle className="text-muted-foreground font-medium">Estimated Monthly Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-12 w-64 mx-auto" /> : 
                                    <p className="text-5xl font-bold text-primary">{isError ? 'Error' : formatNaira(result?.monthlyPayment || 0)}</p>
                                }
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Loan Breakdown</CardTitle>
                                <CardDescription>An overview of your estimated loan costs over {loanTerm} years.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                     {isLoading ? <Skeleton className="h-28 w-full" /> : 
                                        <>
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <span className="text-muted-foreground">Principal Loan</span>
                                                <span className="font-semibold">{formatNaira(result?.loanAmount || 0)}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <span className="text-muted-foreground">Total Interest</span>
                                                <span className="font-semibold">{formatNaira(result?.totalInterest || 0)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Total Paid</span>
                                                <span className="font-bold text-lg">{formatNaira(result?.totalPayment || 0)}</span>
                                            </div>
                                        </>
                                     }
                                </div>
                                <div>
                                     <ResponsiveContainer width="100%" height={150}>
                                        <PieChart>
                                            <Pie data={paymentBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                                                {paymentBreakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatNaira(value)} />
                                            <Legend iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" /> Compare Nigerian Bank Rates</CardTitle>
                                <CardDescription>{result?.disclaimer || "Rates are estimates and subject to change."}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-40 w-full" /> :
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Bank</TableHead>
                                                <TableHead>Est. Rate</TableHead>
                                                <TableHead>Min. Down Payment</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result?.nigerianBanks?.map((bank: any) => (
                                                <TableRow key={bank.name}>
                                                    <TableCell className="font-medium">{bank.name}</TableCell>
                                                    <TableCell>{bank.rate}%</TableCell>
                                                    <TableCell>{bank.minDownPayment}%</TableCell>
                                                    <TableCell className="text-right">
                                                         <Button variant="outline" size="sm">Apply</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                }
                            </CardContent>
                        </Card>

                    </div>
                </div>

                <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Required Documents</CardTitle>
                            <CardDescription>A general list of documents required by most Nigerian banks for a mortgage application.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {requiredDocuments.map(doc => (
                                    <li key={doc} className="flex items-center">
                                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                                        <span className="text-sm">{doc}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                     <Card className="bg-primary/10 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary"><UserCheck className="h-5 w-5" />Ready for the Next Step?</CardTitle>
                            <CardDescription>An experienced real estate agent can guide you through the pre-approval process and connect you with trusted lenders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground mb-6">Our verified agents have relationships with multiple banks and can help you find the best mortgage product for your situation, saving you time and stress.</p>
                           <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" asChild>
                                <Link href="/agents">Find a Local Agent</Link>
                            </Button>
                            <Button size="lg" variant="outline" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" /> Print This Report
                            </Button>
                           </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-16 text-center bg-secondary p-8 sm:p-12 rounded-lg">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Understanding Mortgages in Nigeria</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Getting a mortgage is a big step. Here are a few key things to keep in mind for the Nigerian market.
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                        <div className="space-y-2">
                             <Banknote className="h-8 w-8 text-primary" />
                             <h3 className="text-lg font-semibold pt-2">Down Payment</h3>
                             <p className="text-sm text-muted-foreground">Most banks require a down payment, typically ranging from 10% to 30% of the property's value. The National Housing Fund (NHF) can offer lower entry points for eligible contributors.</p>
                        </div>
                        <div className="space-y-2">
                             <Percent className="h-8 w-8 text-primary" />
                            <h3 className="text-lg font-semibold pt-2">Interest Rates</h3>
                             <p className="text-sm text-muted-foreground">Commercial mortgage rates are generally in the double digits (15%-25%). Rates can be fixed or variable. Federal Mortgage Bank of Nigeria (FMBN) loans via the NHF scheme offer much lower, single-digit rates.</p>
                        </div>
                        <div className="space-y-2">
                             <Calendar className="h-8 w-8 text-primary" />
                            <h3 className="text-lg font-semibold pt-2">Loan Tenure</h3>
                             <p className="text-sm text-muted-foreground">Loan terms can range from 5 to 30 years. A longer tenure means lower monthly payments, but you'll pay more in total interest over the life of the loan.</p>
                        </div>
                        <div className="space-y-2">
                             <Building2 className="h-8 w-8 text-primary" />
                            <h3 className="text-lg font-semibold pt-2">Finding a Lender</h3>
                             <p className="text-sm text-muted-foreground">You can approach commercial banks, mortgage banks, or check your eligibility for an NHF loan through the FMBN. Each has different requirements and processes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

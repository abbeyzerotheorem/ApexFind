
'use client';

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { formatNaira, formatNairaShort } from '@/lib/naira-formatter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Banknote, Percent, Calendar, Building2 } from 'lucide-react';


export default function MortgagePage() {
    const [homePrice, setHomePrice] = useState(50000000);
    const [downPayment, setDownPayment] = useState(10000000);
    const [loanTerm, setLoanTerm] = useState(15);
    const [interestRate, setInterestRate] = useState(18);

    const downPaymentPercentage = useMemo(() => (homePrice > 0 ? (downPayment / homePrice) * 100 : 0), [homePrice, downPayment]);
    
    const monthlyPayment = useMemo(() => {
        const principal = homePrice - downPayment;
        if (principal <= 0) return 0;
        const monthlyInterestRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;
        
        if (monthlyInterestRate === 0) return principal / numberOfPayments;

        const payment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        return payment;
    }, [homePrice, downPayment, loanTerm, interestRate]);

    const totalPayment = monthlyPayment * loanTerm * 12;
    const totalInterest = totalPayment - (homePrice - downPayment);
    const principalAmount = homePrice - downPayment;

    const paymentBreakdownData = useMemo(() => [
        { name: 'Principal', value: principalAmount > 0 ? principalAmount : 0, fill: 'hsl(var(--primary))' },
        { name: 'Interest', value: totalInterest > 0 ? totalInterest : 0, fill: 'hsl(var(--accent))' },
    ], [principalAmount, totalInterest]);

    const amortizationData = useMemo(() => {
        let balance = homePrice - downPayment;
        if (balance <= 0) return [];

        const monthlyInterestRate = interestRate / 100 / 12;
        const data = [];
        for (let year = 1; year <= loanTerm; year++) {
            let principalPaidYearly = 0;
            let interestPaidYearly = 0;
            for (let month = 1; month <= 12; month++) {
                const interestForMonth = balance * monthlyInterestRate;
                const principalForMonth = monthlyPayment - interestForMonth;
                balance -= principalForMonth;
                principalPaidYearly += principalForMonth;
                interestPaidYearly += interestForMonth;
            }
            data.push({
                year,
                principal: Math.round(principalPaidYearly),
                interest: Math.round(interestPaidYearly),
                balance: Math.round(balance > 0 ? balance : 0),
            });
        }
        return data;
    }, [homePrice, downPayment, loanTerm, interestRate, monthlyPayment]);

    return (
        <div className="flex min-h-screen flex-col bg-background py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                        Mortgage Calculator
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Estimate your monthly mortgage payments with our easy-to-use calculator. Adjust the home price, down payment, and loan terms to see how it affects your payment.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <Card className="lg:col-span-2">
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
                                <p className="text-5xl font-bold text-primary">{formatNaira(monthlyPayment)}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Loan Breakdown</CardTitle>
                                <CardDescription>An overview of your estimated loan costs over {loanTerm} years.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Principal Loan</span>
                                        <span className="font-semibold">{formatNaira(principalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Total Interest</span>
                                        <span className="font-semibold">{formatNaira(totalInterest)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Total Paid</span>
                                        <span className="font-bold text-lg">{formatNaira(totalPayment)}</span>
                                    </div>
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
                    </div>
                </div>

                <Accordion type="single" collapsible className="w-full mt-8">
                    <AccordionItem value="amortization">
                        <AccordionTrigger>View Amortization Schedule</AccordionTrigger>
                        <AccordionContent>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Yearly Breakdown</CardTitle>
                                    <CardDescription>How your loan balance decreases over time.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={amortizationData}>
                                            <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Year ${val}`} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatNairaShort(value as number)}/>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                                formatter={(value: number, name: string) => [formatNaira(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                                            />
                                            <Legend />
                                            <Bar dataKey="principal" stackId="a" fill="hsl(var(--primary))" name="Principal Paid"/>
                                            <Bar dataKey="interest" stackId="a" fill="hsl(var(--accent))" name="Interest Paid"/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

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

                 <div className="mt-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Ready for the Next Step?</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        An experienced real estate agent can guide you through the pre-approval process and connect you with trusted lenders.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" asChild>
                            <Link href="/agents">Find a Local Agent</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

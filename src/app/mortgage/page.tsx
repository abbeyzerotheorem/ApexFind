
'use client';

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function MortgagePage() {
    const [homePrice, setHomePrice] = useState(25000000);
    const [downPayment, setDownPayment] = useState(5000000);
    const [loanTerm, setLoanTerm] = useState(20);
    const [interestRate, setInterestRate] = useState(7.5);

    const downPaymentPercentage = useMemo(() => (downPayment / homePrice) * 100, [homePrice, downPayment]);
    
    const monthlyPayment = useMemo(() => {
        const principal = homePrice - downPayment;
        if (principal <= 0) return 0;
        const monthlyInterestRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;
        
        if (monthlyInterestRate === 0) return principal / numberOfPayments;

        const payment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        return payment;
    }, [homePrice, downPayment, loanTerm, interestRate]);

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
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Estimate your monthly mortgage payment and see how different variables can impact your costs.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Loan Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="home-price">Home Price (₦)</Label>
                                <Input id="home-price" value={homePrice.toLocaleString()} onChange={(e) => setHomePrice(Number(e.target.value.replace(/,/g, '')))} />
                                <Slider value={[homePrice]} onValueChange={(v) => setHomePrice(v[0])} max={100000000} step={100000} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="down-payment">Down Payment (₦)</Label>
                                <Input id="down-payment" value={downPayment.toLocaleString()} onChange={(e) => setDownPayment(Number(e.target.value.replace(/,/g, '')))} />
                                <Slider value={[downPayment]} onValueChange={(v) => setDownPayment(v[0])} max={homePrice} step={50000} />
                                 <div className="text-right text-sm text-muted-foreground">{downPaymentPercentage.toFixed(1)}%</div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="loan-term">Loan Term (Years)</Label>
                                <Input id="loan-term" value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} />
                                <Slider value={[loanTerm]} onValueChange={(v) => setLoanTerm(v[0])} max={30} step={1} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                                <Input id="interest-rate" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
                                <Slider value={[interestRate]} onValueChange={(v) => setInterestRate(v[0])} max={20} step={0.1} />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <div className="lg:col-span-2 space-y-8">
                         <Card className="text-center">
                            <CardHeader>
                                <CardTitle className="text-muted-foreground">Estimated Monthly Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-5xl font-bold text-primary">₦{monthlyPayment.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</p>
                            </CardContent>
                            <CardFooter className="flex-col items-center justify-center text-sm text-muted-foreground">
                                <p>Principal & Interest only. Does not include taxes or insurance.</p>
                                <Button variant="link">Get a detailed quote</Button>
                            </CardFooter>
                        </Card>

                         <Card>
                            <CardHeader>
                                <CardTitle>Amortization Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={amortizationData}>
                                        <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}/>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                            formatter={(value: number, name: string) => [`₦${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                                        />
                                        <Bar dataKey="principal" stackId="a" fill="hsl(var(--primary))" name="Principal"/>
                                        <Bar dataKey="interest" stackId="a" fill="hsl(var(--accent))" name="Interest"/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                 <div className="mt-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Ready for the Next Step?</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Get pre-approved for a loan to understand your budget and strengthen your offer when you find the perfect home.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button size="lg">Get Pre-Approved</Button>
                        <Button size="lg" variant="outline">Find a Lender</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

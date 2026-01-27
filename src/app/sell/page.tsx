
'use client';

import { useState } from 'react';
import InstantValuation from '@/components/valuation/InstantValuation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';

export default function SellPage() {
    const [showValuation, setShowValuation] = useState(false);
    const [address, setAddress] = useState('');

    return (
        <>
            <div className="relative bg-white">
                 <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
                    <div className="px-6 pb-24 pt-10 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-56 lg:pt-48 xl:col-span-6">
                        <div className="mx-auto max-w-2xl lg:mx-0">
                            <h1 className="mt-24 text-4xl font-bold tracking-tight text-gray-900 sm:mt-10 sm:text-6xl">
                                What's my home worth?
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Get Nigeria's most accurate home-value estimate, based on real market data. It's a great first step to figure out your next move.
                            </p>
                            <div className="mt-10 flex items-center gap-x-6">
                                <div className="relative w-full">
                                  <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter your property address"
                                    className="w-full h-16 px-6 pr-40 text-lg border border-gray-400 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                                  />
                                  <button
                                    onClick={() => setShowValuation(true)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold text-lg"
                                  >
                                    Get Value
                                  </button>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
                        <Image
                            className="aspect-[3/2] w-full bg-gray-50 object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
                            src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Modern house"
                            fill
                        />
                    </div>
                </div>
            </div>

            {showValuation && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowValuation(false)}>
                <div className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] relative flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowValuation(false)}
                    className="absolute top-2 right-2 z-10 rounded-full bg-background/50 hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close valuation</span>
                  </Button>
                  <div className="overflow-y-auto">
                     <InstantValuation address={address} />
                  </div>
                </div>
              </div>
            )}
        </>
    );
}


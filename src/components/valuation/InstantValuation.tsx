
'use client'

import { useState } from 'react'
import { Calculator, MapPin, Home, Bed, Bath, Square, TrendingUp, Info, Share2, Printer, ChevronRight, Check } from 'lucide-react'
import { formatNaira } from '@/lib/naira-formatter'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import type { ValuationResult } from '@/types'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'


const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Rivers', 'Oyo', 'Kano', 'Delta', 'Kaduna',
  'Ogun', 'Edo', 'Enugu', 'Plateau', 'Akwa Ibom', 'Cross River',
  'Abia', 'Imo', 'Anambra'
]

const PROPERTY_TYPES = [
  'Apartment', 'Duplex', 'Bungalow', 'Terraced House',
  'Semi-Detached', 'Detached House', 'Penthouse', 'Commercial'
]

const AMENITIES = [
  '24/7 Power Supply', 'Borehole Water', 'Swimming Pool',
  'Security Guards', 'CCTV', 'Electric Fence',
  'Garden', 'Parking Space', 'Maid Quarters',
  'Fully Furnished', 'Smart Home'
]

export default function InstantValuation({ address: initialAddress = '' }: { address?: string }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValuationResult | null>(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    address: initialAddress,
    city: '',
    state: 'Lagos',
    propertyType: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    size: 120, // square meters
    yearBuilt: 2015,
    amenities: [] as string[]
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleEstimate = async () => {
    if (!formData.address || !formData.city) {
      setError('Please enter both address and city to continue.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/valuation/instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate valuation. Please try again.')
      }

      setResult(data)
      setStep(3)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const generateWhatsAppMessage = () => {
    if (!result) return ''

    const formattedValue = formatNaira(result.estimatedValue);
    
    const message = `🏡 *ApexFind Property Valuation Report*\n\n` +
                   `📍 Location: ${formData.address}, ${formData.city}\n` +
                   `💰 Est. Market Value: ${formattedValue}\n` +
                   `📊 Confidence Score: ${(result.confidence * 100).toFixed(0)}%\n` +
                   `📈 Market Pulse: ${result.marketTrend}\n\n` +
                   `Connect with me on ApexFind to see the full details!`
    
    return encodeURIComponent(message)
  }

  return (
    <div className="bg-background">
      <div className="p-8 md:p-12">
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-6 shadow-sm border border-primary/20">
            <Calculator className="text-primary" size={40} />
            </div>
            <h1 className="text-4xl font-black text-foreground mb-3 tracking-tight">
            Instant Property Valuation
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            Get an automated, data-driven estimate of your home's current market value in Nigeria.
            </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-16 gap-4">
            {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500",
                    step === stepNumber ? "bg-primary text-primary-foreground shadow-lg scale-110" : 
                    step > stepNumber ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                )}>
                    {step > stepNumber ? <Check size={20} /> : stepNumber}
                </div>
                {stepNumber < 3 && <div className={cn("w-12 h-1 rounded-full", step > stepNumber ? "bg-green-500" : "bg-muted")} />}
            </div>
            ))}
        </div>

        {/* Step 1: Property Details */}
        {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                <Label htmlFor="address" className="font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Property Address
                </Label>
                <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="e.g. 15 Admiralty Way"
                    className="h-12 text-base font-medium"
                />
                </div>

                <div className="space-y-3">
                <Label htmlFor="city" className="font-bold">City / Neighborhood</Label>
                <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g. Lekki Phase 1"
                    className="h-12 text-base font-medium"
                />
                </div>

                <div className="space-y-3">
                <Label htmlFor="state" className="font-bold">State</Label>
                <Select value={formData.state} onValueChange={(v) => handleSelectChange('state', v)}>
                    <SelectTrigger id="state" className="h-12 font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {NIGERIAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                <Label htmlFor="propertyType" className="font-bold flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary" /> Property Type
                </Label>
                <Select value={formData.propertyType} onValueChange={(v) => handleSelectChange('propertyType', v)}>
                    <SelectTrigger id="propertyType" className="h-12 font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PROPERTY_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                <div className="space-y-4">
                <Label className="font-bold flex items-center gap-2">
                    <Bed className="w-4 h-4 text-primary" /> Bedrooms
                </Label>
                <div className="flex items-center justify-between bg-muted/30 p-2 rounded-xl border">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => handleInputChange('bedrooms', Math.max(1, formData.bedrooms - 1))}>-</Button>
                    <span className="text-2xl font-black">{formData.bedrooms}</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => handleInputChange('bedrooms', formData.bedrooms + 1)}>+</Button>
                </div>
                </div>

                <div className="space-y-4">
                <Label className="font-bold flex items-center gap-2">
                    <Bath className="w-4 h-4 text-primary" /> Bathrooms
                </Label>
                <div className="flex items-center justify-between bg-muted/30 p-2 rounded-xl border">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => handleInputChange('bathrooms', Math.max(1, formData.bathrooms - 1))}>-</Button>
                    <span className="text-2xl font-black">{formData.bathrooms}</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => handleInputChange('bathrooms', formData.bathrooms + 1)}>+</Button>
                </div>
                </div>

                <div className="space-y-4">
                <Label htmlFor="size-range" className="font-bold flex items-center gap-2">
                    <Square className="w-4 h-4 text-primary" /> Size: <span className="text-primary font-black ml-auto">{formData.size} m²</span>
                </Label>
                <Slider
                    id="size-range"
                    value={[formData.size]}
                    onValueChange={(v) => handleInputChange('size', v[0])}
                    max={1000}
                    min={50}
                    step={10}
                    className="py-4"
                />
                </div>
            </div>

            <div className="space-y-6 pt-4 border-t">
                <Label className="font-black text-sm uppercase tracking-widest text-muted-foreground block">Essential Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {AMENITIES.map(amenity => (
                    <button 
                        key={amenity} 
                        onClick={() => handleAmenityToggle(amenity)}
                        className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                            formData.amenities.includes(amenity) ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-transparent hover:border-muted shadow-none"
                        )}
                    >
                        <div className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0",
                            formData.amenities.includes(amenity) ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
                        )}>
                            {formData.amenities.includes(amenity) && <Check size={14} className="stroke-[4]" />}
                        </div>
                        <span className={cn("text-sm font-bold", formData.amenities.includes(amenity) ? "text-primary" : "text-muted-foreground")}>{amenity}</span>
                    </button>
                ))}
                </div>
            </div>

            <Button onClick={() => setStep(2)} size="lg" className="w-full h-14 font-black text-xl shadow-xl">
                Continue to Review <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
            </div>
        )}

        {/* Step 2: Review & Estimate */}
        {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-muted/30 p-8 rounded-3xl border-2 border-dashed">
                <h3 className="text-2xl font-black mb-6">Review Property Profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Address</p>
                    <p className="font-bold text-lg">{formData.address}, {formData.city}, {formData.state}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Property Type</p>
                    <p className="font-bold text-lg">{formData.propertyType}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Bedrooms & Bathrooms</p>
                    <p className="font-bold text-lg text-primary">{formData.bedrooms} Beds • {formData.bathrooms} Baths</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Living Space</p>
                    <p className="font-bold text-lg">{formData.size} Square Meters</p>
                </div>
                </div>

                {formData.amenities.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Selected Amenities</p>
                    <div className="flex flex-wrap gap-2">
                    {formData.amenities.map(amenity => (
                        <Badge key={amenity} variant="secondary" className="px-4 py-1.5 bg-white font-bold text-foreground border shadow-sm">
                        {amenity}
                        </Badge>
                    ))}
                    </div>
                </div>
                )}
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
                <TrendingUp className="text-blue-600 shrink-0" size={24} />
                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                    Our AI compares your home with **{formData.city}** market indices. 
                    This automated estimate provides a professional starting point for your sale strategy.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <p className="text-destructive font-bold text-center">{error}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="h-14 flex-1 text-lg font-bold border-2">Back to Edit</Button>
                <Button
                onClick={handleEstimate}
                disabled={loading}
                className="h-14 flex-[2] text-xl font-black shadow-xl"
                >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" /> Calculating...
                    </span>
                ) : 'Generate My Report'}
                </Button>
            </div>
            </div>
        )}

        {/* Step 3: Valuation Report */}
        {step === 3 && result && (
            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800 font-black px-4 py-1 mb-4 border-none uppercase tracking-widest">Report Generated Successfully</Badge>
                <h2 className="text-3xl font-black text-foreground mb-2 leading-tight">
                Estimated Market Value
                </h2>
                <p className="text-muted-foreground font-medium">
                    Analysis for {formData.address}, {formData.city}
                </p>
            </div>

            {/* Estimated Value Card */}
            <div className="text-center p-12 bg-gradient-to-br from-primary via-primary to-accent rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700"><Calculator size={200} /></div>
                <div className="relative z-10">
                    <p className="text-sm font-black uppercase tracking-[0.2em] opacity-80 mb-4">Current Market Estimate</p>
                    <p className="text-6xl sm:text-7xl font-black tracking-tighter mb-6">
                    {formatNaira(result.estimatedValue)}
                    </p>
                    <div className="inline-flex items-center px-6 py-2.5 bg-black/20 backdrop-blur-md rounded-full font-black text-sm border border-white/20">
                    <div className={cn("w-3 h-3 rounded-full mr-3 animate-pulse", result.confidence >= 0.8 ? 'bg-green-400' : 'bg-yellow-400')}></div>
                    {result.confidence >= 0.8 ? 'HIGH' : 'MEDIUM'} CONFIDENCE ({(result.confidence * 100).toFixed(0)}%)
                    </div>
                </div>
            </div>

            {/* Value Range Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-muted/20 rounded-3xl border-2 border-transparent text-center">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Conservative</p>
                    <p className="font-bold text-xl">{formatNaira(result.range.low)}</p>
                </div>
                <div className="p-6 bg-primary/10 rounded-3xl border-2 border-primary/20 text-center scale-105 shadow-md">
                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Likely Market Price</p>
                    <p className="font-black text-2xl text-primary">{formatNaira(result.estimatedValue)}</p>
                </div>
                <div className="p-6 bg-muted/20 rounded-3xl border-2 border-transparent text-center">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Aggressive</p>
                    <p className="font-bold text-xl">{formatNaira(result.range.high)}</p>
                </div>
            </div>


            <Accordion type="multiple" defaultValue={['insights']} className="w-full">
              <AccordionItem value="insights" className="border-2 rounded-3xl px-6 mb-4 bg-white shadow-sm overflow-hidden">
                <AccordionTrigger className="text-lg font-black hover:no-underline py-6">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-primary" /> Market Pulse
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8">
                     <div className="space-y-4">
                      <p className="text-lg font-medium text-foreground leading-relaxed">
                        {result.marketTrend}
                      </p>
                      <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-2xl text-sm text-muted-foreground font-bold">
                        <Info size={18} className="shrink-0" />
                        Analysis based on {result.comparablesCount} high-intent listings in the **{formData.city}** area.
                      </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="next-steps" className="border-2 rounded-3xl px-6 bg-white shadow-sm overflow-hidden">
                 <AccordionTrigger className="text-lg font-black hover:no-underline py-6">
                    <div className="flex items-center gap-3">
                        <ArrowRight className="h-5 w-5 text-primary" /> Strategic Next Steps
                    </div>
                 </AccordionTrigger>
                 <AccordionContent className="pb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {result.nextSteps.map((step: string, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-5 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all group">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">{index + 1}</div>
                            <span className="font-bold text-foreground text-sm leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                 </AccordionContent>
              </AccordionItem>
            </Accordion>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => {
                setStep(1)
                setResult(null)
              }}
              variant="outline"
              size="lg"
              className="h-14 font-bold border-2"
            >
              New Valuation
            </Button>
            
            <Button size="lg" className="h-14 bg-[#25D366] hover:bg-[#1EBE57] font-bold shadow-lg" asChild>
                <a href={`https://wa.me/?text=${generateWhatsAppMessage()}`} target="_blank" rel="noopener noreferrer">
                    <Share2 className="mr-2 h-5 w-5" /> WhatsApp Share
                </a>
            </Button>
            
            <Button variant="outline" size="lg" className="h-14 font-bold border-2" onClick={() => window.print()}>
                <Printer className="mr-2 h-5 w-5" /> Print Report
            </Button>

            <Button size="lg" className="h-14 font-black shadow-xl" asChild>
                <Link href="/agents">Consult Agent</Link>
            </Button>
          </div>

          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-3xl">
            <p className="text-xs text-yellow-800 leading-relaxed font-bold">
              ⚠️ DISCLAIMER: This is an automated algorithmic estimate provided by ApexFind for informational purposes only. It is not a certified professional valuation. Market conditions, local zoning laws, and the specific condition of your property can significantly impact final sale prices.
            </p>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

// Custom Loader Component
function Loader2(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}

'use client'

import { useState } from 'react'
import { Calculator, MapPin, Home, Bed, Bath, Square, TrendingUp } from 'lucide-react'
import { formatNaira } from '@/lib/naira-formatter'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'


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
  const [result, setResult] = useState<any>(null)
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
      setError('Please enter address and city')
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
        throw new Error(data.error || 'Failed to get valuation')
      }

      setResult(data)
      setStep(3)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const generateWhatsAppMessage = () => {
    if (!result) return ''
    
    const message = `🏡 *Property Valuation Report*\n\n` +
                   `📍 ${formData.address}, ${formData.city}\n` +
                   `💰 Estimated Value: ${formatNaira(result.estimatedValue)}\n` +
                   `📊 Confidence: ${(result.confidence * 100).toFixed(0)}%\n` +
                   `📈 Market Trend: ${result.marketTrend}\n\n` +
                   `🔗 View full report: ${window.location.origin}/valuation/${result.reportId}`
    
    return encodeURIComponent(message)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Calculator className="text-primary" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Get Instant Property Valuation
        </h1>
        <p className="text-muted-foreground">
          Get a data-driven estimate of your Nigerian property's value
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0"></div>
        
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex flex-col items-center relative z-10 text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors duration-300 ${
              step >= stepNumber 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {stepNumber}
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground">
              {stepNumber === 1 ? 'Details' : 
               stepNumber === 2 ? 'Review' : 
               'Report'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Property Details */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="inline w-4 h-4 mr-1" />
                Property Address
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g., 12 Admiralty Way, Lekki"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g., Lagos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
               <Select value={formData.state} onValueChange={(v) => handleSelectChange('state', v)}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">
                <Home className="inline w-4 h-4 mr-1" />
                Property Type
              </Label>
               <Select value={formData.propertyType} onValueChange={(v) => handleSelectChange('propertyType', v)}>
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                     {PROPERTY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>
                <Bed className="inline w-4 h-4 mr-1" />
                Bedrooms
              </Label>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={() => handleInputChange('bedrooms', Math.max(1, formData.bedrooms - 1))}>-</Button>
                <span className="text-xl font-semibold">{formData.bedrooms}</span>
                <Button variant="outline" size="icon" onClick={() => handleInputChange('bedrooms', formData.bedrooms + 1)}>+</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                <Bath className="inline w-4 h-4 mr-1" />
                Bathrooms
              </Label>
               <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={() => handleInputChange('bathrooms', Math.max(1, formData.bathrooms - 1))}>-</Button>
                <span className="text-xl font-semibold">{formData.bathrooms}</span>
                <Button variant="outline" size="icon" onClick={() => handleInputChange('bathrooms', formData.bathrooms + 1)}>+</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size-range">
                <Square className="inline w-4 h-4 mr-1" />
                Size (m²)
              </Label>
              <Slider
                id="size-range"
                value={[formData.size]}
                onValueChange={(v) => handleInputChange('size', v[0])}
                max={1000}
                min={50}
                step={10}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>50</span>
                <span className="font-semibold">{formData.size}</span>
                <span>1000</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year-range">Year Built</Label>
            <Slider
              id="year-range"
              value={[formData.yearBuilt]}
              onValueChange={(v) => handleInputChange('yearBuilt', v[0])}
              max={2024}
              min={1950}
              step={1}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>1950</span>
              <span className="font-semibold">{formData.yearBuilt}</span>
              <span>2024</span>
            </div>
          </div>

          <div>
            <Label className="block mb-3">Amenities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES.map(amenity => (
                 <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="font-normal text-sm">{amenity}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => setStep(2)} size="lg" className="w-full font-semibold text-lg">
            Continue to Review
          </Button>
        </div>
      )}

      {/* Step 2: Review & Estimate */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Review Your Property Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{formData.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{formData.city}, {formData.state}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Property Type</p>
                <p className="font-medium">{formData.propertyType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium">{formData.size} square meters</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bedrooms & Bathrooms</p>
                <p className="font-medium">{formData.bedrooms} bd • {formData.bathrooms} ba</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year Built</p>
                <p className="font-medium">{formData.yearBuilt}</p>
              </div>
            </div>

            {formData.amenities.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map(amenity => (
                    <span key={amenity} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingUp className="text-accent mt-1" size={20} />
              <div>
                <p className="text-sm text-accent-foreground">
                  <strong>Note:</strong> This is an automated estimate based on current market data in {formData.state}. 
                  For official valuation, consult a certified Nigerian valuer.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
             <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
            <Button
              onClick={handleEstimate}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Calculating...
                </span>
              ) : 'Get Instant Estimate'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Valuation Report */}
      {step === 3 && result && (
        <div className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
              <Calculator className="text-primary" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Your Property Valuation
            </h2>
            <p className="text-muted-foreground">
              Based on current Nigerian market data
            </p>
          </div>

          {/* Estimated Value */}
          <div className="text-center p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">ESTIMATED VALUE</p>
            <p className="text-5xl font-bold text-foreground mb-2">
              {formatNaira(result.estimatedValue)}
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              {result.confidence >= 0.8 ? 'High' : 'Medium'} Confidence ({(result.confidence * 100).toFixed(0)}%)
            </div>
          </div>

          {/* Value Range */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-center">Value Range</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Low End</p>
                    <p className="font-semibold text-lg">{formatNaira(result.range.low)}</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-primary font-medium">Likely Value</p>
                    <p className="font-bold text-primary text-xl">{formatNaira(result.estimatedValue)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">High End</p>
                    <p className="font-semibold text-lg">{formatNaira(result.range.high)}</p>
                </div>
            </div>
          </div>


          {/* Market Insights */}
            <Accordion type="multiple" defaultValue={['breakdown']}>
              <AccordionItem value="insights">
                <AccordionTrigger className="text-lg font-semibold">Market Insights</AccordionTrigger>
                <AccordionContent className="pt-2">
                     <div className="bg-background p-6 rounded-xl border">
                      <h4 className="font-semibold mb-3">Market Trend</h4>
                      <p className="text-foreground">{result.marketTrend}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Based on {result.comparablesCount} comparable properties
                      </p>
                    </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="breakdown">
                <AccordionTrigger className="text-lg font-semibold">Value Breakdown</AccordionTrigger>
                <AccordionContent className="pt-2">
                     <div className="space-y-4">
                      {Object.entries(result.breakdown).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-semibold">
                            {typeof value === 'number' ? formatNaira(value) : `${value}x`}
                          </span>
                        </div>
                      ))}
                    </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="next-steps">
                 <AccordionTrigger className="text-lg font-semibold">Next Steps</AccordionTrigger>
                 <AccordionContent className="pt-2">
                    <ul className="space-y-2">
                        {result.nextSteps.map((step: string, index: number) => (
                          <li key={index} className="flex items-center text-sm p-3 bg-muted/50 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                            {step}
                          </li>
                        ))}
                      </ul>
                 </AccordionContent>
              </AccordionItem>
            </Accordion>

          {/* Report ID & Actions */}
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Report ID: <span className="font-mono font-medium">{result.reportId}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Save this ID for future reference or professional consultation
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => {
                setStep(1)
                setResult(null)
              }}
              variant="outline"
              size="lg"
            >
              New Valuation
            </Button>
            
            <a
              href={`https://wa.me/?text=${generateWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#1EBE57]">Share on WhatsApp</Button>
            </a>
            
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="lg"
            >
              Print Report
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Disclaimer:</strong> This is an automated estimate for informational purposes only. 
              Not a substitute for professional valuation. Actual property value may vary based on market 
              conditions, property condition, and other factors specific to Nigeria.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

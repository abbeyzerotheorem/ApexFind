'use client'

import { useState, useEffect } from 'react'
import { Search, Calculator, MapPin, Home, Bed, Bath, Square, TrendingUp } from 'lucide-react'
import { formatNaira } from '@/lib/naira-formatter'

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

export default function InstantValuation() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    address: '',
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Calculator className="text-green-600" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Get Instant Property Valuation
        </h1>
        <p className="text-gray-600">
          Get a data-driven estimate of your Nigerian property's value
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
        
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex flex-col items-center relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              step >= stepNumber 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {stepNumber}
            </div>
            <span className="text-sm font-medium">
              {stepNumber === 1 ? 'Property Details' : 
               stepNumber === 2 ? 'Review & Estimate' : 
               'Valuation Report'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Property Details */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Property Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g., 12 Admiralty Way, Lekki"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g., Lagos"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                {NIGERIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="inline w-4 h-4 mr-1" />
                Property Type
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bed className="inline w-4 h-4 mr-1" />
                Bedrooms
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleInputChange('bedrooms', Math.max(1, formData.bedrooms - 1))}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-xl font-semibold">{formData.bedrooms}</span>
                <button
                  onClick={() => handleInputChange('bedrooms', formData.bedrooms + 1)}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bath className="inline w-4 h-4 mr-1" />
                Bathrooms
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleInputChange('bathrooms', Math.max(1, formData.bathrooms - 1))}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-xl font-semibold">{formData.bathrooms}</span>
                <button
                  onClick={() => handleInputChange('bathrooms', formData.bathrooms + 1)}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Square className="inline w-4 h-4 mr-1" />
                Size (square meters)
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={formData.size}
                onChange={(e) => handleInputChange('size', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>50m²</span>
                <span className="font-semibold">{formData.size}m²</span>
                <span>1000m²</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Built
            </label>
            <input
              type="range"
              min="1950"
              max="2024"
              step="1"
              value={formData.yearBuilt}
              onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>1950</span>
              <span className="font-semibold">{formData.yearBuilt}</span>
              <span>2024</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES.map(amenity => (
                <label
                  key={amenity}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="mr-3"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg"
          >
            Continue to Review
          </button>
        </div>
      )}

      {/* Step 2: Review & Estimate */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Review Your Property Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{formData.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{formData.city}, {formData.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Property Type</p>
                <p className="font-medium">{formData.propertyType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Size</p>
                <p className="font-medium">{formData.size} square meters</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bedrooms & Bathrooms</p>
                <p className="font-medium">{formData.bedrooms} bd • {formData.bathrooms} ba</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year Built</p>
                <p className="font-medium">{formData.yearBuilt}</p>
              </div>
            </div>

            {formData.amenities.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map(amenity => (
                    <span key={amenity} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingUp className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is an automated estimate based on current market data in {formData.state}. 
                  For official valuation, consult a certified Nigerian valuer.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleEstimate}
              disabled={loading}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Calculating...
                </span>
              ) : 'Get Instant Estimate'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Valuation Report */}
      {step === 3 && result && (
        <div className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <Calculator className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Property Valuation
            </h2>
            <p className="text-gray-600">
              Based on current Nigerian market data
            </p>
          </div>

          {/* Estimated Value */}
          <div className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <p className="text-sm text-gray-600 mb-2">ESTIMATED VALUE</p>
            <p className="text-5xl font-bold text-gray-900 mb-2">
              {formatNaira(result.estimatedValue)}
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              {result.confidence >= 0.8 ? 'High' : 'Medium'} Confidence ({(result.confidence * 100).toFixed(0)}%)
            </div>
          </div>

          {/* Value Range */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Value Range</h3>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                style={{ 
                  width: '100%',
                  background: `linear-gradient(to right, 
                    #ef4444 ${(result.range.low / result.range.high) * 50}%, 
                    #f59e0b 50%, 
                    #10b981 ${(result.estimatedValue / result.range.high) * 100}%)`
                }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Low: {formatNaira(result.range.low)}</span>
              <span>Most Likely: {formatNaira(result.estimatedValue)}</span>
              <span>High: {formatNaira(result.range.high)}</span>
            </div>
          </div>

          {/* Market Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border">
              <h4 className="font-semibold mb-3">Market Trend</h4>
              <p className="text-gray-700">{result.marketTrend}</p>
              <p className="text-sm text-gray-500 mt-2">
                Based on {result.comparablesCount} comparable properties
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <h4 className="font-semibold mb-3">Next Steps</h4>
              <ul className="space-y-2">
                {result.nextSteps.map((step: string, index: number) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Value Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Value Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(result.breakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-semibold">
                    {typeof value === 'number' ? formatNaira(value) : `${value}x`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Report ID & Actions */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Report ID: <span className="font-mono font-medium">{result.reportId}</span>
            </p>
            <p className="text-xs text-gray-500">
              Save this ID for future reference or professional consultation
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setStep(1)
                setResult(null)
              }}
              className="py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              New Valuation
            </button>
            
            <a
              href={`https://wa.me/?text=${generateWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-semibold"
            >
              Share on WhatsApp
            </a>
            
            <button
              onClick={() => window.print()}
              className="py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Print Report
            </button>
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

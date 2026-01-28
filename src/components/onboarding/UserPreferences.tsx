// components/onboarding/UserPreferences.tsx
'use client'

import { useState } from 'react'
import { MapPin, Home, TrendingUp, Bell, Check, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Import your preference illustrations
const LocationIllustration = '/illustrations/preferences-locations.svg'
const PropertyTypesIllustration = '/illustrations/preferences-types.svg'
const BudgetIllustration = '/illustrations/preferences-budget.svg'

const NIGERIAN_LOCATIONS = [
  { 
    id: 'lagos', 
    name: 'Lagos', 
    color: 'from-[#64B5F6] to-blue-500',
    popular: ['Lekki', 'Ikeja', 'Victoria Island', 'Ajah'],
    description: 'Commercial hub with luxury properties'
  },
  { 
    id: 'abuja', 
    name: 'Abuja', 
    color: 'from-green-500 to-emerald-500',
    popular: ['Maitama', 'Asokoro', 'Wuse', 'Garki'],
    description: 'Capital city with diplomatic properties'
  },
  { 
    id: 'rivers', 
    name: 'Port Harcourt', 
    color: 'from-purple-500 to-purple-600',
    popular: ['GRA', 'Old GRA', 'Trans-Amadi'],
    description: 'Oil & gas hub with waterfront properties'
  },
  { 
    id: 'oyo', 
    name: 'Ibadan', 
    color: 'from-orange-500 to-orange-600',
    popular: ['Bodija', 'Iwo Road', 'Mokola'],
    description: 'Historic city with affordable properties'
  },
  { 
    id: 'kano', 
    name: 'Kano', 
    color: 'from-red-500 to-red-600',
    popular: ['Nassarawa', 'Bompai', 'Gyadi-Gyadi'],
    description: 'Northern commercial center'
  },
  { 
    id: 'delta', 
    name: 'Delta', 
    color: 'from-yellow-500 to-yellow-600',
    popular: ['Warri', 'Asaba', 'Ughelli'],
    description: 'Oil-rich region with growing real estate'
  }
]

const PROPERTY_TYPES = [
  { id: 'apartment', name: 'Apartment', icon: '🏢', color: 'bg-blue-100 text-blue-800' },
  { id: 'duplex', name: 'Duplex', icon: '🏘️', color: 'bg-green-100 text-green-800' },
  { id: 'bungalow', name: 'Bungalow', icon: '🏡', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'commercial', name: 'Commercial', icon: '🏬', color: 'bg-purple-100 text-purple-800' },
  { id: 'land', name: 'Land', icon: '🗺️', color: 'bg-orange-100 text-orange-800' },
  { id: 'shortlet', name: 'Shortlet', icon: '🏨', color: 'bg-pink-100 text-pink-800' }
]

const BUDGET_RANGES = [
  { 
    id: 'under5m', 
    label: 'Under ₦5M', 
    description: 'Affordable starter properties',
    icon: '💰'
  },
  { 
    id: '5m-20m', 
    label: '₦5M - ₦20M', 
    description: 'Middle-class family homes',
    icon: '🏠'
  },
  { 
    id: '20m-50m', 
    label: '₦20M - ₦50M', 
    description: 'Luxury apartments & duplexes',
    icon: '🏢'
  },
  { 
    id: '50m-100m', 
    label: '₦50M - ₦100M', 
    description: 'High-end properties',
    icon: '🏰'
  },
  { 
    id: '100m+', 
    label: '₦100M+', 
    description: 'Premium & investment properties',
    icon: '💎'
  }
]

interface UserPreferencesProps {
  userId: string
  onComplete?: () => void
}

export default function UserPreferences({ userId, onComplete }: UserPreferencesProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [preferences, setPreferences] = useState({
    locations: [] as string[],
    propertyTypes: [] as string[],
    budgetRange: '',
    alertFrequency: 'daily',
    savedSearches: true
  })

  const handleLocationToggle = (locationId: string) => {
    setPreferences(prev => ({
      ...prev,
      locations: prev.locations.includes(locationId)
        ? prev.locations.filter(id => id !== locationId)
        : [...prev.locations, locationId]
    }))
  }

  const handlePropertyTypeToggle = (typeId: string) => {
    setPreferences(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(typeId)
        ? prev.propertyTypes.filter(id => id !== typeId)
        : [...prev.propertyTypes, typeId]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Save preferences to Firebase
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          preferences,
          completedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      // Mark preferences as set
      localStorage.setItem(`apexfind_preferences_${userId}`, 'true')
      
      // Call completion callback
      if (onComplete) {
        onComplete()
      } else {
        router.push('/dashboard')
      }
      
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStepIllustration = () => {
    switch(step) {
      case 1: return LocationIllustration
      case 2: return PropertyTypesIllustration
      case 3: return BudgetIllustration
      default: return LocationIllustration
    }
  }

  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Where in Nigeria are you looking?'
      case 2: return 'What type of property interests you?'
      case 3: return 'Set your budget & preferences'
      default: return 'Customize Your Experience'
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#64B5F6]/10 via-white to-[#008751]/5 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-8 border-b bg-gradient-to-r from-[#64B5F6]/5 to-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customize ApexFind</h1>
                <p className="text-gray-600">Tell us what you're looking for in Nigeria</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500">Step {step} of 3</div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`w-8 h-2 rounded-full transition-all ${
                      step >= stepNumber ? 'bg-[#64B5F6]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Illustration side */}
          <div className="relative">
            <div className="sticky top-8">
              <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-[#64B5F6]/10 to-[#64B5F6]/5 p-8">
                <Image
                  src={getStepIllustration()}
                  alt={`Onboarding step ${step} illustration`}
                  className="object-contain w-full h-full"
                  priority
                  width={300}
                  height={300}
                />
              </div>
              
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">{getStepTitle()}</h3>
                <p className="text-gray-600">
                  {step === 1 && 'Select cities to get personalized property recommendations'}
                  {step === 2 && 'Choose property types to see relevant listings'}
                  {step === 3 && 'Set your budget to find properties within your range'}
                </p>
                
                {step === 3 && (
                  <div className="p-4 bg-gradient-to-r from-[#64B5F6]/10 to-[#008751]/10 rounded-lg border border-[#64B5F6]/20">
                    <p className="text-sm text-gray-700">
                      💡 <strong>Nigerian Market Insight:</strong> Lagos and Abuja prices are typically 
                      20-40% higher than other states.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences side */}
          <div className="space-y-8">
            {/* Step 1: Locations */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {NIGERIAN_LOCATIONS.map(location => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationToggle(location.id)}
                      className={`p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden group ${
                        preferences.locations.includes(location.id)
                          ? 'border-[#64B5F6] bg-gradient-to-r from-[#64B5F6]/5 to-transparent shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {/* Selection indicator */}
                      {preferences.locations.includes(location.id) && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-[#64B5F6] rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      
                      {/* Gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${location.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                      
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-gray-900">{location.name}</span>
                          <span className="text-2xl">
                            {location.id === 'lagos' && '🌴'}
                            {location.id === 'abuja' && '🏛️'}
                            {location.id === 'rivers' && '⛽'}
                            {location.id === 'oyo' && '📚'}
                            {location.id === 'kano' && '🏺'}
                            {location.id === 'delta' && '🛢️'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{location.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {location.popular.map(area => (
                            <span key={area} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Property Types */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {PROPERTY_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handlePropertyTypeToggle(type.id)}
                      className={`p-6 rounded-xl border-2 transition-all text-center relative group ${
                        preferences.propertyTypes.includes(type.id)
                          ? 'border-[#64B5F6] bg-gradient-to-b from-[#64B5F6]/5 to-transparent shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {preferences.propertyTypes.includes(type.id) && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#64B5F6] rounded-full flex items-center justify-center shadow-lg">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                      
                      <div className="text-4xl mb-4">{type.icon}</div>
                      <span className="font-bold text-gray-900">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Budget & Preferences */}
            {step === 3 && (
              <div className="space-y-8">
                {/* Budget Range */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Select Your Budget Range</h3>
                  <div className="space-y-3">
                    {BUDGET_RANGES.map(range => (
                      <button
                        key={range.id}
                        onClick={() => setPreferences(prev => ({ ...prev, budgetRange: range.id }))}
                        className={`w-full p-5 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                          preferences.budgetRange === range.id
                            ? 'border-[#64B5F6] bg-gradient-to-r from-[#64B5F6]/5 to-transparent shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="text-3xl">{range.icon}</div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-lg">{range.label}</div>
                          <div className="text-sm text-gray-600">{range.description}</div>
                        </div>
                        {preferences.budgetRange === range.id && (
                          <div className="w-6 h-6 bg-[#64B5F6] rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alert Preferences */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#64B5F6]/10 rounded-lg flex items-center justify-center">
                        <Bell className="text-[#64B5F6]" size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Property Alerts</p>
                        <p className="text-sm text-gray-600">Get notified about new properties</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.savedSearches}
                        onChange={(e) => setPreferences(prev => ({ ...prev, savedSearches: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#64B5F6]"></div>
                    </label>
                  </div>

                  {preferences.savedSearches && (
                    <div className="p-5 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#64B5F6]/10 rounded-lg flex items-center justify-center">
                          <Bell className="text-[#64B5F6]" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Alert Frequency</p>
                          <p className="text-sm text-gray-600">How often to receive notifications</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {['instant', 'daily', 'weekly'].map(freq => (
                          <button
                            key={freq}
                            onClick={() => setPreferences(prev => ({ ...prev, alertFrequency: freq }))}
                            className={`px-5 py-3 rounded-lg capitalize font-medium transition-all ${
                              preferences.alertFrequency === freq
                                ? 'bg-[#64B5F6] text-white shadow-lg'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-4 pt-8 border-t">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-all"
                >
                  Back
                </button>
              )}
              
              <button
                onClick={() => {
                  if (step < 3) {
                    setStep(step + 1)
                  } else {
                    handleSubmit()
                  }
                }}
                disabled={
                  (step === 1 && preferences.locations.length === 0) ||
                  (step === 2 && preferences.propertyTypes.length === 0) ||
                  (step === 3 && !preferences.budgetRange) ||
                  loading
                }
                className={`flex-1 px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                  step === 3
                    ? 'bg-gradient-to-r from-[#008751] to-emerald-600 hover:from-emerald-600 hover:to-[#008751] text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-[#64B5F6] to-[#42A5F5] hover:from-[#42A5F5] hover:to-[#64B5F6] text-white shadow-lg hover:shadow-xl'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Preferences...
                  </>
                ) : (
                  <>
                    {step === 3 ? 'Complete Setup & View Properties' : 'Continue'}
                    {step < 3 && <ArrowRight size={20} />}
                  </>
                )}
              </button>
            </div>

            {/* Skip option */}
            {step === 1 && (
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  className="text-[#64B5F6] hover:text-[#42A5F5] font-medium"
                >
                  Skip preferences for now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

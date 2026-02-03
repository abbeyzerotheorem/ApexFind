// components/onboarding/UserPreferences.tsx
'use client'

import { useState } from 'react'
import { MapPin, Bell, Check, ArrowRight, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { doc, setDoc } from 'firebase/firestore'
import { useFirestore } from '@/firebase'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { cn } from '@/lib/utils'

const NIGERIAN_LOCATIONS = [
  { 
    id: 'lagos', 
    name: 'Lagos', 
    color: 'from-blue-400 to-blue-600',
    popular: ['Lekki', 'Ikeja', 'VI', 'Ajah'],
    description: 'Commercial hub with luxury properties'
  },
  { 
    id: 'abuja', 
    name: 'Abuja', 
    color: 'from-green-400 to-emerald-600',
    popular: ['Maitama', 'Asokoro', 'Wuse', 'Garki'],
    description: 'Capital city with diplomatic estates'
  },
  { 
    id: 'rivers', 
    name: 'Port Harcourt', 
    color: 'from-purple-400 to-purple-600',
    popular: ['GRA', 'Trans-Amadi'],
    description: 'Oil hub with waterfront living'
  },
  { 
    id: 'oyo', 
    name: 'Ibadan', 
    color: 'from-orange-400 to-orange-600',
    popular: ['Bodija', 'Iwo Road'],
    description: 'Historic city with growing developments'
  }
]

const PROPERTY_TYPES = [
  { id: 'apartment', name: 'Apartment', icon: '🏢' },
  { id: 'duplex', name: 'Duplex', icon: '🏘️' },
  { id: 'bungalow', name: 'Bungalow', icon: '🏡' },
  { id: 'commercial', name: 'Commercial', icon: '🏬' },
  { id: 'land', name: 'Land', icon: '🗺️' },
  { id: 'shortlet', name: 'Shortlet', icon: '🏨' }
]

const BUDGET_RANGES = [
  { id: 'under5m', label: 'Under ₦5M', icon: '💰' },
  { id: '5m-20m', label: '₦5M - ₦20M', icon: '🏠' },
  { id: '20m-50m', label: '₦20M - ₦50M', icon: '🏢' },
  { id: '50m-100m', label: '₦50M - ₦100M', icon: '🏰' },
  { id: '100m+', label: '₦100M+', icon: '💎' }
]

interface UserPreferencesProps {
  userId: string
  onComplete?: () => void
}

export default function UserPreferences({ userId, onComplete }: UserPreferencesProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const firestore = useFirestore()
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
    if (!firestore || !userId) return;
    setLoading(true)
    try {
      const userDocRef = doc(firestore, 'users', userId)
      await setDoc(userDocRef, {
        preferences,
        preferencesCompletedAt: new Date().toISOString()
      }, { merge: true })

      localStorage.setItem(`apexfind_preferences_${userId}`, 'true')
      if (onComplete) onComplete()
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const illustrationId = step === 1 ? 'preferences-locations' : step === 2 ? 'preferences-types' : 'preferences-budget';
  const illustration = PlaceHolderImages.find(img => img.id === illustrationId);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-background rounded-[2rem] shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-8 border-b bg-card flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-black text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground tracking-tight">Personalize ApexFind</h1>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Step {step} of 3</p>
              </div>
            </div>
            
            <div className="flex gap-1">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={cn(
                    "w-10 h-2 rounded-full transition-all duration-500",
                    step >= stepNumber ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="overflow-y-auto bg-background custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Illustration side */}
            <div className="relative hidden lg:block">
              <div className="sticky top-0">
                <div className="relative h-[400px] rounded-[2rem] overflow-hidden bg-muted/30 p-4 border-2 border-dashed">
                  {illustration && (
                    <Image
                      src={illustration.imageUrl}
                      alt={illustration.description}
                      data-ai-hint={illustration.imageHint}
                      className="object-cover w-full h-full rounded-2xl"
                      priority
                      fill
                    />
                  )}
                </div>
                <div className="mt-8 space-y-4 px-2">
                  <h3 className="text-2xl font-black text-foreground">
                    {step === 1 ? 'Location Targeting' : step === 2 ? 'Finding Your Style' : 'Market Positioning'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step === 1 && 'Select the cities where you want to focus your search. We will monitor these markets for you.'}
                    {step === 2 && 'Choosing your preferred property types helps our AI curate a highly relevant list of options.'}
                    {step === 3 && 'Define your budget boundaries to avoid mismatched listings and save valuable time.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Selection side */}
            <div className="space-y-8">
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {NIGERIAN_LOCATIONS.map(location => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationToggle(location.id)}
                      className={cn(
                        "p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group",
                        preferences.locations.includes(location.id)
                          ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                          : "border-border hover:border-muted-foreground/30 bg-card"
                      )}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-black text-foreground">{location.name}</span>
                          {preferences.locations.includes(location.id) && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                              <Check size={14} className="text-primary-foreground stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mb-4">{location.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {location.popular.map(area => (
                            <span key={area} className="px-2 py-0.5 bg-muted rounded-md text-[10px] font-black uppercase tracking-tight">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  {PROPERTY_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handlePropertyTypeToggle(type.id)}
                      className={cn(
                        "p-8 rounded-2xl border-2 transition-all text-center relative group",
                        preferences.propertyTypes.includes(type.id)
                          ? "border-primary bg-primary/5 shadow-md scale-105"
                          : "border-border hover:border-muted-foreground/30 bg-card"
                      )}
                    >
                      <div className="text-4xl mb-4">{type.icon}</div>
                      <span className="font-black text-foreground uppercase tracking-widest text-xs">{type.name}</span>
                      {preferences.propertyTypes.includes(type.id) && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                          <Check size={14} className="text-primary-foreground stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="font-black text-sm uppercase tracking-widest text-muted-foreground">Select Budget Range</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {BUDGET_RANGES.map(range => (
                        <button
                          key={range.id}
                          onClick={() => setPreferences(prev => ({ ...prev, budgetRange: range.id }))}
                          className={cn(
                            "w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4",
                            preferences.budgetRange === range.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-muted-foreground/30 bg-card"
                          )}
                        >
                          <div className="text-2xl">{range.icon}</div>
                          <span className="flex-1 font-black text-foreground">{range.label}</span>
                          {preferences.budgetRange === range.id && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                              <Check size={14} className="text-primary-foreground stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 rounded-2xl border-2 border-dashed bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm border border-primary/20">
                        <Bell className="text-primary" size={24} />
                      </div>
                      <div>
                        <p className="font-black text-foreground">Smart Alerts</p>
                        <p className="text-xs font-medium text-muted-foreground">Real-time matching enabled</p>
                      </div>
                    </div>
                    <Check className="text-green-500 stroke-[4]" />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4 pt-8 border-t">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-8 py-4 border-2 border-border rounded-xl hover:bg-muted font-black text-muted-foreground transition-all flex-1"
                  >
                    Back
                  </button>
                )}
                
                <button
                  onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                  disabled={
                    (step === 1 && preferences.locations.length === 0) ||
                    (step === 2 && preferences.propertyTypes.length === 0) ||
                    (step === 3 && !preferences.budgetRange) ||
                    loading
                  }
                  className="flex-[2] px-8 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-3 bg-primary text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {step === 3 ? 'Finish Setup' : 'Continue'}
                      {step < 3 && <ArrowRight size={20} />}
                    </>
                  )}
                </button>
              </div>

              {step === 1 && (
                <div className="text-center">
                  <button onClick={handleSubmit} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                    Skip preferences for now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

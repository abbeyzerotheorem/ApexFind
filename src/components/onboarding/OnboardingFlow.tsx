// components/onboarding/OnboardingFlow.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Home, Search, Heart, Bell, MapPin, Shield, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to ApexFind 🇳🇬',
    description: 'Your trusted partner for finding dream properties across Nigeria',
    illustration: '🏠',
    color: 'bg-[#64B5F6]',
    features: [
      'Search thousands of Nigerian properties',
      'Get instant property valuations',
      'Connect with verified agents'
    ]
  },
  {
    id: 'search',
    title: 'Find Your Perfect Home',
    description: 'Use our advanced filters to find properties in Lagos, Abuja, Port Harcourt, and beyond',
    illustration: '🔍',
    color: 'bg-[#64B5F6]',
    features: [
      'Filter by location, price, and amenities',
      'Save your favorite properties',
      'Get alerts for new listings'
    ]
  },
  {
    id: 'save',
    title: 'Save & Compare Properties',
    description: 'Easily save properties and compare features side by side',
    illustration: '💾',
    color: 'bg-[#64B5F6]',
    features: [
      'Save unlimited properties',
      'Add notes to each property',
      'Compare 3-4 properties at once'
    ]
  },
  {
    id: 'alerts',
    title: 'Get Instant Alerts',
    description: 'Never miss a perfect property with our smart notification system',
    illustration: '🔔',
    color: 'bg-[#64B5F6]',
    features: [
      'Custom price range alerts',
      'New listings in your areas',
      'Price reduction notifications'
    ]
  },
  {
    id: 'agents',
    title: 'Connect with Verified Agents',
    description: 'Work with trusted Nigerian real estate professionals',
    illustration: '🤝',
    color: 'bg-[#64B5F6]',
    features: [
      'All agents are verified',
      'Read reviews from past clients',
      'Schedule property tours'
    ]
  }
]

export default function OnboardingFlow({ userId }: { userId: string }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompleted = localStorage.getItem(`apexfind_onboarding_${userId}`)
    if (hasCompleted !== 'true') {
      setIsOpen(true)
    }
  }, [userId])

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleSkip = () => {
    completeOnboarding()
  }

  const completeOnboarding = async () => {
    // Mark onboarding as completed
    localStorage.setItem(`apexfind_onboarding_${userId}`, 'true')
    
    // Optional: Send to analytics
    await fetch('/api/analytics/onboarding-complete', {
      method: 'POST',
      body: JSON.stringify({ userId, step: currentStep + 1 })
    })
    
    setIsOpen(false)
    router.refresh()
  }

  if (!isOpen) return null

  const step = ONBOARDING_STEPS[currentStep]
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to ApexFind</h2>
            <p className="text-gray-600">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Skip onboarding"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-[#64B5F6] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-32 h-32 ${step.color} text-white rounded-full mb-6 text-6xl`}>
              {step.illustration}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
            <p className="text-xl text-gray-600 max-w-xl mx-auto">{step.description}</p>
          </div>

          {/* Features list */}
          <div className="space-y-4 mb-10">
            {step.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-[#64B5F6]/10 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#64B5F6] rounded-full"></div>
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Nigerian context tip */}
          {currentStep === 0 && (
            <div className="mb-8 p-4 bg-[#64B5F6]/10 border border-[#64B5F6]/20 rounded-lg">
              <p className="text-sm text-[#64B5F6] font-medium">
                🇳🇬 <strong>Nigerian Focus:</strong> We specialize in properties across all 36 states, 
                with special expertise in Lagos, Abuja, and Port Harcourt.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSkip}
              className="flex-1 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Close' : 'Skip Tour'}
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-4 bg-[#64B5F6] text-white rounded-xl hover:bg-[#42A5F5] font-semibold transition-colors flex items-center justify-center gap-3"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                'Start Finding Properties'
              ) : (
                <>
                  Continue
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-[#64B5F6]' : 'bg-gray-300'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

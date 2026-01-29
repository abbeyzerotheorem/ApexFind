// components/onboarding/OnboardingFlow.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const CUSTOMER_ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to ApexFind 🇳🇬',
    description: 'Your trusted partner for finding dream properties across Nigeria',
    illustration: '/illustrations/onboarding-welcome.jpg',
    alt: 'ApexFind welcome illustration showing Nigerian architecture and happy home seekers',
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
    illustration: '/illustrations/onboarding-search.png',
    alt: 'Map of Nigeria with property search interface',
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
    illustration: '/illustrations/onboarding-compare.png',
    alt: 'Property comparison dashboard with Nigerian listings',
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
    illustration: '/illustrations/onboarding-alerts.jpg',
    alt: 'Smartphone showing Nigerian property alerts',
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
    illustration: '/illustrations/onboarding-agents.jpg',
    alt: 'Verified Nigerian real estate agents with badges',
    features: [
      'All agents are verified',
      'Read reviews from past clients',
      'Schedule property tours'
    ]
  }
];

const AGENT_ONBOARDING_STEPS = [
  {
    id: 'agent-welcome',
    title: 'Welcome, Agent!',
    description: 'Start listing properties and connect with buyers and renters across Nigeria.',
    illustration: '/illustrations/onboarding-agent-welcome.jpg',
    alt: 'An illustration showing a real estate agent welcoming a client to a new home.',
    features: [
      'List unlimited properties',
      'Build your professional brand',
      'Gain valuable market insights'
    ]
  },
  {
    id: 'agent-profile',
    title: 'Build Your Public Profile',
    description: 'Create a compelling profile to attract clients. Add your photo, bio, and specialties.',
    illustration: '/illustrations/onboarding-agent-profile.jpg',
    alt: 'An illustration of an agent profile page with a photo, bio, and contact information.',
    features: [
      'Showcase your experience and sales',
      'List your spoken languages',
      'Build trust with potential clients'
    ]
  },
  {
    id: 'agent-listing',
    title: 'List Properties with Ease',
    description: 'Our intuitive form makes it simple to add and manage your property listings.',
    illustration: '/illustrations/onboarding-agent-listing.jpg',
    alt: 'An illustration of a simple property listing form on a screen.',
    features: [
      'Upload high-quality photos',
      'Add detailed descriptions and amenities',
      'Update status and price instantly'
    ]
  },
  {
    id: 'agent-performance',
    title: 'Track Your Performance',
    description: 'Your agent dashboard provides insights into listing views and market trends.',
    illustration: '/illustrations/onboarding-agent-performance.jpg',
    alt: 'An illustration of a dashboard with charts and graphs showing performance metrics.',
    features: [
      'Monitor views on your listings',
      'See top searched locations',
      'Understand what buyers are looking for'
    ]
  },
  {
    id: 'agent-chat',
    title: 'Connect with Clients Directly',
    description: 'Use our secure, built-in messaging to communicate with interested parties.',
    illustration: '/illustrations/onboarding-agent-chat.jpg',
    alt: 'An illustration of a chat interface between an agent and a client.',
    features: [
      'Receive inquiries in real-time',
      'Schedule tours and meetings',
      'Keep all communications in one place'
    ]
  }
];


interface OnboardingFlowProps {
  userId: string;
  role?: 'customer' | 'agent';
  onComplete?: () => void;
}

export default function OnboardingFlow({ userId, role = 'customer', onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()

  const ONBOARDING_STEPS = role === 'agent' ? AGENT_ONBOARDING_STEPS : CUSTOMER_ONBOARDING_STEPS;
  const headerTitle = role === 'agent' ? 'Agent Welcome' : 'Welcome to ApexFind';

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompleted = localStorage.getItem(`apexfind_onboarding_${userId}`)
    if (hasCompleted === 'true') {
      setIsOpen(false)
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
    try {
      await fetch('/api/analytics/onboarding-complete', {
        method: 'POST',
        body: JSON.stringify({ 
          userId, 
          step: currentStep + 1,
          completed: true 
        })
      })
    } catch (error) {
      console.log('Analytics error:', error)
    }
    
    setIsOpen(false)
    
    // Call completion callback if provided
    if (onComplete) {
      onComplete()
    } else {
      router.refresh()
    }
  }

  if (!isOpen) return null

  const step = ONBOARDING_STEPS[currentStep]
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-slideUp">
        {/* Header with close button */}
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#64B5F6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{headerTitle}</h2>
              <p className="text-sm text-gray-600">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Skip onboarding"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div 
            className="h-full bg-[#64B5F6] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main content */}
        <div className="overflow-y-auto">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Illustration column */}
              <div className="relative">
                <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-[#64B5F6]/10 to-[#64B5F6]/5 p-8">
                  <Image
                    src={step.illustration}
                    alt={step.alt}
                    className="object-contain w-full h-full"
                    priority
                    fill
                    sizes="(max-width: 1024px) 90vw, 50vw"
                  />
                </div>
                
                {/* Step indicator dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {ONBOARDING_STEPS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        index === currentStep 
                          ? 'bg-[#64B5F6] w-8' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Content column */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Features list */}
                <div className="space-y-4">
                  {step.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-[#64B5F6]/5 to-transparent">
                      <div className="w-6 h-6 bg-[#64B5F6] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-white" />
                      </div>
                      <span className="font-medium text-gray-800">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Nigerian context tip for first step */}
                {currentStep === 0 && (
                  <div className="p-4 bg-gradient-to-r from-[#64B5F6]/10 to-[#008751]/10 border border-[#64B5F6]/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🇳🇬</span>
                      <div>
                        <p className="font-medium text-gray-800">Nigerian Focus</p>
                        <p className="text-sm text-gray-600">
                          We specialize in properties across all 36 states, with expertise in Lagos, Abuja, and Port Harcourt.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleSkip}
                    className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-all hover:border-gray-400"
                  >
                    {isLastStep ? 'Close' : 'Skip Tour'}
                  </button>
                  
                  <button
                    onClick={handleNext}
                    className="px-8 py-4 bg-gradient-to-r from-[#64B5F6] to-[#42A5F5] text-white rounded-xl hover:from-[#42A5F5] hover:to-[#64B5F6] font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                  >
                    <span className="text-lg">
                      {isLastStep ? (role === 'agent' ? 'Go to Dashboard' : 'Set Preferences') : 'Continue'}
                    </span>
                    {!isLastStep && (
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

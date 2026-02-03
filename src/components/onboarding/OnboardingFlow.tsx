// components/onboarding/OnboardingFlow.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PlaceHolderImages } from '@/lib/placeholder-images'

const CUSTOMER_ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to ApexFind 🇳🇬',
    description: 'Your trusted partner for finding dream properties across Nigeria',
    illustrationId: 'onboarding-welcome',
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
    illustrationId: 'onboarding-search',
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
    illustrationId: 'onboarding-compare',
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
    illustrationId: 'onboarding-alerts',
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
    illustrationId: 'onboarding-agents',
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
    illustrationId: 'onboarding-welcome',
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
    illustrationId: 'onboarding-agents',
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
    illustrationId: 'onboarding-search',
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
    illustrationId: 'onboarding-compare',
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
    illustrationId: 'onboarding-alerts',
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
        headers: { 'Content-Type': 'application/json' },
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
  const illustration = PlaceHolderImages.find(img => img.id === step.illustrationId);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-card">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-black text-lg">A</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{headerTitle}</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Skip onboarding"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main content */}
        <div className="overflow-y-auto bg-card">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Illustration column */}
              <div key={`image-${currentStep}`} className="relative animate-fadeIn">
                <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden bg-muted/30 p-4 border border-border">
                  {illustration && (
                    <Image
                      src={illustration.imageUrl}
                      alt={illustration.description}
                      data-ai-hint={illustration.imageHint}
                      className="object-cover w-full h-full rounded-xl"
                      priority
                      fill
                      sizes="(max-width: 1024px) 90vw, 50vw"
                    />
                  )}
                </div>
                
                {/* Step indicator dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {ONBOARDING_STEPS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentStep 
                          ? 'bg-primary w-8' 
                          : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Content column */}
              <div key={`text-${currentStep}`} className="space-y-8 animate-slideUp">
                <div>
                  <h3 className="text-3xl lg:text-4xl font-black text-foreground mb-4 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Features list */}
                <div className="space-y-3">
                  {step.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Check size={14} className="text-primary-foreground stroke-[3]" />
                      </div>
                      <span className="font-bold text-sm text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleSkip}
                    className="px-8 py-4 border-2 border-border rounded-xl hover:bg-muted font-bold text-muted-foreground transition-all flex-1"
                  >
                    {isLastStep ? 'Close' : 'Skip Tour'}
                  </button>
                  
                  <button
                    onClick={handleNext}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 font-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group flex-[2]"
                  >
                    <span className="text-lg">
                      {isLastStep ? (role === 'agent' ? 'Dashboard' : 'Personalize') : 'Continue'}
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

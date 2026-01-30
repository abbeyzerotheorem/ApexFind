
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Building, Lightbulb, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const teamMembers = [
  {
    name: 'Tunde Ojo',
    role: 'Founder & CEO',
    imageUrl: PlaceHolderImages.find((img) => img.id === 'agent-3')?.imageUrl ?? '',
    imageHint: 'man portrait',
  },
  {
    name: 'Amina Bello',
    role: 'Head of Product',
    imageUrl: PlaceHolderImages.find((img) => img.id === 'agent-1')?.imageUrl ?? '',
    imageHint: 'woman portrait',
  },
  {
    name: 'Chidi Eze',
    role: 'Lead Engineer',
    imageUrl: PlaceHolderImages.find((img) => img.id === 'agent-5')?.imageUrl ?? '',
    imageHint: 'man glasses',
  },
  {
    name: 'Fatima Aliyu',
    role: 'Head of Agent Relations',
    imageUrl: PlaceHolderImages.find((img) => img.id === 'agent-4')?.imageUrl ?? '',
    imageHint: 'confident woman',
  },
]

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We leverage technology to simplify the real estate process, from smart search algorithms to instant valuations, making property transactions more efficient and transparent.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    description:
      'Every agent on our platform is thoroughly vetted to ensure you work with only the most professional and reliable experts in the Nigerian market.',
  },
  {
    icon: Building,
    title: 'Local Expertise',
    description:
      'We are deeply rooted in the Nigerian market. Our data, insights, and network are tailored to the unique dynamics of real estate across all 36 states.',
  },
]

export default function AboutPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'property-2');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-center text-white">
        {heroImage && (
            <Image
            src={heroImage.imageUrl}
            alt="Modern Nigerian architecture"
            fill
            className="object-cover"
            priority
            />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 p-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Reimagining Real Estate in Nigeria
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-200 md:text-xl">
            We are a team of innovators, thinkers, and real estate enthusiasts dedicated to making your property journey simple, transparent, and successful.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold uppercase tracking-wider text-primary">
              Our Mission
            </h2>
            <p className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              To empower every Nigerian with the data and tools to make confident real estate decisions.
            </p>
            <p className="mt-6 mx-auto max-w-3xl text-lg text-muted-foreground">
              The Nigerian property market is full of opportunity, but it can be complex and opaque. ApexFind was created to change that. We believe that everyone deserves access to reliable information, trusted professionals, and a seamless platform to buy, sell, or rent a home.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-secondary py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Choose ApexFind?
            </h2>
             <p className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground">
                We're built on a foundation of values that prioritize you.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Meet the Leadership Team
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground">
              The passionate individuals guiding our mission to transform Nigerian real estate.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((person) => (
              <div key={person.name} className="text-center">
                <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage src={person.imageUrl} alt={person.name} data-ai-hint={person.imageHint}/>
                    <AvatarFallback>{person.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <h3 className="mt-4 text-xl font-bold text-foreground">
                  {person.name}
                </h3>
                <p className="text-primary">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* CTA Section */}
      <section className="bg-primary/10 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to start your journey?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
                Whether you're looking for a new home, selling your current one, or seeking an expert agent, your next step starts here.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href="/search">Search for Homes</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/agents">Find an Agent</Link>
                </Button>
            </div>
        </div>
      </section>
    </div>
  )
}

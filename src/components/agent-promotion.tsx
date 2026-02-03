'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Search } from "lucide-react";
import Link from "next/link";

const agents = [
  {
    name: "Amina Adebayo",
    title: "Lead Agent, Apex Realty",
    imageUrl:
      PlaceHolderImages.find((img) => img.id === "agent-1")?.imageUrl ?? "",
    imageHint: "professional woman",
  },
  {
    name: "Chinedu Okoro",
    title: "Senior Partner, Urban Dwellings",
    imageUrl:
      PlaceHolderImages.find((img) => img.id === "agent-2")?.imageUrl ?? "",
    imageHint: "man suit",
  },
];

export default function AgentPromotion() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/agents?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/agents');
    }
  };

  return (
    <section className="bg-background py-16 sm:py-20 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-semibold text-4xl tracking-tight text-foreground sm:text-5xl leading-tight">
              Find an agent who knows your neighborhood
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Our network of top-rated, verified agents are here to help you navigate the
              complexities of the Nigerian property market.
            </p>
            <div className="mt-8">
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <Input
                  type="text"
                  placeholder="Enter a city or area (e.g. Lekki, Abuja)"
                  className="flex-grow h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-primary text-primary-foreground h-12 w-12"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search Agents</span>
                </Button>
              </form>
              <Button variant="link" className="mt-4 p-0 text-primary font-semibold" asChild>
                <Link href="/agents">Browse all verified agents →</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage
                    src={agent.imageUrl}
                    alt={agent.name}
                    data-ai-hint={agent.imageHint}
                  />
                  <AvatarFallback>
                    {agent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.title}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/agents">Contact</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

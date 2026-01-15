import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Search } from "lucide-react";

const agents = [
  {
    name: "Mariana Miller",
    title: "Lead Agent, Apex Realty",
    imageUrl:
      PlaceHolderImages.find((img) => img.id === "agent-1")?.imageUrl ?? "",
    imageHint:
      PlaceHolderImages.find((img) => img.id === "agent-1")?.imageHint ?? "",
  },
  {
    name: "Jonathan Smith",
    title: "Senior Partner, Urban Dwellings",
    imageUrl:
      PlaceHolderImages.find((img) => img.id === "agent-2")?.imageUrl ?? "",
    imageHint:
      PlaceHolderImages.find((img) => img.id === "agent-2")?.imageHint ?? "",
  },
];

export default function AgentPromotion() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Find an agent who knows your market
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Our network of top-rated agents are here to help you navigate the
              complexities of buying or selling a home, ensuring you get the
              best deal possible.
            </p>
            <div className="mt-8">
              <form className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter a city or zip code"
                  className="flex-grow"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-primary text-primary-foreground"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search Agents</span>
                </Button>
              </form>
            </div>
          </div>
          <div className="flex flex-col gap-8">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm"
              >
                <Avatar className="h-16 w-16">
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
                <div>
                  <h3 className="text-lg font-bold">{agent.name}</h3>
                  <p className="text-muted-foreground">{agent.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { CheckSquare, Home, Users } from "lucide-react";

const steps = [
  {
    icon: Home,
    title: "Find a Home",
    description:
      "Use our powerful search tools and AI-driven recommendations to discover properties that match your unique criteria.",
  },
  {
    icon: Users,
    title: "Meet an Agent",
    description:
      "Connect with a top-rated local agent who will guide you through every step of the process with expert advice.",
  },
  {
    icon: CheckSquare,
    title: "Close the Deal",
    description:
      "Navigate offers, negotiations, and paperwork with confidence, and move into the home of your dreams.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-secondary py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-semibold text-4xl tracking-tight text-foreground sm:text-5xl">
            Your Journey to a New Home
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            We simplify the process of finding and buying a home, making it
            smoother and more transparent.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-12 text-center md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

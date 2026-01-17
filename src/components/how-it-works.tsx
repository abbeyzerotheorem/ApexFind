const steps = [
  {
    step: 1,
    title: "Search Properties",
    description:
      "Use our advanced filters to find properties that match your criteria.",
  },
  {
    step: 2,
    title: "Save & Compare",
    description:
      "Create an account to save favorite homes and compare features.",
  },
  {
    step: 3,
    title: "Connect with Agents",
    description:
      "Schedule tours and get professional guidance from our trusted agents.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.step} className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">{step.step}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

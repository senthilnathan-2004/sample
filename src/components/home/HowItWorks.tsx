const STEPS = [
  {
    title: "Browse & Choose",
    desc: "Discover beautiful, handmade products crafted with care and love.",
  },
  {
    title: "Personalise",
    desc: "Add custom colours and text to make your item truly one of a kind.",
  },
  {
    title: "Place an Order",
    desc: "Add your favourite items to the cart and securely complete your purchase.",
  },
  {
    title: "Fast Delivery",
    desc: "Experience quick and safe delivery right to your doorstep, nationwide.",
  },
];

export function HowItWorks() {
  return (
    <section className="mt-12 py-12">
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          How it Works
        </h2>
        <p className="mt-4 text-lg text-muted">
          Your favorite handmade items, delivered to you in four simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto px-0 sm:px-2">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="group relative flex flex-col items-center text-center p-5 sm:p-8 rounded-3xl bg-background border border-border/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-brand/30 mt-2 sm:mt-0"
          >
            {/* Step Number Indicator */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white font-bold text-sm shadow-md">
              {index + 1}
            </div>

            <h3 className="mb-3 font-heading text-xl font-semibold text-foreground mt-4">
              {step.title}
            </h3>
            <p className="text-muted leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

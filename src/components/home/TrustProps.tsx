import { AppIcon } from "@/components/ui/AppIcon";

// "Why handmade" trust strip.
const PROPS = [
  { icon: "🧶", title: "Handmade to order", desc: "Every piece crocheted by hand, just for you." },
  { icon: "🚚", title: "Ships across India", desc: "Free shipping on orders over ₹999." },
  { icon: "🎨", title: "Personalise it", desc: "Custom colours and text on many items." },
  { icon: "💬", title: "We're on WhatsApp", desc: "Questions? Message us anytime." },
];

export function TrustProps() {
  return (
    <section className="mt-12 sm:mt-16 mb-8 py-8 px-4 sm:py-12 sm:px-8 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-cream to-white border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why choose us
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            We bring you the finest handcrafted items with a focus on quality, personalisation, and care.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-2 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROPS.map((p) => (
            <div 
              key={p.title} 
              className="group flex flex-col items-center text-center p-4 sm:p-6 rounded-3xl transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-1"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-3xl" aria-hidden>
                  <AppIcon name={p.icon} />
                </span>
              </div>
              <div>
                <h3 className="mb-2 font-heading text-lg font-bold text-foreground group-hover:text-brand transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { CategoryDTO } from "@/types";
import { AppIcon } from "@/components/ui/AppIcon";
import { IconChevronRight } from "@/components/ui/icons";

/**
 * Zepto-style category hub: a tinted hero band with title + blurb and a floating
 * strip of category thumbnails, followed by a grid of category cards (image +
 * name + description). Used on the /categories landing page.
 */
export function CategoryHub({ categories }: { categories: CategoryDTO[] }) {
  return (
    <div className="mx-auto max-w-page px-4 py-4 sm:py-6 lg:px-6">
      {/* Hero band */}
      <section className="overflow-hidden rounded-card bg-brand-tint">
        <div className="flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h1 className="font-heading text-3xl font-extrabold leading-tight text-ink sm:text-5xl">
              Handmade Crochet <span className="text-brand">Essentials</span>
            </h1>
            <p className="mt-3 text-sm text-ink/80 text-justify sm:text-base">
              Keychains, flower bouquets, bag charms, soft toys and accessories — every
              piece crocheted by hand and made to order across India.
            </p>
          </div>

        </div>
      </section>

      {/* Count chip */}
      <p className="mt-6 inline-block rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {categories.length} {categories.length === 1 ? "Category" : "Categories"}
      </p>

      {/* Category card grid */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className="group flex items-center gap-4 rounded-card border border-hairline bg-white p-4 transition-shadow hover:shadow-card"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream">
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="grid h-full place-items-center text-brand">
                  <AppIcon name={c.slug} className="h-8 w-8" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="flex items-center gap-1 font-heading text-base font-extrabold text-ink group-hover:text-brand">
                {c.name}
                <IconChevronRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </h2>
              {c.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

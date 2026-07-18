import Link from "next/link";
import Image from "next/image";
import type { CategoryDTO } from "@/types";

// Category shortcut grid.
export function CategoryGrid({ categories }: { categories: CategoryDTO[] }) {
  if (!categories.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-heading text-xl font-bold">Shop by category</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className="group flex flex-col items-center gap-2 text-center sm:gap-3 lg:rounded-card lg:p-2 lg:transition-colors lg:hover:bg-cream/30"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-hairline bg-[#f8f8f8] shadow-sm transition-all duration-300 group-hover:shadow-md lg:shadow-card">
              {c.image ? (
                <Image 
                  src={c.image} 
                  alt={c.name} 
                  fill 
                  sizes="(max-width: 640px) 35vw, (max-width: 1024px) 25vw, 20vw" 
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              ) : (
                <div className="grid h-full place-items-center text-4xl">🧶</div>
              )}
            </div>
            <span className="font-heading text-sm font-bold leading-tight text-ink sm:text-base lg:mb-1">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

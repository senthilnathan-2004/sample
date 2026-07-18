import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Page } from "@/models/Page";
import { sanitizeHtml } from "@/lib/sanitize";

export const revalidate = 60;

async function getPage(slug: string) {
  await dbConnect();
  return Page.findOne({ slug }).lean().exec();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) return { title: "Not found" };
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description,
  };
}

export default async function PolicyPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-3xl font-extrabold">{page.title}</h1>
      {/* Content is sanitized on save AND again on render (defense in depth). */}
      <div
        className="prose mt-6 max-w-none text-ink [&_a]:text-brand [&_h2]:mt-6 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.bodyHtml ?? "") }}
      />
    </div>
  );
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Page } from "@/models/Page";
import { requireAdmin } from "@/lib/adminAuth";
import { sanitizeHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/validate";

export const dynamic = "force-dynamic";

const schema = z.object({
  slug: z.string().min(1).max(60),
  title: z.string().min(1).max(120),
  bodyHtml: z.string().max(50000),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
});

export async function GET() {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  await dbConnect();
  const rows = await Page.find().select("slug title updatedAt").lean().exec();
  return NextResponse.json({ pages: rows.map((p) => ({ slug: p.slug, title: p.title })) });
}

// Create or update a page (upsert by slug). Body HTML is sanitized before save.
export async function POST(req: Request) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid page" }, { status: 400 });

  const slug = slugify(parsed.data.slug);
  await dbConnect();
  await Page.findOneAndUpdate(
    { slug },
    { slug, title: parsed.data.title, bodyHtml: sanitizeHtml(parsed.data.bodyHtml), seo: parsed.data.seo },
    { upsert: true },
  ).exec();

  revalidatePath(`/policies/${slug}`);
  return NextResponse.json({ ok: true, slug });
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Settings } from "@/models/Settings";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const schema = z.object({
  branding: z
    .object({
      siteName: z.string().min(1).max(60),
      tagline: z.string().max(80),
      logoUrl: z.string().optional().or(z.literal("")),
    })
    .partial()
    .optional(),
  commerce: z
    .object({
      shippingFlatRate: z.number().min(0),
      freeShippingThreshold: z.number().min(0),
      codEnabled: z.boolean(),
      whatsappNumber: z.string().max(20).optional().or(z.literal("")),
    })
    .partial()
    .optional(),
  announcementBar: z.object({ text: z.string().max(160), active: z.boolean() }).partial().optional(),
  footer: z.object({ contactInfo: z.string().max(200), copyright: z.string().max(120) }).partial().optional(),
});

// Owner-only: update the CMS settings singleton, then revalidate the storefront.
export async function PUT(req: Request) {
  const auth = await requireAdmin("owner");
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings" }, { status: 400 });

  await dbConnect();
  const set: Record<string, unknown> = {};
  for (const [group, vals] of Object.entries(parsed.data)) {
    if (!vals) continue;
    for (const [k, v] of Object.entries(vals)) set[`${group}.${k}`] = v;
  }
  await Settings.findOneAndUpdate({ key: "singleton" }, { $set: set }, { upsert: true }).exec();

  revalidatePath("/");
  revalidatePath("/shop");
  return NextResponse.json({ ok: true });
}

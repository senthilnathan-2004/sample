import { dbConnect } from "@/lib/db";
import { Page } from "@/models/Page";
import { PagesAdmin } from "@/components/admin/PagesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPages() {
  await dbConnect();
  const rows = await Page.find().select("slug title").lean().exec();
  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-extrabold">Policy &amp; info pages</h1>
      <PagesAdmin pages={rows.map((p) => ({ slug: p.slug, title: p.title }))} />
    </div>
  );
}

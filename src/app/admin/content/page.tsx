import { getSettings } from "@/lib/settings";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminContent() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-extrabold">Content &amp; settings</h1>
      <p className="mb-4 text-sm text-muted">Edits publish to the live storefront (ISR revalidate).</p>
      <ContentEditor initial={settings} />
    </div>
  );
}

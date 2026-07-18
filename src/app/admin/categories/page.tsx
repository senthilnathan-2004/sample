import { dbConnect } from "@/lib/db";
import { Category } from "@/models/Category";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  await dbConnect();
  const rows = await Category.find().sort({ sortOrder: 1, name: 1 }).lean().exec();
  const categories = rows.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    icon: c.icon ?? undefined,
    description: c.description ?? undefined,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
  }));

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-extrabold">Categories</h1>
      <CategoriesManager initial={categories} />
    </div>
  );
}

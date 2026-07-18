import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Product, type ProductRaw } from "@/models/Product";
import { adminListCategories } from "@/lib/adminData";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: { id: string } }) {
  await dbConnect();
  const p = await Product.findById(params.id).lean<ProductRaw>().exec();
  if (!p) notFound();
  const categories = await adminListCategories();

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-extrabold">Edit product</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: String(p._id),
          name: p.name,
          slug: p.slug,
          category: String(p.category),
          description: p.description ?? "",
          care: p.care ?? "",
          images: p.images ?? [],
          basePrice: p.basePrice,
          compareAtPrice: p.compareAtPrice ?? null,
          variants: (p.variants ?? []).map((v) => ({
            color: v.color,
            size: v.size ?? "",
            customTextAllowed: !!v.customTextAllowed,
            priceDelta: v.priceDelta ?? 0,
            stock: v.stock ?? null,
            sku: v.sku ?? "",
          })),
          leadTimeDays: p.leadTimeDays ?? 4,
          isCustomizable: !!p.isCustomizable,
          isBestseller: !!p.isBestseller,
          isActive: p.isActive,
          tags: p.tags ?? [],
        }}
      />
    </div>
  );
}

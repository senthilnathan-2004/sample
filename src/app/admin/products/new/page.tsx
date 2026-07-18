import { adminListCategories } from "@/lib/adminData";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const categories = await adminListCategories();
  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-extrabold">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}

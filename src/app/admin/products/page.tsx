import Link from "next/link";
import { adminListProducts } from "@/lib/adminData";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await adminListProducts();
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">Products</h1>
        <Link href="/admin/products/new">
          <Button variant="primary">+ New product</Button>
        </Link>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}

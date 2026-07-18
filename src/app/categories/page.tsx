import { getCategories } from "@/lib/catalog";
import { CategoryHub } from "@/components/home/CategoryHub";

export const metadata = {
  title: "Categories",
};

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoryHub categories={categories} />;
}

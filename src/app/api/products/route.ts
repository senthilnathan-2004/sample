import { NextResponse } from "next/server";
import { queryProducts, suggest } from "@/lib/catalog";
import { parseProductFilters } from "@/lib/productQuery";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Lightweight autocomplete mode for the header search.
  if (searchParams.get("suggest") === "1") {
    const q = searchParams.get("q") ?? "";
    const items = await suggest(q);
    return NextResponse.json({ items });
  }

  try {
    const filters = parseProductFilters(searchParams);
    const result = await queryProducts(filters);
    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/products failed", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

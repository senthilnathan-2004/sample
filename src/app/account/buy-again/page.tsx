import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { getBuyAgain } from "@/lib/account";
import { BuyAgainList } from "@/components/account/BuyAgainList";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function BuyAgainPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/account/buy-again");
  const items = await getBuyAgain();

  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <Link href="/account" className="text-sm text-brand hover:underline">
        ← Your account
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-extrabold">Buy again</h1>

      {items.length === 0 ? (
        <div className="mt-8 grid place-items-center gap-4 rounded-card border border-hairline py-16 text-center">
          <p className="text-lg">Products from your delivered orders will appear here.</p>
          <Link href="/shop">
            <Button variant="primary">Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <BuyAgainList items={items} />
        </div>
      )}
    </div>
  );
}

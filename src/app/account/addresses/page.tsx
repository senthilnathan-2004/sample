import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyAccount } from "@/lib/account";
import { AddressManager } from "@/components/account/AddressManager";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const account = await getMyAccount();
  if (!account) redirect("/login?next=/account/addresses");

  const addresses = account.addresses.map((a) => ({
    _id: a._id,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 ?? "",
    landmark: a.landmark ?? "",
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    type: a.type,
    isDefault: a.isDefault,
  }));

  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <Link href="/account" className="text-sm text-brand hover:underline">
        ← Your account
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-extrabold">Your addresses</h1>
      <div className="mt-6">
        <AddressManager initial={addresses} />
      </div>
    </div>
  );
}

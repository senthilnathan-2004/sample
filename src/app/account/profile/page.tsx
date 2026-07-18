import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyAccount } from "@/lib/account";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SecurityPanel } from "@/components/account/SecurityPanel";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const account = await getMyAccount();
  if (!account) redirect("/login?next=/account/profile");

  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <Link href="/account" className="text-sm text-brand hover:underline">
        ← Your account
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-extrabold">Login &amp; security</h1>

      <div className="mt-6 max-w-2xl">
        <ProfileForm account={account} />
        <SecurityPanel hasPassword={account.hasPassword} email={account.email} phone={account.phone} />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyAccount } from "@/lib/account";
import { NotificationToggles } from "@/components/account/NotificationToggles";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const account = await getMyAccount();
  if (!account) redirect("/login?next=/account/notifications");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/account" className="text-sm text-brand hover:underline">
        ← Your account
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-extrabold">Notifications</h1>
      <p className="mt-1 text-sm text-muted">Choose how you want order updates.</p>
      <div className="mt-6">
        <NotificationToggles
          initial={{
            whatsapp: account.notificationPrefs?.whatsapp ?? true,
            email: account.notificationPrefs?.email ?? true,
          }}
        />
      </div>
    </div>
  );
}

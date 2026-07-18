import { getAdminSession } from "@/lib/adminAuth";
import { PasswordChangeForm } from "@/components/admin/PasswordChangeForm";

export const dynamic = "force-dynamic";

export default async function AdminAccount() {
  const session = await getAdminSession();
  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-extrabold">My account</h1>
      <p className="mb-4 text-sm text-muted">
        {session?.name} · role: {session?.role}
      </p>
      <PasswordChangeForm />
    </div>
  );
}

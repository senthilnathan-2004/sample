import { UsersAdmin } from "@/components/admin/UsersAdmin";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-extrabold">Admin users</h1>
      <p className="mb-4 text-sm text-muted">Owner-only. Roles: owner ⊇ manager ⊇ staff.</p>
      <UsersAdmin />
    </div>
  );
}

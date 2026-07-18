import { getAdminSession } from "@/lib/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

// If there's no admin session we're on /admin/login (middleware guards the rest),
// so render the page bare. Otherwise wrap in the role-aware admin shell.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) return <>{children}</>;
  return (
    <AdminShell role={session.role} name={session.name}>
      {children}
    </AdminShell>
  );
}

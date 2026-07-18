"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type Row = { id: string; name: string; email: string; role: string; isActive: boolean };

export function UsersAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [f, setF] = useState({ name: "", email: "", password: "", role: "staff" });
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setRows((await res.json()).users);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    setError("");
    setOk("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, isActive: true }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Could not create.");
    setOk("Admin created ✓");
    setF({ name: "", email: "", password: "", role: "staff" });
    load();
  }

  return (
    <div>
      <div className="rounded-card border border-hairline bg-white p-4 shadow-card">
        <p className="mb-2 font-heading font-bold">Create admin user</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs">Name<Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-9 w-40" /></label>
          <label className="text-xs">Email<Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="h-9 w-52" /></label>
          <label className="text-xs">Password<Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className="h-9 w-40" /></label>
          <label className="text-xs">Role
            <Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className="h-9">
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </Select>
          </label>
          <Button variant="primary" onClick={add}>Create</Button>
        </div>
        {error && <p className="mt-2 text-sm text-warning">{error}</p>}
        {ok && <p className="mt-2 text-sm text-success">{ok}</p>}
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-hairline bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-muted">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-hairline last:border-0">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-muted">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">{u.isActive ? "Active" : "Disabled"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

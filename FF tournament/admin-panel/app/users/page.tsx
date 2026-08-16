"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAdmin from "@/components/RequireAdmin";
import { Card, Button, Input, Alert } from "@/components/ui";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  walletBalance: number;
  isBanned: boolean;
}

function UsersContent() {
  const { token, user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    const q = search ? `?search=${encodeURIComponent(search)}&limit=50` : "?limit=50";
    apiFetch<{ data: User[] }>(`/admin/users${q}`, { token })
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.message));
  }, [token, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleBan(u: User) {
    setError(null);
    setMessage(null);
    try {
      await apiFetch(`/admin/users/${u._id}/${u.isBanned ? "unban" : "ban"}`, { method: "POST", token });
      setMessage(u.isBanned ? "User unbanned" : "User banned");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ban status");
    }
  }

  async function toggleRole(u: User) {
    if (u._id === me?.id) {
      setError("You cannot change your own role");
      return;
    }
    const nextRole = u.role === "admin" ? "user" : "admin";
    if (!window.confirm(`Change ${u.name}'s role to ${nextRole}?`)) return;
    setError(null);
    setMessage(null);
    try {
      await apiFetch(`/admin/users/${u._id}/role`, { method: "PUT", token, body: { role: nextRole } });
      setMessage("Role updated");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-heading mb-4 text-2xl font-bold">Users</h1>

      <div className="mb-4 max-w-xs">
        <Input placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card className="mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Wallet</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2">{u.name}</td>
                <td className="py-2">{u.email}</td>
                <td className="py-2 capitalize">{u.role}</td>
                <td className="py-2">৳{u.walletBalance}</td>
                <td className="py-2">{u.isBanned ? "Banned" : "Active"}</td>
                <td className="py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => toggleRole(u)} className="px-3 py-1 text-xs">
                      Make {u.role === "admin" ? "User" : "Admin"}
                    </Button>
                    <Button
                      variant={u.isBanned ? "primary" : "danger"}
                      onClick={() => toggleBan(u)}
                      className="px-3 py-1 text-xs"
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default function UsersPage() {
  return (
    <RequireAdmin>
      <UsersContent />
    </RequireAdmin>
  );
}

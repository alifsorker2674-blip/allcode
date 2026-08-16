"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAdmin from "@/components/RequireAdmin";
import { Card, Button, StatusPill, Alert } from "@/components/ui";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  method: string;
  referenceId?: string;
  status: string;
  createdAt: string;
  userId: { _id: string; name: string; email: string } | string;
}

function TransactionsContent() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    apiFetch<{ data: Transaction[] }>("/admin/transactions?limit=50", { token })
      .then((res) => setTransactions(res.data))
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(id: string) {
    setError(null);
    setMessage(null);
    try {
      await apiFetch(`/admin/transactions/${id}/approve`, { method: "POST", token });
      setMessage("Transaction approved");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    }
  }

  async function reject(id: string) {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    setError(null);
    setMessage(null);
    try {
      await apiFetch(`/admin/transactions/${id}/reject`, { method: "POST", token, body: { reason } });
      setMessage("Transaction rejected");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-heading mb-6 text-2xl font-bold">Pending Transactions</h1>
      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card className="mt-4">
        {transactions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No pending transactions.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                <th className="py-2">User</th>
                <th className="py-2">Type</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Method / Ref</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2">{typeof t.userId === "string" ? t.userId : `${t.userId.name} (${t.userId.email})`}</td>
                  <td className="py-2 capitalize">{t.type.replace(/([A-Z])/g, " $1")}</td>
                  <td className="py-2">৳{t.amount}</td>
                  <td className="py-2">
                    {t.method}
                    {t.referenceId ? ` · ${t.referenceId}` : ""}
                  </td>
                  <td className="py-2">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => approve(t._id)} className="px-3 py-1 text-xs">
                        Approve
                      </Button>
                      <Button variant="danger" onClick={() => reject(t._id)} className="px-3 py-1 text-xs">
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <RequireAdmin>
      <TransactionsContent />
    </RequireAdmin>
  );
}

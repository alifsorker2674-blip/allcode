"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { Card, StatusPill } from "@/components/ui";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface DashboardData {
  walletBalance: number;
  recentTransactions: Transaction[];
  tournamentsCreated: number;
  tournamentsJoined: number;
}

function DashboardContent() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: DashboardData }>("/dashboard", { token })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <div className="mx-auto max-w-4xl px-4 py-10 text-[var(--color-error)]">{error}</div>;
  if (!data) return <div className="mx-auto max-w-4xl px-4 py-10 text-[var(--color-text-muted)]">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Wallet Balance</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">৳{data.walletBalance}</p>
          <Link href="/wallet" className="mt-2 inline-block text-sm text-[var(--color-primary)]">
            Manage wallet →
          </Link>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Tournaments Created</p>
          <p className="mt-1 text-2xl font-bold">{data.tournamentsCreated}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Tournaments Joined</p>
          <p className="mt-1 text-2xl font-bold">{data.tournamentsJoined}</p>
        </Card>
      </div>

      <h2 className="font-heading mt-8 mb-3 text-lg font-semibold">Recent Transactions</h2>
      <Card>
        {data.recentTransactions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {data.recentTransactions.map((t) => (
                <tr key={t._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 capitalize">{t.type.replace(/([A-Z])/g, " $1")}</td>
                  <td className="py-2">৳{t.amount}</td>
                  <td className="py-2">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="py-2 text-right text-[var(--color-text-muted)]">
                    {new Date(t.createdAt).toLocaleDateString()}
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

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { Card, Button, Input, Label, Alert, StatusPill } from "@/components/ui";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

function WalletContent() {
  const { token, refreshUser, user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<"bKash" | "Nagad">("bKash");
  const [referenceId, setReferenceId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"bKash" | "Nagad">("bKash");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    const res = await apiFetch<{ data: Transaction[] }>("/wallet/transactions?limit=20", { token });
    setTransactions(res.data);
  }, [token]);

  useEffect(() => {
    refreshUser();
    loadTransactions().catch((err) => setError(err.message));
  }, [loadTransactions]);

  async function handleDeposit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/wallet/deposit", {
        method: "POST",
        token,
        body: { amount: Number(depositAmount), method: depositMethod, referenceId },
      });
      setMessage("Deposit request submitted — awaiting admin approval.");
      setDepositAmount("");
      setReferenceId("");
      loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    }
  }

  async function handleWithdraw(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/wallet/withdraw", {
        method: "POST",
        token,
        body: { amount: Number(withdrawAmount), method: withdrawMethod },
      });
      setMessage("Withdrawal request submitted — awaiting admin approval.");
      setWithdrawAmount("");
      loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading mb-2 text-2xl font-bold">Wallet</h1>
      <p className="mb-6 text-3xl font-bold text-[var(--color-primary)]">৳{user?.walletBalance ?? 0}</p>

      {error && <Alert>{error}</Alert>}
      {message && (
        <Alert variant="success">{message}</Alert>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="font-heading mb-3 font-semibold">Deposit</h2>
          <form onSubmit={handleDeposit} className="flex flex-col gap-3">
            <div>
              <Label>Amount (৳)</Label>
              <Input
                type="number"
                min={1}
                required
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Method</Label>
              <select
                value={depositMethod}
                onChange={(e) => setDepositMethod(e.target.value as "bKash" | "Nagad")}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
              </select>
            </div>
            <div>
              <Label>Transaction ID</Label>
              <Input required value={referenceId} onChange={(e) => setReferenceId(e.target.value)} />
            </div>
            <Button type="submit">Submit Deposit</Button>
          </form>
        </Card>

        <Card>
          <h2 className="font-heading mb-3 font-semibold">Withdraw</h2>
          <form onSubmit={handleWithdraw} className="flex flex-col gap-3">
            <div>
              <Label>Amount (৳)</Label>
              <Input
                type="number"
                min={1}
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Method</Label>
              <select
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value as "bKash" | "Nagad")}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
              </select>
            </div>
            <Button type="submit" variant="outline">
              Request Withdrawal
            </Button>
          </form>
        </Card>
      </div>

      <h2 className="font-heading mt-8 mb-3 text-lg font-semibold">Transaction History</h2>
      <Card>
        {transactions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 capitalize">{t.type.replace(/([A-Z])/g, " $1")}</td>
                  <td className="py-2">৳{t.amount}</td>
                  <td className="py-2">{t.method}</td>
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

export default function WalletPage() {
  return (
    <RequireAuth>
      <WalletContent />
    </RequireAuth>
  );
}

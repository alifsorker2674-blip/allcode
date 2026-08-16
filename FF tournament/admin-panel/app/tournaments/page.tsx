"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAdmin from "@/components/RequireAdmin";
import { Card, Button, StatusPill, Alert } from "@/components/ui";

interface Tournament {
  _id: string;
  title: string;
  game: string;
  mode: string;
  entryFee: number;
  slots: number;
  prizePool: number;
  createFeeCharged: number;
  status: string;
  createdBy: { _id: string; name: string; email: string } | string;
}

const STATUS_FILTERS = ["pending", "approved", "rejected", "live", "completed", "cancelled", ""] as const;

function TournamentsContent() {
  const { token } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [status, setStatus] = useState<string>("pending");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    const q = status ? `?status=${status}&limit=50` : "?limit=50";
    apiFetch<{ data: Tournament[] }>(`/admin/tournaments${q}`, { token })
      .then((res) => setTournaments(res.data))
      .catch((err) => setError(err.message));
  }, [token, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(id: string) {
    setError(null);
    setMessage(null);
    try {
      await apiFetch(`/admin/tournaments/${id}/approve`, { method: "POST", token });
      setMessage("Tournament approved and published");
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
      await apiFetch(`/admin/tournaments/${id}/reject`, { method: "POST", token, body: { reason } });
      setMessage("Tournament rejected — create fee refunded");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Tournaments</h1>
        <a
          href="/tournaments/create"
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[#171717]"
        >
          + Create Official Tournament
        </a>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === s
                ? "bg-[var(--color-primary)] text-[#171717]"
                : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card className="mt-4">
        {tournaments.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No tournaments found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                <th className="py-2">Title</th>
                <th className="py-2">Organizer</th>
                <th className="py-2">Game / Mode</th>
                <th className="py-2">Fee / Prize</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr key={t._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2">{t.title}</td>
                  <td className="py-2">{typeof t.createdBy === "string" ? t.createdBy : t.createdBy.name}</td>
                  <td className="py-2">
                    {t.game} / {t.mode}
                  </td>
                  <td className="py-2">
                    ৳{t.entryFee} / ৳{t.prizePool}
                  </td>
                  <td className="py-2">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="py-2 text-right">
                    {t.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => approve(t._id)} className="px-3 py-1 text-xs">
                          Approve
                        </Button>
                        <Button variant="danger" onClick={() => reject(t._id)} className="px-3 py-1 text-xs">
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">—</span>
                    )}
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

export default function TournamentsPage() {
  return (
    <RequireAdmin>
      <TournamentsContent />
    </RequireAdmin>
  );
}

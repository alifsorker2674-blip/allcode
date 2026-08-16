"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAdmin from "@/components/RequireAdmin";
import { Card, Button, Input, Label, Alert, StatusPill } from "@/components/ui";

interface PlayerRef {
  _id: string;
  name: string;
  email: string;
}

interface QuickMatch {
  _id: string;
  game: string;
  players: PlayerRef[];
  entryFee: number;
  prizeAmount: number;
  platformFee: number;
  roomId: string;
  status: string;
  winnerId?: string;
  paidOut: boolean;
  submissions: { userId: string; screenshotUrl: string; selectedWinner: string }[];
  createdAt: string;
}

interface QueueStats {
  waiting: { game: string; entryFee: number; count: number }[];
  activeMatches: number;
}

const STATUSES = ["", "active", "awaiting_results", "under_review", "confirmed", "resolved"] as const;

function QuickMatchesContent() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<QuickMatch[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resolveInputs, setResolveInputs] = useState<Record<string, { winnerId: string; resolution: string }>>({});

  const load = useCallback(async () => {
    try {
      const q = status ? `?status=${status}&limit=50` : "?limit=50";
      const [matchesRes, statsRes] = await Promise.all([
        apiFetch<{ data: QuickMatch[] }>(`/admin/quick-matches${q}`, { token }),
        apiFetch<{ data: QueueStats }>("/admin/quick-matches/queue-stats", { token }),
      ]);
      setMatches(matchesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Quick Matches");
    }
  }, [token, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(match: QuickMatch) {
    const input = resolveInputs[match._id];
    if (!input?.winnerId || !input?.resolution) {
      setError("Pick a winner and write a resolution note");
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await apiFetch(`/admin/quick-matches/${match._id}/resolve`, {
        method: "POST",
        token,
        body: { winnerId: input.winnerId, resolution: input.resolution },
      });
      setMessage("Quick Match resolved and prize paid out");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-heading mb-4 text-2xl font-bold">Quick Matches</h1>

      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-sm text-[var(--color-text-muted)]">Active Matches</p>
            <p className="mt-1 text-2xl font-bold">{stats.activeMatches}</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--color-text-muted)]">Waiting in Queue</p>
            {stats.waiting.length === 0 ? (
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Nobody waiting</p>
            ) : (
              <ul className="mt-1 text-sm">
                {stats.waiting.map((w) => (
                  <li key={`${w.game}-${w.entryFee}`}>
                    {w.game === "freefire" ? "Free Fire" : "Blood Strike"} · ৳{w.entryFee} —{" "}
                    <span className="text-[var(--color-primary)]">{w.count} waiting</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === s
                ? "bg-[var(--color-primary)] text-[#171717]"
                : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
          >
            {s ? s.replace(/_/g, " ") : "All"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {matches.length === 0 && (
          <Card>
            <p className="text-sm text-[var(--color-text-muted)]">No Quick Matches found.</p>
          </Card>
        )}
        {matches.map((m) => (
          <Card key={m._id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-heading font-semibold">
                {m.players.map((p) => p.name).join(" vs ")} · ৳{m.entryFee}
              </h3>
              <StatusPill status={m.status} />
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {m.game === "freefire" ? "Free Fire" : "Blood Strike"} · Room {m.roomId} · Prize ৳{m.prizeAmount} ·
              Platform ৳{m.platformFee} · {m.paidOut ? "Paid out" : "Not paid"}
            </p>

            {m.submissions.length > 0 && (
              <div className="mt-3 text-sm">
                {m.submissions.map((s, i) => {
                  const submitter = m.players.find((p) => p._id === s.userId);
                  const claimed = m.players.find((p) => p._id === s.selectedWinner);
                  return (
                    <div key={i} className="border-b border-[var(--color-border)] py-1 last:border-0">
                      {submitter?.name ?? s.userId} says <strong>{claimed?.name ?? s.selectedWinner}</strong> won —{" "}
                      <a href={s.screenshotUrl} target="_blank" rel="noreferrer" className="text-[var(--color-primary)]">
                        screenshot
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {m.status === "under_review" && (
              <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
                <Label>Winner</Label>
                <select
                  value={resolveInputs[m._id]?.winnerId || ""}
                  onChange={(e) =>
                    setResolveInputs((prev) => ({
                      ...prev,
                      [m._id]: { winnerId: e.target.value, resolution: prev[m._id]?.resolution || "" },
                    }))
                  }
                  className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm"
                >
                  <option value="">Select the winner...</option>
                  {m.players.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Label>Resolution Note</Label>
                <Input
                  value={resolveInputs[m._id]?.resolution || ""}
                  onChange={(e) =>
                    setResolveInputs((prev) => ({
                      ...prev,
                      [m._id]: { winnerId: prev[m._id]?.winnerId || "", resolution: e.target.value },
                    }))
                  }
                />
                <Button onClick={() => resolve(m)} className="self-start">
                  Resolve &amp; Pay Winner
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function QuickMatchesPage() {
  return (
    <RequireAdmin>
      <QuickMatchesContent />
    </RequireAdmin>
  );
}

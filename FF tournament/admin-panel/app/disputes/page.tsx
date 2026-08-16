"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAdmin from "@/components/RequireAdmin";
import { Card, Button, Input, Label, Alert, StatusPill } from "@/components/ui";

interface Submission {
  userId: string;
  screenshotUrl: string;
  selectedWinner: string;
}

interface MatchRef {
  _id: string;
  round: string;
  status: string;
  submissions: Submission[];
  tournamentId: { _id: string; title: string; game: string } | string;
}

interface Dispute {
  _id: string;
  matchId: MatchRef;
  reason: string;
  status: string;
  createdAt: string;
}

function DisputesContent() {
  const { token } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resolveInputs, setResolveInputs] = useState<Record<string, { winner: string; resolution: string }>>({});

  const [payoutMatchId, setPayoutMatchId] = useState("");
  const [payoutUserId, setPayoutUserId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");

  const load = useCallback(() => {
    apiFetch<{ data: Dispute[] }>("/admin/disputes?limit=50", { token })
      .then((res) => setDisputes(res.data))
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(disputeId: string) {
    const input = resolveInputs[disputeId];
    if (!input?.winner || !input?.resolution) {
      setError("Winner user id and a resolution note are both required");
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await apiFetch(`/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        token,
        body: { finalWinner: input.winner, resolution: input.resolution },
      });
      setMessage("Dispute resolved");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve dispute");
    }
  }

  async function payout() {
    setError(null);
    setMessage(null);
    try {
      await apiFetch(`/admin/matches/${payoutMatchId}/payout`, {
        method: "POST",
        token,
        body: { userId: payoutUserId, amount: Number(payoutAmount) },
      });
      setMessage("Prize paid out");
      setPayoutMatchId("");
      setPayoutUserId("");
      setPayoutAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pay out prize");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading mb-6 text-2xl font-bold">Disputes</h1>
      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <div className="flex flex-col gap-4">
        {disputes.length === 0 && (
          <Card>
            <p className="text-sm text-[var(--color-text-muted)]">No open disputes.</p>
          </Card>
        )}
        {disputes.map((d) => (
          <Card key={d._id}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold">
                {typeof d.matchId.tournamentId === "string" ? "Match" : d.matchId.tournamentId.title} — {d.matchId.round}
              </h3>
              <StatusPill status={d.matchId.status} />
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{d.reason}</p>

            <div className="mt-3 text-sm">
              {d.matchId.submissions.map((s, i) => (
                <div key={i} className="border-b border-[var(--color-border)] py-1 last:border-0">
                  User <span className="font-mono">{s.userId}</span> claims winner is{" "}
                  <span className="font-mono">{s.selectedWinner}</span> —{" "}
                  <a href={s.screenshotUrl} target="_blank" rel="noreferrer" className="text-[var(--color-primary)]">
                    screenshot
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
              <Label>Final Winner (User ID)</Label>
              <Input
                value={resolveInputs[d._id]?.winner || ""}
                onChange={(e) =>
                  setResolveInputs((prev) => ({
                    ...prev,
                    [d._id]: { winner: e.target.value, resolution: prev[d._id]?.resolution || "" },
                  }))
                }
              />
              <Label>Resolution Note</Label>
              <Input
                value={resolveInputs[d._id]?.resolution || ""}
                onChange={(e) =>
                  setResolveInputs((prev) => ({
                    ...prev,
                    [d._id]: { winner: prev[d._id]?.winner || "", resolution: e.target.value },
                  }))
                }
              />
              <Button onClick={() => resolve(d._id)} className="self-start">
                Resolve Dispute
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="font-heading mt-8 mb-3 text-lg font-semibold">Pay Out Prize</h2>
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label>Match ID</Label>
            <Input value={payoutMatchId} onChange={(e) => setPayoutMatchId(e.target.value)} />
          </div>
          <div>
            <Label>Winner User ID</Label>
            <Input value={payoutUserId} onChange={(e) => setPayoutUserId(e.target.value)} />
          </div>
          <div>
            <Label>Amount (৳)</Label>
            <Input type="number" min={1} value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} />
          </div>
        </div>
        <Button onClick={payout} className="mt-3">
          Pay Out
        </Button>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Match must be auto_confirmed or admin_resolved. Amount is set manually per the tournament&apos;s prize distribution.
        </p>
      </Card>
    </div>
  );
}

export default function DisputesPage() {
  return (
    <RequireAdmin>
      <DisputesContent />
    </RequireAdmin>
  );
}

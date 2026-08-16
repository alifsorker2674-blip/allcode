"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { Card, Button, Input, Label, Alert, StatusPill } from "@/components/ui";

interface Submission {
  userId: string;
  screenshotUrl: string;
  selectedWinner: string;
  submittedAt: string;
}

interface Match {
  _id: string;
  round: string;
  status: string;
  submissions: Submission[];
  finalWinner?: string;
}

function MatchesContent({ tournamentId }: { tournamentId: string }) {
  const { token } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [round, setRound] = useState("Final");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submissionInputs, setSubmissionInputs] = useState<Record<string, { url: string; winner: string }>>({});

  const load = useCallback(() => {
    apiFetch<{ data: Match[] }>(`/tournaments/${tournamentId}/matches`, { token })
      .then((res) => setMatches(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load matches"));
  }, [tournamentId, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreateMatch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch(`/tournaments/${tournamentId}/matches`, { method: "POST", token, body: { round } });
      setMessage("Match created");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create match");
    }
  }

  async function handleSubmitResult(matchId: string) {
    setError(null);
    setMessage(null);
    const input = submissionInputs[matchId];
    if (!input?.url || !input?.winner) {
      setError("Screenshot URL and winner user id are both required");
      return;
    }
    try {
      const res = await apiFetch<{ message: string }>(`/matches/${matchId}/submit-result`, {
        method: "POST",
        token,
        body: { screenshotUrl: input.url, selectedWinner: input.winner },
      });
      setMessage(res.message || "Submitted");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit result");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading mb-6 text-2xl font-bold">Matches</h1>

      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card className="mb-6">
        <h2 className="font-heading mb-3 font-semibold">Create Match</h2>
        <form onSubmit={handleCreateMatch} className="flex items-end gap-3">
          <div className="flex-1">
            <Label>Round</Label>
            <Input value={round} onChange={(e) => setRound(e.target.value)} />
          </div>
          <Button type="submit">Create</Button>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {matches.map((m) => (
          <Card key={m._id}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold">{m.round}</h3>
              <StatusPill status={m.status} />
            </div>

            {m.finalWinner && (
              <p className="mt-2 text-sm text-[var(--color-success)]">Winner: {m.finalWinner}</p>
            )}

            <div className="mt-3 text-sm text-[var(--color-text-muted)]">
              {m.submissions.length} submission(s) so far
              {m.submissions.map((s, i) => (
                <div key={i} className="mt-1">
                  • User {s.userId} says winner is {s.selectedWinner}
                </div>
              ))}
            </div>

            {m.status !== "auto_confirmed" && m.status !== "admin_resolved" && (
              <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
                <Label>Submit Result — Screenshot URL</Label>
                <Input
                  placeholder="https://..."
                  value={submissionInputs[m._id]?.url || ""}
                  onChange={(e) =>
                    setSubmissionInputs((prev) => ({
                      ...prev,
                      [m._id]: { url: e.target.value, winner: prev[m._id]?.winner || "" },
                    }))
                  }
                />
                <Label>Winner&apos;s User ID</Label>
                <Input
                  placeholder="user id"
                  value={submissionInputs[m._id]?.winner || ""}
                  onChange={(e) =>
                    setSubmissionInputs((prev) => ({
                      ...prev,
                      [m._id]: { url: prev[m._id]?.url || "", winner: e.target.value },
                    }))
                  }
                />
                <Button variant="outline" onClick={() => handleSubmitResult(m._id)}>
                  Submit Result
                </Button>
              </div>
            )}
          </Card>
        ))}
        {matches.length === 0 && <p className="text-[var(--color-text-muted)]">No matches created yet.</p>}
      </div>
    </div>
  );
}

export default function MatchesClient({ tournamentId }: { tournamentId: string }) {
  return (
    <RequireAuth>
      <MatchesContent tournamentId={tournamentId} />
    </RequireAuth>
  );
}

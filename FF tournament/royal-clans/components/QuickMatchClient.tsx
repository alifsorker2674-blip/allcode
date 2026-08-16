"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Card, Button, Input, Label, Alert, StatusPill } from "@/components/ui";

interface PlayerRef {
  _id: string;
  name: string;
  email: string;
}

interface QuickMatchData {
  _id: string;
  game: string;
  players: PlayerRef[];
  entryFee: number;
  prizeAmount: number;
  platformFee: number;
  roomId: string;
  roomPassword: string;
  status: string;
  submissions: { userId: string; selectedWinner: string }[];
  winnerId?: string;
}

type State = "idle" | "waiting" | "matched";

const POLL_MS = 3000;

export default function QuickMatchClient() {
  const { token, user, refreshUser } = useAuth();
  const [state, setState] = useState<State>("idle");
  const [match, setMatch] = useState<QuickMatchData | null>(null);
  const [entryFees, setEntryFees] = useState<number[]>([]);
  const [game, setGame] = useState<"freefire" | "bloodstrike">("freefire");
  const [entryFee, setEntryFee] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [selectedWinner, setSelectedWinner] = useState("");
  const [finishedMatch, setFinishedMatch] = useState<QuickMatchData | null>(null);
  const pollRef = useRef<(() => void) | null>(null);
  const activeMatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: { feeConfig: { quickMatchEntryFees: number[] } } }>("/fee-config").then((res) => {
      const fees = res.data.feeConfig.quickMatchEntryFees;
      setEntryFees(fees);
      setEntryFee((prev) => prev ?? fees[0] ?? null);
    });
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: { state: State; match?: QuickMatchData } }>("/quick-match/status", {
        token,
      });
      setState((prev) => {
        // Drop the stale "you're in the queue" notice once an opponent is actually found.
        if (prev === "waiting" && res.data.state === "matched") setMessage(null);
        return res.data.state;
      });
      setMatch(res.data.match ?? null);
      if (res.data.match) setSelectedWinner((w) => w || res.data.match!.players[0]._id);

      /*
       * A finalized match drops out of /status (it only reports active ones), so the page
       * would otherwise silently snap back to the search form and the player would never
       * learn they won. Re-fetch the match we were just in to show the outcome.
       */
      const finishedId = activeMatchIdRef.current;
      if (res.data.match) {
        activeMatchIdRef.current = res.data.match._id;
      } else if (finishedId) {
        activeMatchIdRef.current = null;
        try {
          const done = await apiFetch<{ data: { match: QuickMatchData } }>(`/quick-match/${finishedId}`, { token });
          setFinishedMatch(done.data.match);
          setMessage(null);
          refreshUser();
        } catch {
          // If we can't fetch it, just fall back to the normal idle view.
        }
      }
    } catch {
      // transient — next poll retries
    }
  }, [token, refreshUser]);

  // Keep the latest loadStatus in a ref so the interval below never needs re-creating.
  useEffect(() => {
    pollRef.current = loadStatus;
  }, [loadStatus]);

  /*
   * One interval for the whole mounted lifetime, deliberately NOT keyed on `state`.
   * An earlier version only polled while `state === "waiting"` and tore the interval
   * down on every state change, which could orphan it and leave an open page stuck.
   * Polling continuously also means the page live-updates when the opponent submits
   * their result (awaiting_results → confirmed) without a manual refresh.
   */
  useEffect(() => {
    pollRef.current?.();
    const id = setInterval(() => pollRef.current?.(), POLL_MS);
    return () => clearInterval(id);
  }, []);

  async function handleJoin() {
    if (entryFee === null) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch<{ data: { matched: boolean; match?: QuickMatchData }; message?: string }>(
        "/quick-match/queue",
        { method: "POST", token, body: { game, entryFee } }
      );
      setMessage(res.message ?? null);
      if (res.data.matched && res.data.match) {
        setState("matched");
        await loadStatus();
        refreshUser();
      } else {
        setState("waiting");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join the queue");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/quick-match/queue", { method: "DELETE", token });
      setState("idle");
      setMessage("Left the queue");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not leave the queue");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitResult() {
    if (!match) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch<{ message?: string }>(`/quick-match/${match._id}/submit-result`, {
        method: "POST",
        token,
        body: { screenshotUrl, selectedWinner },
      });
      setMessage(res.message ?? "Submitted");
      setScreenshotUrl("");
      await loadStatus();
      refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit result");
    } finally {
      setBusy(false);
    }
  }

  const alreadySubmitted = match?.submissions.some((s) => s.userId === user?.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-heading mb-2 text-2xl font-bold">Quick Match</h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">
        Get paired with an opponent instantly and play for cash — the room is created for you automatically.
      </p>

      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      {state === "idle" && finishedMatch && (
        <Card
          className={`mt-4 border-2 ${
            finishedMatch.winnerId === user?.id
              ? "border-[var(--color-success)]"
              : "border-[var(--color-border)]"
          }`}
        >
          <div className="py-4 text-center">
            {finishedMatch.winnerId === user?.id ? (
              <>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-success)]">You won! 🏆</h2>
                <p className="mt-1 text-lg text-[var(--color-primary)]">
                  ৳{finishedMatch.prizeAmount} added to your wallet
                </p>
              </>
            ) : (
              <>
                <h2 className="font-heading text-xl font-bold">Match over</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {finishedMatch.players.find((p) => p._id === finishedMatch.winnerId)?.name ?? "Your opponent"} won
                  this one — better luck next match.
                </p>
              </>
            )}
            <Button variant="outline" onClick={() => setFinishedMatch(null)} className="mt-4">
              Play Again
            </Button>
          </div>
        </Card>
      )}

      {state === "idle" && !finishedMatch && (
        <Card className="mt-4">
          <h2 className="font-heading mb-3 font-semibold">Find a Match</h2>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Game</Label>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value as "freefire" | "bloodstrike")}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm"
              >
                <option value="freefire">Free Fire</option>
                <option value="bloodstrike">Blood Strike</option>
              </select>
            </div>
            <div>
              <Label>Entry Fee</Label>
              <div className="flex flex-wrap gap-2">
                {entryFees.map((fee) => (
                  <button
                    key={fee}
                    onClick={() => setEntryFee(fee)}
                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                      entryFee === fee
                        ? "bg-[var(--color-primary)] text-[#171717]"
                        : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    ৳{fee}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleJoin} disabled={busy || entryFee === null} className="self-start">
              {busy ? "Searching..." : "Find Match"}
            </Button>
          </div>
        </Card>
      )}

      {state === "waiting" && (
        <Card className="mt-4 text-center">
          <div className="py-6">
            <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-[var(--color-primary)]/30" />
            <h2 className="font-heading text-lg font-semibold">Searching for an opponent...</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              You&apos;ll be matched with the next player on the same game and entry fee. Nothing is charged until
              a match is found.
            </p>
            <Button variant="outline" onClick={handleCancel} disabled={busy} className="mt-4">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {state === "matched" && match && (
        <>
          <Card className="mt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold">Match Found!</h2>
              <StatusPill status={match.status} />
            </div>

            <div className="mt-4 rounded-md border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 p-4">
              <p className="text-sm text-[var(--color-text-muted)]">Join this room in-game:</p>
              <p className="mt-2 font-mono text-lg text-[var(--color-primary)]">Room ID: {match.roomId}</p>
              <p className="font-mono text-lg text-[var(--color-primary)]">Password: {match.roomPassword}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-[var(--color-text-muted)]">Entry</p>
                <p className="font-medium">৳{match.entryFee}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Winner Gets</p>
                <p className="font-medium text-[var(--color-primary)]">৳{match.prizeAmount}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Opponent</p>
                <p className="font-medium">{match.players.find((p) => p._id !== user?.id)?.name ?? "—"}</p>
              </div>
            </div>
          </Card>

          {match.status !== "confirmed" && match.status !== "resolved" && (
            <Card className="mt-4">
              <h2 className="font-heading mb-3 font-semibold">Submit Result</h2>
              {alreadySubmitted ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  You&apos;ve submitted your result — waiting for your opponent to confirm.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div>
                    <Label>Screenshot URL</Label>
                    <Input
                      placeholder="https://..."
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Who won?</Label>
                    <select
                      value={selectedWinner}
                      onChange={(e) => setSelectedWinner(e.target.value)}
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm"
                    >
                      {match.players.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p._id === user?.id ? `${p.name} (you)` : p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleSubmitResult} disabled={busy || !screenshotUrl} className="self-start">
                    Submit Result
                  </Button>
                </div>
              )}
              {match.status === "under_review" && (
                <p className="mt-3 text-sm text-[var(--color-warning)]">
                  You and your opponent disagreed — an admin is reviewing the screenshots.
                </p>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import { Card, Button, StatusPill, Alert } from "@/components/ui";

interface Tournament {
  _id: string;
  title: string;
  game: string;
  mode: string;
  entryFee: number;
  slots: number;
  prizePool: number;
  prizeDistribution?: string;
  rules?: string;
  status: string;
  createdBy: string;
  isOfficial?: boolean;
  /** Only present in the API response when you're registered / the organizer / an admin. */
  roomId?: string;
  roomPassword?: string;
}

export default function TournamentDetailClient({ id }: { id: string }) {
  const { token, user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // Send the token so the API includes room credentials when we're entitled to them.
  const load = useCallback(() => {
    apiFetch<{ data: { tournament: Tournament } }>(`/tournaments/${id}`, { token })
      .then((res) => setTournament(res.data.tournament))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tournament"));
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleJoin() {
    setError(null);
    setMessage(null);
    setJoining(true);
    try {
      await apiFetch(`/tournaments/${id}/join`, { method: "POST", token });
      setMessage("Joined tournament successfully!");
      load(); // re-fetch so the room credentials we're now entitled to appear
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to join");
    } finally {
      setJoining(false);
    }
  }

  if (error && !tournament) return <div className="mx-auto max-w-2xl px-4 py-10 text-[var(--color-error)]">{error}</div>;
  if (!tournament) return <div className="mx-auto max-w-2xl px-4 py-10 text-[var(--color-text-muted)]">Loading...</div>;

  const isOrganizer = user?.id === tournament.createdBy;
  const canJoin = user && tournament.status === "approved" && !isOrganizer;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-bold">{tournament.title}</h1>
          {tournament.isOfficial && (
            <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-medium text-[#171717]">
              Official
            </span>
          )}
        </div>
        <StatusPill status={tournament.status} />
      </div>

      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-muted)]">Game</p>
            <p className="font-medium">{tournament.game === "freefire" ? "Free Fire" : "Blood Strike"}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)]">Mode</p>
            <p className="font-medium capitalize">{tournament.mode}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)]">Entry Fee</p>
            <p className="font-medium text-[var(--color-primary)]">৳{tournament.entryFee}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)]">Prize Pool</p>
            <p className="font-medium text-[var(--color-primary)]">৳{tournament.prizePool}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)]">Slots</p>
            <p className="font-medium">{tournament.slots}</p>
          </div>
        </div>

        {tournament.roomId && (
          <div className="mt-4 rounded-md border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 p-4">
            <p className="text-sm text-[var(--color-text-muted)]">Your room details (visible because you joined):</p>
            <p className="mt-2 font-mono text-lg text-[var(--color-primary)]">Room ID: {tournament.roomId}</p>
            <p className="font-mono text-lg text-[var(--color-primary)]">Password: {tournament.roomPassword}</p>
          </div>
        )}

        {tournament.prizeDistribution && (
          <div className="mt-4">
            <p className="text-[var(--color-text-muted)] text-sm">Prize Distribution</p>
            <p className="text-sm">{tournament.prizeDistribution}</p>
          </div>
        )}
        {tournament.rules && (
          <div className="mt-4">
            <p className="text-[var(--color-text-muted)] text-sm">Rules</p>
            <p className="text-sm">{tournament.rules}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {canJoin && (
            <Button onClick={handleJoin} disabled={joining}>
              {joining ? "Joining..." : "Join Tournament"}
            </Button>
          )}
          {!user && <p className="text-sm text-[var(--color-text-muted)]">Log in to join this tournament.</p>}
          {(isOrganizer || user?.role === "admin") && (
            <Link href={`/tournaments/${id}/matches`}>
              <Button variant="outline">Manage Matches</Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}

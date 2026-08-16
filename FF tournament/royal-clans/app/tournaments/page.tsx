"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Card, StatusPill } from "@/components/ui";

interface Tournament {
  _id: string;
  title: string;
  game: string;
  mode: string;
  entryFee: number;
  slots: number;
  prizePool: number;
  status: string;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [game, setGame] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (game) params.set("game", game);
    if (mode) params.set("mode", mode);
    apiFetch<{ data: Tournament[] }>(`/tournaments?${params.toString()}`)
      .then((res) => setTournaments(res.data))
      .finally(() => setLoading(false));
  }, [game, mode]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Tournament Marketplace</h1>
        <Link
          href="/tournaments/create"
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[#171717]"
        >
          + Create Tournament
        </Link>
      </div>

      <div className="mb-6 flex gap-3">
        <select
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm"
        >
          <option value="">All Games</option>
          <option value="freefire">Free Fire</option>
          <option value="bloodstrike">Blood Strike</option>
        </select>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm"
        >
          <option value="">All Modes</option>
          <option value="solo">Solo</option>
          <option value="duo">Duo</option>
          <option value="squad">Squad</option>
        </select>
      </div>

      {loading ? (
        <p className="text-[var(--color-text-muted)]">Loading...</p>
      ) : tournaments.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">No tournaments found. Be the first to create one!</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tournaments.map((t) => (
            <Link key={t._id} href={`/tournaments/${t._id}`}>
              <Card className="transition hover:border-[var(--color-primary)]">
                <div className="flex items-start justify-between">
                  <h3 className="font-heading font-semibold">{t.title}</h3>
                  <StatusPill status={t.status} />
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {t.game === "freefire" ? "Free Fire" : "Blood Strike"} · {t.mode} · {t.slots} slots
                </p>
                <div className="mt-3 flex justify-between text-sm">
                  <span>
                    Entry: <span className="text-[var(--color-primary)]">৳{t.entryFee}</span>
                  </span>
                  <span>
                    Prize: <span className="text-[var(--color-primary)]">৳{t.prizePool}</span>
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

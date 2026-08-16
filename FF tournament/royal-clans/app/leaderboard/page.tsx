"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui";

interface LeaderboardRow {
  user: { _id: string; name: string };
  game: string;
  points: number;
  tier?: string;
  wins: number;
  losses?: number;
}

const PERIODS = [
  { key: "all", label: "All Time" },
  { key: "monthly", label: "Monthly" },
  { key: "weekly", label: "Weekly" },
] as const;

const GAMES = [
  { key: "", label: "All Games" },
  { key: "freefire", label: "Free Fire" },
  { key: "bloodstrike", label: "Blood Strike" },
] as const;

const TIER_COLORS: Record<string, string> = {
  Bronze: "text-[#CD7F32]",
  Silver: "text-[#C0C0C0]",
  Gold: "text-[#FFD700]",
  Platinum: "text-[#E5E4E2]",
  Diamond: "text-[#B9F2FF]",
  Heroic: "text-[var(--color-secondary)]",
  Grandmaster: "text-[var(--color-primary)]",
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [period, setPeriod] = useState<string>("all");
  const [game, setGame] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ period, limit: "50" });
    if (game) params.set("game", game);
    apiFetch<{ data: LeaderboardRow[] }>(`/leaderboard?${params.toString()}`)
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false));
  }, [period, game]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading mb-4 text-2xl font-bold">Leaderboard</h1>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                period === p.key
                  ? "bg-[var(--color-primary)] text-[#171717]"
                  : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {GAMES.map((g) => (
            <button
              key={g.key || "all"}
              onClick={() => setGame(g.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                game === g.key
                  ? "bg-[var(--color-secondary)] text-white"
                  : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? (
          <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            No ranked players yet — win a tournament match or Quick Match to get on the board.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                <th className="py-2 w-12">#</th>
                <th className="py-2">Player</th>
                <th className="py-2">Game</th>
                {period === "all" && <th className="py-2">Tier</th>}
                <th className="py-2 text-right">Wins</th>
                <th className="py-2 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.user._id}-${r.game}`} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 font-heading font-bold text-[var(--color-text-muted)]">{i + 1}</td>
                  <td className="py-2">{r.user.name}</td>
                  <td className="py-2 text-[var(--color-text-muted)]">
                    {r.game === "freefire" ? "Free Fire" : "Blood Strike"}
                  </td>
                  {period === "all" && (
                    <td className={`py-2 font-medium ${TIER_COLORS[r.tier || "Bronze"]}`}>{r.tier}</td>
                  )}
                  <td className="py-2 text-right">{r.wins}</td>
                  <td className="py-2 text-right font-bold text-[var(--color-primary)]">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { Card, Button, Input, Label, Alert } from "@/components/ui";

interface FeeTier {
  slots: number;
  fee: number;
}

function CreateTournamentContent() {
  const { token } = useAuth();
  const router = useRouter();
  const [feeTable, setFeeTable] = useState<FeeTier[]>([]);
  const [title, setTitle] = useState("");
  const [game, setGame] = useState<"freefire" | "bloodstrike">("freefire");
  const [mode, setMode] = useState<"solo" | "duo" | "squad">("solo");
  const [entryFee, setEntryFee] = useState("50");
  const [slots, setSlots] = useState("10");
  const [prizePool, setPrizePool] = useState("");
  const [prizeDistribution, setPrizeDistribution] = useState("");
  const [rules, setRules] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ data: { feeConfig: { tournamentCreateFeeTable: FeeTier[] } } }>("/fee-config").then((res) =>
      setFeeTable(res.data.feeConfig.tournamentCreateFeeTable)
    );
  }, []);

  const estimatedFee = useMemo(() => {
    const s = Number(slots);
    if (!s || feeTable.length === 0) return null;
    const sorted = [...feeTable].sort((a, b) => a.slots - b.slots);
    const tier = sorted.find((t) => s <= t.slots);
    return tier ? tier.fee : sorted[sorted.length - 1].fee;
  }, [slots, feeTable]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ data: { tournament: { _id: string } } }>("/tournaments", {
        method: "POST",
        token,
        body: {
          title,
          game,
          mode,
          entryFee: Number(entryFee),
          slots: Number(slots),
          prizePool: Number(prizePool),
          prizeDistribution: prizeDistribution || undefined,
          rules: rules || undefined,
          roomId,
          roomPassword,
        },
      });
      router.push(`/tournaments/${res.data.tournament._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tournament");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-heading mb-6 text-2xl font-bold">Create a Tournament</h1>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <Alert>{error}</Alert>}
          <div>
            <Label>Title</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <Label>Mode</Label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "solo" | "duo" | "squad")}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm"
              >
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Entry Fee (৳)</Label>
              <Input type="number" min={0} required value={entryFee} onChange={(e) => setEntryFee(e.target.value)} />
            </div>
            <div>
              <Label>Slots</Label>
              <Input type="number" min={2} required value={slots} onChange={(e) => setSlots(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Prize Pool (৳)</Label>
            <Input type="number" min={0} required value={prizePool} onChange={(e) => setPrizePool(e.target.value)} />
          </div>
          <div>
            <Label>Prize Distribution (optional)</Label>
            <Input
              placeholder="1st: 2500, 2nd: 1200, 3rd: 500"
              value={prizeDistribution}
              onChange={(e) => setPrizeDistribution(e.target.value)}
            />
          </div>
          <div>
            <Label>Rules (optional)</Label>
            <Input value={rules} onChange={(e) => setRules(e.target.value)} />
          </div>

          <div className="rounded-md border border-[var(--color-border)] p-3">
            <p className="mb-2 text-sm font-medium">In-Game Room</p>
            <p className="mb-3 text-xs text-[var(--color-text-muted)]">
              Only players who join this tournament will be able to see these — never shown publicly.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Room ID</Label>
                <Input required value={roomId} onChange={(e) => setRoomId(e.target.value)} />
              </div>
              <div>
                <Label>Room Password</Label>
                <Input required value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} />
              </div>
            </div>
          </div>

          {estimatedFee !== null && (
            <div className="rounded-md border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 px-3 py-2 text-sm">
              Hosting fee for {slots} slots: <span className="font-semibold text-[var(--color-primary)]">৳{estimatedFee}</span>{" "}
              (charged from your wallet immediately)
            </div>
          )}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function CreateTournamentPage() {
  return (
    <RequireAuth>
      <CreateTournamentContent />
    </RequireAuth>
  );
}

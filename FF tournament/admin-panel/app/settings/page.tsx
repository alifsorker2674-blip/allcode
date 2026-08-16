"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAdmin from "@/components/RequireAdmin";
import { Card, Button, Input, Label, Alert } from "@/components/ui";

interface FeeTier {
  slots: number;
  fee: number;
}

interface FeeConfig {
  tournamentCreateFeeTable: FeeTier[];
  tournamentEntryServiceFeePct: number;
  quickMatchServiceFeePct: number;
  withdrawalChargePct: number;
  roomCooldownMinutes: number;
  quickMatchEntryFees: number[];
}

function SettingsContent() {
  const { token } = useAuth();
  const [table, setTable] = useState<FeeTier[]>([]);
  const [entryPct, setEntryPct] = useState(0);
  const [quickMatchPct, setQuickMatchPct] = useState(0);
  const [withdrawPct, setWithdrawPct] = useState(0);
  const [cooldown, setCooldown] = useState(30);
  const [qmFees, setQmFees] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: { feeConfig: FeeConfig } }>("/fee-config").then((res) => {
      const c = res.data.feeConfig;
      setTable(c.tournamentCreateFeeTable);
      setEntryPct(c.tournamentEntryServiceFeePct);
      setQuickMatchPct(c.quickMatchServiceFeePct);
      setWithdrawPct(c.withdrawalChargePct);
      setCooldown(c.roomCooldownMinutes);
      setQmFees(c.quickMatchEntryFees.join(", "));
    });
  }, []);

  function updateTier(index: number, field: "slots" | "fee", value: number) {
    setTable((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function addTier() {
    setTable((prev) => [...prev, { slots: 2, fee: 0 }]);
  }

  function removeTier(index: number) {
    setTable((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setError(null);
    setMessage(null);

    const parsedFees = qmFees
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);
    if (parsedFees.length === 0) {
      setError("Quick Match entry fees must be a comma-separated list of positive numbers");
      return;
    }

    try {
      await apiFetch("/admin/fee-config", {
        method: "PUT",
        token,
        body: {
          tournamentCreateFeeTable: table,
          tournamentEntryServiceFeePct: entryPct,
          quickMatchServiceFeePct: quickMatchPct,
          withdrawalChargePct: withdrawPct,
          roomCooldownMinutes: cooldown,
          quickMatchEntryFees: parsedFees,
        },
      });
      setMessage("Settings updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update settings");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-heading mb-6 text-2xl font-bold">Settings</h1>
      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card>
        <h2 className="font-heading mb-3 font-semibold">Tournament Create-Fee Table</h2>
        <div className="flex flex-col gap-2">
          {table.map((tier, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <Label>Slots</Label>
                <Input
                  type="number"
                  min={2}
                  value={tier.slots}
                  onChange={(e) => updateTier(i, "slots", Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <Label>Fee (৳)</Label>
                <Input
                  type="number"
                  min={0}
                  value={tier.fee}
                  onChange={(e) => updateTier(i, "fee", Number(e.target.value))}
                />
              </div>
              <Button variant="danger" onClick={() => removeTier(i)} className="mt-5 px-2 py-1 text-xs">
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={addTier} className="mt-3">
          + Add Tier
        </Button>
      </Card>

      <Card className="mt-4">
        <h2 className="font-heading mb-3 font-semibold">Service Fees (%)</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Tournament Entry Fee %</Label>
            <Input type="number" min={0} max={100} value={entryPct} onChange={(e) => setEntryPct(Number(e.target.value))} />
          </div>
          <div>
            <Label>Quick Match Fee %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={quickMatchPct}
              onChange={(e) => setQuickMatchPct(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Withdrawal Charge %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={withdrawPct}
              onChange={(e) => setWithdrawPct(Number(e.target.value))}
            />
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-heading mb-3 font-semibold">Quick Match</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>Room Cooldown (minutes)</Label>
            <Input
              type="number"
              min={1}
              max={1440}
              value={cooldown}
              onChange={(e) => setCooldown(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              How long before a used room can be handed out again.
            </p>
          </div>
          <div>
            <Label>Entry Fee Tiers (৳)</Label>
            <Input placeholder="20, 50, 100" value={qmFees} onChange={(e) => setQmFees(e.target.value)} />
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Comma-separated. These are the buttons players pick from.
            </p>
          </div>
        </div>
      </Card>

      <Button onClick={save} className="mt-4">
        Save Changes
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireAdmin>
      <SettingsContent />
    </RequireAdmin>
  );
}

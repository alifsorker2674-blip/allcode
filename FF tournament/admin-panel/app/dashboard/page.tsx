"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAdmin from "@/components/RequireAdmin";
import { Card } from "@/components/ui";

interface Overview {
  users: { total: number; banned: number };
  pendingApprovals: { deposits: number; withdrawals: number; tournaments: number; disputes: number };
  tournaments: { active: number; total: number };
}

interface RoomAvailability {
  available: number;
  coolingDown: number;
  active: number;
}

function DashboardContent() {
  const { token } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [rooms, setRooms] = useState<RoomAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Overview }>("/admin/overview", { token })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
    apiFetch<{ data: RoomAvailability }>("/admin/rooms/availability", { token })
      .then((res) => setRooms(res.data))
      .catch(() => setRooms(null));
  }, [token]);

  if (error) return <div className="mx-auto max-w-5xl px-4 py-10 text-[var(--color-error)]">{error}</div>;
  if (!data) return <div className="mx-auto max-w-5xl px-4 py-10 text-[var(--color-text-muted)]">Loading...</div>;

  const stat = (label: string, value: number, href?: string) => (
    <Card>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {href && (
        <a href={href} className="mt-2 inline-block text-sm text-[var(--color-primary)]">
          Review →
        </a>
      )}
    </Card>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-heading mb-6 text-2xl font-bold">Overview</h1>

      <h2 className="font-heading mb-3 text-lg font-semibold text-[var(--color-warning)]">Pending Approvals</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stat("Deposits", data.pendingApprovals.deposits, "/transactions")}
        {stat("Withdrawals", data.pendingApprovals.withdrawals, "/transactions")}
        {stat("Tournaments", data.pendingApprovals.tournaments, "/tournaments")}
        {stat("Disputes", data.pendingApprovals.disputes, "/disputes")}
      </div>

      <h2 className="font-heading mt-8 mb-3 text-lg font-semibold">Platform</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stat("Total Users", data.users.total, "/users")}
        {stat("Banned Users", data.users.banned, "/users")}
        {stat("Active Tournaments", data.tournaments.active)}
        {stat("Total Tournaments", data.tournaments.total)}
      </div>

      {rooms && (
        <>
          <h2 className="font-heading mt-8 mb-3 text-lg font-semibold">Quick Match Rooms</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-sm text-[var(--color-text-muted)]">Available Now</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  rooms.available === 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"
                }`}
              >
                {rooms.available}
              </p>
              <a href="/rooms" className="mt-2 inline-block text-sm text-[var(--color-primary)]">
                Manage pool →
              </a>
            </Card>
            {stat("Cooling Down", rooms.coolingDown)}
            {stat("Active Rooms", rooms.active, "/rooms")}
          </div>
          {rooms.available === 0 && (
            <p className="mt-3 text-sm text-[var(--color-error)]">
              No room is free — new Quick Matches can&apos;t start. Add more rooms to the pool.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAdmin>
      <DashboardContent />
    </RequireAdmin>
  );
}

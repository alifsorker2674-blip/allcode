"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAdmin from "@/components/RequireAdmin";
import { Card, Button, Input, Label, Alert } from "@/components/ui";

interface Room {
  _id: string;
  game: string;
  roomId: string;
  roomPassword: string;
  isActive: boolean;
  lastAssignedAt?: string;
  timesAssigned: number;
  note?: string;
}

interface Availability {
  total: number;
  active: number;
  available: number;
  coolingDown: number;
  cooldownMinutes: number;
}

function RoomsContent() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [game, setGame] = useState<"freefire" | "bloodstrike">("freefire");
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [roomsRes, availRes] = await Promise.all([
        apiFetch<{ data: Room[] }>("/admin/rooms?limit=100", { token }),
        apiFetch<{ data: Availability }>("/admin/rooms/availability", { token }),
      ]);
      setRooms(roomsRes.data);
      setAvailability(availRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/admin/rooms", {
        method: "POST",
        token,
        body: { game, roomId, roomPassword, note: note || undefined },
      });
      setMessage("Room added to the pool");
      setRoomId("");
      setRoomPassword("");
      setNote("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add room");
    }
  }

  async function toggleActive(room: Room) {
    try {
      await apiFetch(`/admin/rooms/${room._id}`, {
        method: "PUT",
        token,
        body: { isActive: !room.isActive },
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update room");
    }
  }

  async function remove(room: Room) {
    if (!window.confirm(`Delete room ${room.roomId} from the pool?`)) return;
    try {
      await apiFetch(`/admin/rooms/${room._id}`, { method: "DELETE", token });
      setMessage("Room deleted");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete room");
    }
  }

  function cooldownLabel(room: Room): string {
    if (!room.lastAssignedAt || !availability) return "Free";
    const freeAt = new Date(room.lastAssignedAt).getTime() + availability.cooldownMinutes * 60_000;
    const remainingMs = freeAt - Date.now();
    if (remainingMs <= 0) return "Free";
    return `Cooling down ${Math.ceil(remainingMs / 60_000)}m`;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-heading mb-1 text-2xl font-bold">Quick Match Room Pool</h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">
        Pre-create in-game lobbies here. Quick Match hands one out automatically to each new pair, so nobody has
        to sit and make a room per match. A room is reused only after its cooldown expires.
      </p>

      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      {availability && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <p className="text-sm text-[var(--color-text-muted)]">Available Now</p>
            <p
              className={`mt-1 text-2xl font-bold ${
                availability.available === 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"
              }`}
            >
              {availability.available}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--color-text-muted)]">Cooling Down</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-warning)]">{availability.coolingDown}</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--color-text-muted)]">Active Rooms</p>
            <p className="mt-1 text-2xl font-bold">{availability.active}</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--color-text-muted)]">Cooldown</p>
            <p className="mt-1 text-2xl font-bold">{availability.cooldownMinutes}m</p>
          </Card>
        </div>
      )}

      {availability?.available === 0 && availability.active > 0 && (
        <div className="mt-4">
          <Alert>
            Every room is cooling down — new Quick Matches can&apos;t start until one frees up. Add more rooms to
            support more concurrent matches.
          </Alert>
        </div>
      )}

      <Card className="mt-6">
        <h2 className="font-heading mb-3 font-semibold">Add Room</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-5 sm:items-end">
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
            <Label>Room ID</Label>
            <Input required value={roomId} onChange={(e) => setRoomId(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input required value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} />
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <Card className="mt-4">
        {rooms.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            No rooms in the pool yet — Quick Match can&apos;t start any matches until you add at least one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                <th className="py-2">Game</th>
                <th className="py-2">Room ID</th>
                <th className="py-2">Password</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Used</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2">{r.game === "freefire" ? "Free Fire" : "Blood Strike"}</td>
                  <td className="py-2 font-mono">{r.roomId}</td>
                  <td className="py-2 font-mono">{r.roomPassword}</td>
                  <td className="py-2">
                    {!r.isActive ? (
                      <span className="text-[var(--color-text-muted)]">Disabled</span>
                    ) : cooldownLabel(r) === "Free" ? (
                      <span className="text-[var(--color-success)]">Free</span>
                    ) : (
                      <span className="text-[var(--color-warning)]">{cooldownLabel(r)}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">{r.timesAssigned}</td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => toggleActive(r)} className="px-3 py-1 text-xs">
                        {r.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button variant="danger" onClick={() => remove(r)} className="px-3 py-1 text-xs">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <RequireAdmin>
      <RoomsContent />
    </RequireAdmin>
  );
}

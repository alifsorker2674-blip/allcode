"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import NotificationBell from "./NotificationBell";

export default function Nav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-heading text-xl font-bold text-[var(--color-primary)]">
          Royal Clans Admin
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Overview
          </Link>
          <Link href="/transactions" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Transactions
          </Link>
          <Link href="/tournaments" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Tournaments
          </Link>
          <Link href="/quick-matches" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Quick Matches
          </Link>
          <Link href="/rooms" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Rooms
          </Link>
          <Link href="/disputes" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Disputes
          </Link>
          <Link href="/users" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Users
          </Link>
          <Link href="/settings" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Settings
          </Link>
          <Link href="/profile" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Profile
          </Link>
          <NotificationBell />
          <button
            onClick={handleLogout}
            className="rounded-md border border-[var(--color-border)] px-3 py-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

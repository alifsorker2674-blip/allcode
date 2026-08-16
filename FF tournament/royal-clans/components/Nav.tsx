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
    router.push("/");
  }

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-heading text-xl font-bold text-[var(--color-primary)]">
          Royal Clans
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/tournaments" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Tournaments
          </Link>
          <Link href="/leaderboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Leaderboard
          </Link>

          {user ? (
            <>
              <Link
                href="/quick-match"
                className="font-medium text-[var(--color-secondary)] hover:brightness-125"
              >
                ⚡ Quick Match
              </Link>
              <Link href="/dashboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                Dashboard
              </Link>
              <Link href="/wallet" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                Wallet
              </Link>
              <Link href="/profile" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                Profile
              </Link>
              <span className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-[var(--color-primary)]">
                ৳{user.walletBalance}
              </span>
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="rounded-md border border-[var(--color-border)] px-3 py-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[var(--color-primary)] px-3 py-1 font-medium text-[#171717]"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

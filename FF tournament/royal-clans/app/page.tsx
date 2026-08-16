import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h1 className="font-heading text-5xl font-bold text-[var(--color-primary)]">Royal Clans</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
        Join Free Fire &amp; Blood Strike tournaments, host your own, and compete for real prize money.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/quick-match"
          className="rounded-md bg-[var(--color-secondary)] px-6 py-3 font-medium text-white"
        >
          ⚡ Play Quick Match
        </Link>
        <Link
          href="/tournaments"
          className="rounded-md bg-[var(--color-primary)] px-6 py-3 font-medium text-[#171717]"
        >
          Browse Tournaments
        </Link>
        <Link
          href="/tournaments/create"
          className="rounded-md border border-[var(--color-border)] px-6 py-3 font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]"
        >
          Host a Tournament
        </Link>
      </div>

      <p className="mt-6 text-sm text-[var(--color-text-muted)]">
        Quick Match pairs you with an opponent instantly — the room is created for you automatically.
      </p>
    </div>
  );
}

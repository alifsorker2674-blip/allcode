"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface Overview {
  pendingApprovals: {
    deposits: number;
    withdrawals: number;
    tournaments: number;
    disputes: number;
  };
}

const POLL_INTERVAL_MS = 15000;

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); // don't stack overlapping announcements
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

/** Polls the admin overview and speaks a TTS alert whenever new pending requests appear. */
export default function NotificationWatcher() {
  const { user, token } = useAuth();
  const lastRef = useRef<Overview["pendingApprovals"] | null>(null);

  useEffect(() => {
    if (!user || !token) {
      lastRef.current = null;
      return;
    }

    let cancelled = false;

    async function poll() {
      try {
        const res = await apiFetch<{ data: Overview }>("/admin/overview", { token });
        const current = res.data.pendingApprovals;
        const last = lastRef.current;

        if (last) {
          const newPayments = current.deposits + current.withdrawals - (last.deposits + last.withdrawals);
          const newTournaments = current.tournaments - last.tournaments;
          const newDisputes = current.disputes - last.disputes;

          const parts: string[] = [];
          if (newPayments > 0) parts.push(`${newPayments} new payment request${newPayments > 1 ? "s" : ""}`);
          if (newTournaments > 0) parts.push(`${newTournaments} new tournament request${newTournaments > 1 ? "s" : ""}`);
          if (newDisputes > 0) parts.push(`${newDisputes} new dispute${newDisputes > 1 ? "s" : ""}`);

          if (parts.length > 0) speak(`You have ${parts.join(", and ")}.`);
        }
        lastRef.current = current;
      } catch {
        // ignore transient poll failures — try again next interval
      }
    }

    poll();
    const interval = setInterval(() => {
      if (!cancelled) poll();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, token]);

  return null;
}

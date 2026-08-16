"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { enablePushNotifications, isPushSupported } from "@/lib/push";

export default function NotificationBell() {
  const { token } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPushSupported()) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  async function handleEnable() {
    setLoading(true);
    setError(null);
    const result = await enablePushNotifications(token);
    setLoading(false);
    if (result.ok) {
      setPermission("granted");
    } else {
      setError(result.reason || "Could not enable notifications");
      setPermission(Notification.permission);
    }
  }

  if (permission === "unsupported" || permission === "granted") return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleEnable}
        disabled={loading}
        title="Get notified about deposits, tournament approvals, and prizes"
        className="rounded-md border border-[var(--color-border)] px-3 py-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-50"
      >
        {loading ? "Enabling..." : "🔔 Enable Notifications"}
      </button>
      {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
    </div>
  );
}

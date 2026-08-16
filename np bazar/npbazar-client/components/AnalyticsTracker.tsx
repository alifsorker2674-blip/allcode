'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

const SESSION_KEY = 'ecomus_session_id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

// Fires on every route change so the admin Analytics dashboard (sessions,
// device/referrer breakdown, landing pages, conversion funnel) has data to
// show — none of that worked before since nothing ever called this endpoint.
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: getSessionId(),
        path: pathname,
        referrer: document.referrer,
        deviceType: getDeviceType(),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}

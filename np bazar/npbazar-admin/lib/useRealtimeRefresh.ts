import { useEffect } from 'react';
import { getToken } from '@/lib/auth';
import { getSocket } from '@/lib/socket';

/** Re-runs `callback` whenever the server pushes any of `events` over
 * Socket.IO (order:new, order:updated, stock:updated, cart:updated) — pass a
 * useCallback-memoized fetch function so pages stay live without polling. */
export function useRealtimeRefresh(events: string[], callback: () => void) {
  useEffect(() => {
    const socket = getSocket(getToken());
    if (!socket) return;

    const handler = () => callback();
    events.forEach((e) => socket.on(e, handler));
    return () => {
      events.forEach((e) => socket.off(e, handler));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.join(','), callback]);
}

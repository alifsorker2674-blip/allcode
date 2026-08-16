'use client';

import { useEffect } from 'react';

// After a new deploy, the browser may still hold references to old chunk
// hashes that no longer exist on the server — navigating then throws
// ChunkLoadError and Next.js shows "This page couldn't load". A single
// reload fetches the current HTML/JS and clears the stale reference.
const RELOAD_KEY = 'chunk-reload-at';
const RELOAD_COUNT_KEY = 'chunk-reload-count';
const RELOAD_COOLDOWN_MS = 4_000;
// A flaky network (e.g. QUIC being blocked/dropped) can fail a different
// chunk on every attempt — cap how many times we auto-reload before giving up
// and letting the browser's own error screen (with its manual Reload button) show.
const MAX_AUTO_RELOADS = 4;

function isChunkError(message: string) {
  return /loading chunk|failed to load chunk|chunkloaderror/i.test(message);
}

export default function ChunkErrorHandler() {
  useEffect(() => {
    const reloadOnce = () => {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      if (Date.now() - last < RELOAD_COOLDOWN_MS) return; // avoid a tight loop if it keeps failing
      const count = Number(sessionStorage.getItem(RELOAD_COUNT_KEY) || 0);
      if (count >= MAX_AUTO_RELOADS) return; // stop retrying — likely a persistent network issue, not a stale deploy
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      sessionStorage.setItem(RELOAD_COUNT_KEY, String(count + 1));
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      if (isChunkError(event.message || '') || event.error?.name === 'ChunkLoadError') reloadOnce();
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === 'string' ? reason : reason?.message || '';
      if (isChunkError(message) || reason?.name === 'ChunkLoadError') reloadOnce();
    };
    // Resource load failures (a <script>/<link> chunk that 404s or hits a
    // network error like ERR_QUIC_PROTOCOL_ERROR) don't bubble and never reach
    // `onError` above — they only fire in the capture phase.
    const onResourceError = (event: Event) => {
      const target = event.target as HTMLScriptElement | HTMLLinkElement | null;
      if (!target || (target.tagName !== 'SCRIPT' && target.tagName !== 'LINK')) return;
      const src = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || '';
      if (src.includes('/_next/static/')) reloadOnce();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('error', onResourceError, true);

    // If this load stays healthy for a few seconds, forgive past failures so
    // a later, unrelated incident gets the full retry budget again.
    const resetTimer = setTimeout(() => sessionStorage.removeItem(RELOAD_COUNT_KEY), 5000);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('error', onResourceError, true);
      clearTimeout(resetTimer);
    };
  }, []);

  return null;
}

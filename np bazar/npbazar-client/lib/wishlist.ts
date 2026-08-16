// Guest-friendly wishlist stored in localStorage. There's no customer login
// on the storefront yet (only an authenticated wishlist API on the backend),
// so this keeps wishlisting working today without requiring an account.
const KEY = 'ecomus_wishlist';
const EVENT = 'wishlist-changed';

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

export function getWishlist(): string[] {
  return read();
}

export function isInWishlist(productId: string): boolean {
  return read().includes(productId);
}

export function toggleWishlist(productId: string): string[] {
  const ids = read();
  const next = ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId];
  write(next);
  return next;
}

// Call in a useEffect to keep a component in sync with wishlist changes made
// elsewhere on the page (or in another tab, via the native "storage" event).
export function subscribeWishlist(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

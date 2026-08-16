// Guest-friendly cart stored in localStorage (the backend cart API requires a
// logged-in user). At checkout the local items are synced to the server cart.
const KEY = 'ecomus_cart';
const EVENT = 'cart-changed';

export interface CartItem {
  productId: string;
  quantity: number;
}

function read(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function getCart(): CartItem[] {
  return read();
}

export function getCartCount(): number {
  return read().reduce((sum, i) => sum + i.quantity, 0);
}

export function addToCart(productId: string, quantity = 1) {
  const items = read();
  const existing = items.find((i) => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else items.push({ productId, quantity });
  write(items);
}

/** Set an absolute quantity; 0 or less removes the line. */
export function setCartQuantity(productId: string, quantity: number) {
  let items = read();
  if (quantity <= 0) {
    items = items.filter((i) => i.productId !== productId);
  } else {
    const existing = items.find((i) => i.productId === productId);
    if (existing) existing.quantity = quantity;
    else items.push({ productId, quantity });
  }
  write(items);
}

export function removeFromCart(productId: string) {
  write(read().filter((i) => i.productId !== productId));
}

export function clearCart() {
  write([]);
}

export function subscribeCart(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

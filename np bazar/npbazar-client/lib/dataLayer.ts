// GA4 Enhanced Ecommerce events pushed to window.dataLayer for GTM/GA4 to
// consume. Safe to call even when no GTM/GA4 container is connected yet —
// dataLayer just accumulates harmlessly, matching real GTM behavior.

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    __STORE_CURRENCY__?: string;
  }
}

export interface EcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
}

function getCurrency(explicit?: string): string {
  if (explicit) return explicit;
  if (typeof window !== 'undefined' && window.__STORE_CURRENCY__) return window.__STORE_CURRENCY__;
  return 'BDT';
}

function pushEvent(event: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export function trackViewItem(item: EcommerceItem, currency?: string) {
  pushEvent('view_item', {
    currency: getCurrency(currency),
    value: item.price,
    items: [{ ...item, quantity: item.quantity ?? 1 }],
  });
}

export function trackAddToCart(item: EcommerceItem, currency?: string) {
  const quantity = item.quantity ?? 1;
  pushEvent('add_to_cart', {
    currency: getCurrency(currency),
    value: item.price * quantity,
    items: [{ ...item, quantity }],
  });
}

export function trackRemoveFromCart(item: EcommerceItem, currency?: string) {
  const quantity = item.quantity ?? 1;
  pushEvent('remove_from_cart', {
    currency: getCurrency(currency),
    value: item.price * quantity,
    items: [{ ...item, quantity }],
  });
}

export function trackBeginCheckout(items: EcommerceItem[], currency?: string) {
  const value = items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0);
  pushEvent('begin_checkout', { currency: getCurrency(currency), value, items });
}

export function trackPurchase(
  orderNumber: string,
  total: number,
  items: EcommerceItem[],
  opts?: { shipping?: number; currency?: string }
) {
  pushEvent('purchase', {
    transaction_id: orderNumber,
    currency: getCurrency(opts?.currency),
    value: total,
    shipping: opts?.shipping ?? 0,
    items,
  });
}

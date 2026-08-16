'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiBell, FiVolume2, FiVolumeX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { getToken } from '@/lib/auth';
import { getSocket } from '@/lib/socket';

interface NewOrderPayload {
  _id: string;
  orderNumber: string;
  total: number;
  customerName: string;
  itemCount: number;
  paymentMethod: string;
  createdAt: string;
}

const MAX_ITEMS = 20;
const SOUND_PREF_KEY = 'order-voice-alerts';
const fmt = (n: number) => `৳${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Reads a sentence aloud via the browser's built-in text-to-speech — no
 * server/API involved, works entirely client-side. */
function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // don't queue up behind a previous announcement
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

/** Bell icon in the top navbar — pops a toast the instant an order is placed
 * (Socket.IO) and keeps a dropdown history for this session so a notification
 * isn't lost if nobody was looking at the screen when it arrived. */
export default function OrderNotifications() {
  const router = useRouter();
  const [items, setItems] = useState<NewOrderPayload[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVoiceOn(localStorage.getItem(SOUND_PREF_KEY) !== 'off');
  }, []);

  const toggleVoice = () => {
    setVoiceOn((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_PREF_KEY, next ? 'on' : 'off');
      return next;
    });
  };

  useEffect(() => {
    const socket = getSocket(getToken());
    if (!socket) return;

    const onNewOrder = (order: NewOrderPayload) => {
      setItems((prev) => [order, ...prev].slice(0, MAX_ITEMS));
      setUnread((n) => n + 1);

      if (localStorage.getItem(SOUND_PREF_KEY) !== 'off') {
        const name = order.customerName?.trim();
        speak(name ? `New order from ${name}` : 'New order received');
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'New order placed!',
        html: `<b>${order.orderNumber}</b> · ${order.customerName || 'Customer'} · ${fmt(order.total)} (${order.itemCount} item${order.itemCount === 1 ? '' : 's'})`,
        showConfirmButton: false,
        timer: 8000,
        timerProgressBar: true,
        didOpen: (el) => {
          el.style.cursor = 'pointer';
          el.onclick = () => {
            Swal.close();
            router.push(`/dashboard/orders/${order._id}`);
          };
        },
      });
    };

    socket.on('order:new', onNewOrder);
    return () => {
      socket.off('order:new', onNewOrder);
    };
  }, [router]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const toggle = () => {
    setOpen((v) => !v);
    setUnread(0);
  };

  return (
    <div className="relative flex items-center gap-1" ref={wrapRef}>
      <button
        type="button"
        onClick={toggleVoice}
        aria-label={voiceOn ? 'Mute order voice alerts' : 'Unmute order voice alerts'}
        title={voiceOn ? 'Voice alerts on — click to mute' : 'Voice alerts muted — click to unmute'}
        className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
      >
        {voiceOn ? <FiVolume2 size={18} /> : <FiVolumeX size={18} />}
      </button>

      <button
        type="button"
        onClick={toggle}
        aria-label="Order notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
      >
        <FiBell size={19} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Order Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-400">No new orders yet this session.</p>
            ) : (
              items.map((order) => (
                <button
                  key={order._id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/dashboard/orders/${order._id}`);
                  }}
                  className="block w-full border-b border-zinc-50 px-4 py-3 text-left transition last:border-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{order.orderNumber}</span>
                    <span className="text-sm font-semibold text-primary">{fmt(order.total)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {order.customerName || 'Customer'} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'} ·{' '}
                    {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

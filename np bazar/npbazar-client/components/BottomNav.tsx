'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiGrid, FiShoppingCart, FiUser } from 'react-icons/fi';
import { getCartCount, subscribeCart } from '@/lib/cart';

export default function BottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const sync = () => setCartCount(getCartCount());
    sync();
    return subscribeCart(sync);
  }, []);

  const links = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Shop', href: '/shop', icon: FiGrid },
    { name: 'Cart', href: '/cart', icon: FiShoppingCart, badge: cartCount },
    { name: 'Account', href: '/account', icon: FiUser },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-zinc-200 bg-white pb-safe lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`group relative flex flex-col items-center justify-center gap-1 w-full h-full ${
              isActive ? 'text-[var(--primary)]' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <div className="relative">
              <Icon size={22} className={isActive ? 'fill-[var(--primary)]/10 stroke-2' : 'stroke-[1.5]'} />
              {link.badge !== undefined && link.badge > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white">
                  {link.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

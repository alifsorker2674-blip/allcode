'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiUser } from 'react-icons/fi';
import { getUser, subscribeAuth } from '@/lib/auth';

export default function AccountNavLink() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setName(getUser()?.name || null);
    sync();
    return subscribeAuth(sync);
  }, []);

  return (
    <Link href="/account" className="group flex flex-col items-center gap-1 text-zinc-700 hover:text-[var(--primary)]">
      <FiUser size={22} className="transition-transform group-hover:-translate-y-0.5" />
      <span className="max-w-20 truncate text-sm font-medium">{name ? name.split(' ')[0] : 'Sign In'}</span>
    </Link>
  );
}

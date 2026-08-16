'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { Collection, Brand } from '@/lib/api';

interface NavCollection extends Collection {
  children: Collection[];
}

interface Props {
  navTree: NavCollection[];
  brands: Brand[];
}

export default function MobileMenu({ navTree, brands }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling on body when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group flex flex-col items-center gap-1 text-zinc-700 hover:text-[var(--primary)] lg:hidden"
      >
        <FiMenu size={24} className="transition-transform group-hover:-translate-y-0.5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 transition-opacity lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 top-0 z-[110] flex w-[300px] flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 p-4">
          <span className="text-lg font-bold text-zinc-900">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
          <nav className="flex flex-col gap-1">
            <Link
              href="/shop"
              className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-[var(--primary)]"
            >
              Shop All <FiChevronRight size={18} className="text-zinc-400" />
            </Link>

            <Link
              href="/featured"
              className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-[var(--primary)]"
            >
              Featured <FiChevronRight size={18} className="text-zinc-400" />
            </Link>

            {brands.length > 0 && (
              <div className="rounded-lg">
                <button
                  onClick={() => toggleCategory('brands')}
                  className="flex w-full items-center justify-between px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-[var(--primary)]"
                >
                  Brands
                  <FiChevronDown
                    size={18}
                    className={`text-zinc-400 transition-transform ${
                      expandedCategories.includes('brands') ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedCategories.includes('brands') && (
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-zinc-100 pl-3">
                    {brands.map((brand) => (
                      <Link
                        key={brand._id}
                        href={`/brands/${brand.slug}`}
                        className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-[var(--primary)]"
                      >
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {navTree.map((collection) => (
              <div key={collection._id} className="rounded-lg">
                {collection.children.length > 0 ? (
                  <>
                    <button
                      onClick={() => toggleCategory(collection._id)}
                      className="flex w-full items-center justify-between px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-[var(--primary)]"
                    >
                      {collection.name}
                      <FiChevronDown
                        size={18}
                        className={`text-zinc-400 transition-transform ${
                          expandedCategories.includes(collection._id) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedCategories.includes(collection._id) && (
                      <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-zinc-100 pl-3">
                        <Link
                          href={`/collections/${collection.slug}`}
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 hover:text-[var(--primary)]"
                        >
                          All {collection.name}
                        </Link>
                        {collection.children.map((child) => (
                          <Link
                            key={child._id}
                            href={`/collections/${child.slug}`}
                            className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-[var(--primary)]"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-[var(--primary)]"
                  >
                    {collection.name} <FiChevronRight size={18} className="text-zinc-400" />
                  </Link>
                )}
              </div>
            ))}
            
            {/* Quick Links for mobile */}
            <div className="mt-6 border-t border-zinc-100 pt-6">
              <Link
                href="/track"
                className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-[var(--primary)]"
              >
                Track Order
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-[var(--primary)]"
              >
                Wishlist
              </Link>
              <Link
                href="/about"
                className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-[var(--primary)]"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-[var(--primary)]"
              >
                Contact Us
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

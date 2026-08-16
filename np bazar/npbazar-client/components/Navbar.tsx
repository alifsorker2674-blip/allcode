import Link from 'next/link';
import { FiMapPin, FiChevronDown, FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import { fetchCollections, fetchBrands, type Collection, type StoreSettings } from '@/lib/api';
import SearchBar from '@/components/SearchBar';
import WishlistNavLink from '@/components/WishlistNavLink';
import CartNavLink from '@/components/CartNavLink';
import AccountNavLink from '@/components/AccountNavLink';
import MobileMenu from '@/components/MobileMenu';

// A top-level collection with its sub-collections (if any) resolved for the dropdown.
interface NavCollection extends Collection {
  children: Collection[];
}

const parentId = (c: Collection): string | null => {
  if (!c.parent) return null;
  return typeof c.parent === 'object' ? c.parent._id : c.parent;
};

// Build a 2-level tree (top-level collections + their direct sub-collections)
// straight from whatever the server returns, so the navbar reflects reality
// (rename/add/remove a collection in the admin panel and it shows up here).
function buildNavTree(collections: Collection[]): NavCollection[] {
  const topLevel = collections.filter((c) => !parentId(c));
  return topLevel.map((c) => ({
    ...c,
    children: collections.filter((child) => parentId(child) === c._id),
  }));
}

interface Props {
  settings: StoreSettings;
}

export default async function Navbar({ settings }: Props) {
  const [collections, brands] = await Promise.all([fetchCollections(), fetchBrands()]);
  const activeCollections = collections.filter((c) => c.isActive);
  const navTree = buildNavTree(activeCollections);
  const social = settings.socialLinks || {};
  const hasContactInfo = Boolean(settings.phone || settings.email);
  const hasSocialLinks = Boolean(social.facebook || social.instagram || social.youtube || social.twitter);

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Top Utility Bar — contact info + social links from Settings */}
      {(hasContactInfo || hasSocialLinks) && (
        <div className="hidden bg-[var(--nav-bg)] md:block">
          <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-4 text-sm text-zinc-300 sm:px-6 lg:px-8">
            <div className="flex items-center gap-5">
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 transition hover:text-white">
                  <FiPhone size={12} />
                  {settings.phone}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 transition hover:text-white">
                  <FiMail size={12} />
                  {settings.email}
                </a>
              )}
            </div>
            {hasSocialLinks && (
              <div className="flex items-center gap-4">
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                    <FaFacebookF size={12} />
                  </a>
                )}
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                    <FaInstagram size={13} />
                  </a>
                )}
                {social.youtube && (
                  <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                    <FaYoutube size={14} />
                  </a>
                )}
                {social.twitter && (
                  <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                    <FaTwitter size={13} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Bar (White) */}
      <div className="bg-white">
        <div className="mx-auto flex h-16 lg:h-24 max-w-[1650px] items-center justify-between px-4 sm:px-6 lg:px-8 relative">
          
          {/* Mobile Menu (Left on Mobile) */}
          <div className="flex-1 lg:hidden">
            <MobileMenu navTree={navTree} brands={brands} />
          </div>

          {/* Logo (Centered on Mobile, Left on Desktop) */}
          <Link href="/" className="flex shrink-0 items-center justify-center lg:justify-start">
            {settings.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo} alt={settings.storeName} className="h-8 lg:h-12 w-auto object-contain" />
            ) : (
              <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900">
                {settings.storeName}
                <span className="text-[var(--primary)]">.</span>
              </span>
            )}
          </Link>

          {/* Search Bar (Center on Desktop) */}
          <div className="hidden flex-1 max-w-2xl px-12 md:block">
            <SearchBar />
          </div>

          {/* Actions (Right) */}
          <div className="flex shrink-0 items-center justify-end gap-4 lg:gap-6 flex-1 lg:flex-none">
            <Link href="/track" className="hidden lg:flex group flex-col items-center gap-1 text-zinc-700 hover:text-[var(--primary)]">
              <FiMapPin size={22} className="transition-transform group-hover:-translate-y-0.5" />
              <span className="text-sm font-medium">Track Order</span>
            </Link>
            <div className="hidden lg:flex">
              <AccountNavLink />
            </div>
            <div className="hidden lg:flex">
              <WishlistNavLink />
            </div>
            <div className="hidden lg:flex">
              <CartNavLink />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar (Dark) */}
      <div className="bg-[var(--nav-bg)] hidden lg:block">
        <div className="mx-auto flex h-12 max-w-[1650px] items-center px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6">
            <Link href="/shop" className="text-sm font-medium text-zinc-200 transition hover:text-white">
              Shop All
            </Link>

            <Link href="/featured" className="text-sm font-medium text-zinc-200 transition hover:text-white">
              Featured
            </Link>

            {brands.length > 0 && (
              <div className="group/nav relative">
                <Link
                  href="/shop"
                  className="flex items-center gap-1 py-3 text-sm font-medium text-zinc-200 transition hover:text-white"
                >
                  Brands
                  <FiChevronDown size={14} className="text-zinc-400 transition-transform group-hover/nav:rotate-180 group-hover/nav:text-white" />
                </Link>

                {/* Dropdown listing every brand, shown on hover (pure CSS, no JS needed) */}
                <div className="invisible absolute left-0 top-full z-50 min-w-[200px] rounded-lg border border-zinc-100 bg-white py-2 opacity-0 transition-all duration-150 group-hover/nav:visible group-hover/nav:opacity-100">
                  {brands.map((brand) => (
                    <Link
                      key={brand._id}
                      href={`/brands/${brand.slug}`}
                      className="block px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 hover:text-[var(--primary)]"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {navTree.map((collection) => (
              <div key={collection._id} className="group/nav relative">
                <Link
                  href={`/collections/${collection.slug}`}
                  className="flex items-center gap-1 py-3 text-sm font-medium text-zinc-200 transition hover:text-white"
                >
                  {collection.name}
                  {collection.children.length > 0 && (
                    <FiChevronDown size={14} className="text-zinc-400 transition-transform group-hover/nav:rotate-180 group-hover/nav:text-white" />
                  )}
                </Link>

                {/* Dropdown of sub-collections, shown on hover (pure CSS, no JS needed) */}
                {collection.children.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-50 min-w-[200px] rounded-lg border border-zinc-100 bg-white py-2 opacity-0 transition-all duration-150 group-hover/nav:visible group-hover/nav:opacity-100">
                    {collection.children.map((child) => (
                      <Link
                        key={child._id}
                        href={`/collections/${child.slug}`}
                        className="block px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 hover:text-[var(--primary)]"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

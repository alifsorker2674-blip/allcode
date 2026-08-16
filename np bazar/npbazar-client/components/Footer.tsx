import Link from 'next/link';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import { fetchCollections, type StoreSettings } from '@/lib/api';

interface Props {
  settings: StoreSettings;
}

const QUICK_LINKS = [
  { label: 'Shop All', href: '/shop' },
  { label: 'Featured Products', href: '/featured' },
  { label: 'My Wishlist', href: '/wishlist' },
  { label: 'My Cart', href: '/cart' },
];

const SUPPORT_LINKS = [
  { label: 'Track Order', href: '/track' },
  { label: 'Sign In / Register', href: '/account' },
];

export default async function Footer({ settings }: Props) {
  const collections = await fetchCollections();
  const topCategories = collections.filter((c) => c.isActive && !c.parent).slice(0, 6);
  const social = settings.socialLinks || {};
  const hasSocial = Boolean(social.facebook || social.instagram || social.youtube || social.twitter);

  return (
    <footer className="mt-16 bg-[var(--nav-bg)] text-zinc-300">
      <div className="mx-auto grid w-full max-w-[1650px] grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
        {/* Store info */}
        <div className="col-span-2 lg:col-span-1">
          {settings.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo} alt={settings.storeName} className="h-12 w-auto rounded-[8px] bg-white object-contain p-1" />
          ) : (
            <p className="text-2xl font-extrabold tracking-tight text-white">
              {settings.storeName}
              <span className="text-[var(--primary)]">.</span>
            </p>
          )}
          <div className="mt-5 space-y-2.5 text-sm">
            {settings.address && (
              <p className="flex items-start gap-2">
                <FiMapPin size={15} className="mt-0.5 shrink-0" /> {settings.address}
              </p>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2 transition hover:text-white">
                <FiPhone size={15} className="shrink-0" /> {settings.phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 transition hover:text-white">
                <FiMail size={15} className="shrink-0" /> {settings.email}
              </a>
            )}
          </div>
          {hasSocial && (
            <div className="mt-5 flex items-center gap-3">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 transition hover:bg-[var(--primary)] hover:text-white">
                  <FaFacebookF size={14} />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 transition hover:bg-[var(--primary)] hover:text-white">
                  <FaInstagram size={15} />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 transition hover:bg-[var(--primary)] hover:text-white">
                  <FaYoutube size={16} />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 transition hover:bg-[var(--primary)] hover:text-white">
                  <FaTwitter size={15} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Shop by category — live from the admin panel */}
        <div>
          <h3 className="text-base font-bold text-white">Shop By Category</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {topCategories.map((c) => (
              <li key={c._id}>
                <Link href={`/collections/${c.slug}`} className="transition hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-base font-bold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Information links */}
        <div>
          <h3 className="text-base font-bold text-white">Information</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/blog" className="transition hover:text-white">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-white">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="transition hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="transition hover:text-white">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-base font-bold text-white">Support</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SUPPORT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            {settings.phone && (
              <li>
                <a href={`https://wa.me/${settings.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                  Order On WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1650px] flex-col items-center justify-between gap-2 px-4 py-5 text-sm sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </p>
          <p className="text-zinc-400">Cash on Delivery available across Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}

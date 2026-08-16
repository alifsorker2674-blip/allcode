import { fetchSettings } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettings();
  const page = settings.seo?.pages?.contact;
  return buildMetadata({ title: page?.title || 'Contact Us', description: page?.description, settings });
}

export default async function ContactPage() {
  const settings = await fetchSettings();
  const social = settings.socialLinks || {};
  const hasSocial = Boolean(social.facebook || social.instagram || social.youtube || social.twitter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 font-sans">
      <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl text-center mb-12">
        Contact Us
      </h1>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Get in Touch</h2>
            <div className="space-y-5">
              {settings.address && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">Address</h3>
                    <p className="mt-1 text-sm text-zinc-600">{settings.address}</p>
                  </div>
                </div>
              )}
              {settings.phone && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">Phone</h3>
                    <a href={`tel:${settings.phone}`} className="mt-1 block text-sm text-[var(--primary)] hover:underline">
                      {settings.phone}
                    </a>
                  </div>
                </div>
              )}
              {settings.email && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                    <FiMail size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">Email</h3>
                    <a href={`mailto:${settings.email}`} className="mt-1 block text-sm text-[var(--primary)] hover:underline">
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {hasSocial && (
              <div className="mt-8 pt-8 border-t border-zinc-100">
                <h3 className="font-semibold text-zinc-900 mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {social.facebook && (
                    <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-[#1877F2] hover:text-white">
                      <FaFacebookF size={16} />
                    </a>
                  )}
                  {social.instagram && (
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-[#E4405F] hover:text-white">
                      <FaInstagram size={18} />
                    </a>
                  )}
                  {social.youtube && (
                    <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-[#FF0000] hover:text-white">
                      <FaYoutube size={18} />
                    </a>
                  )}
                  {social.twitter && (
                    <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-[#1DA1F2] hover:text-white">
                      <FaTwitter size={16} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Contact Message */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 h-fit">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Send us a message</h2>
          {settings.contactUs ? (
            <div 
              className="prose prose-sm prose-zinc"
              dangerouslySetInnerHTML={{ __html: settings.contactUs }}
            />
          ) : (
             <p className="text-sm text-zinc-500 mb-6">
              Please feel free to reach out to us using the contact details provided on this page, or connect with us on social media!
            </p>
          )}
          
          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">First Name</label>
                <input className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/10" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Last Name</label>
                <input className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/10" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <input type="email" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/10" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Message</label>
              <textarea className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/10 min-h-32" placeholder="How can we help you?" />
            </div>
            <button type="button" className="w-full rounded-xl bg-[var(--btn-color)] px-6 py-3 text-sm font-bold text-white transition hover:brightness-90">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { fetchSettings } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettings();
  const page = settings.seo?.pages?.privacyPolicy;
  return buildMetadata({ title: page?.title || 'Privacy Policy', description: page?.description, settings });
}

export default async function PrivacyPolicyPage() {
  const settings = await fetchSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 font-sans">
      <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl text-center mb-8">
        Privacy Policy
      </h1>
      
      {settings.privacyPolicy ? (
        <div 
          className="prose prose-zinc max-w-none bg-white p-8 rounded-2xl shadow-sm border border-zinc-100"
          dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }}
        />
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-zinc-100">
          <p className="text-zinc-500">Our Privacy Policy will be available soon.</p>
        </div>
      )}
    </div>
  );
}

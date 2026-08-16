import type { Metadata } from 'next';
import type { StoreSettings } from './api';

interface BuildMetadataParams {
  title: string;
  description?: string;
  /** Page-specific social share image (e.g. product thumbnail). Falls back
   * to the site-wide share image, then the store logo, when omitted. */
  image?: string;
  settings: StoreSettings;
}

/** Shared Open Graph/Twitter card builder so every page's social preview
 * (title, description, image) actually matches what's on the page. */
export function buildMetadata({ title, description, image, settings }: BuildMetadataParams): Metadata {
  const ogImage = image || settings.seo?.ogImage || settings.logo || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: settings.storeName,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

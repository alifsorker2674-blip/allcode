import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import TrackingHeadInjector from "@/components/TrackingHeadInjector";
import ChunkErrorHandler from "@/components/ChunkErrorHandler";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { fetchSettings } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Static metadata can't read the DB-backed settings — generateMetadata can.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettings(); // same request as below, deduped by Next's fetch memoization
  const tc = settings.trackingCodes;
  const home = settings.seo?.pages?.home;
  const title = home?.title || settings.seo?.metaTitle || settings.storeName;
  const description = home?.description || settings.seo?.metaDescription || undefined;

  return {
    ...buildMetadata({ title, description, settings }),
    // Overrides buildMetadata's plain title with a template so every other
    // page's <title>, set via its own generateMetadata, renders as "Page | StoreName".
    title: { default: title, template: `%s | ${settings.storeName}` },
    // app/favicon.ico was removed — Next's static file convention always
    // wins over this field when both exist, so the DB-backed favicon never
    // took effect. Default lives in public/favicon.ico instead.
    icons: { icon: settings.favicon || "/favicon.ico" },
    verification: {
      google: tc?.searchConsoleVerification || undefined,
      other: tc?.bingVerification ? { "msvalidate.01": tc.bingVerification } : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await fetchSettings();
  const tc = settings.trackingCodes;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={
        {
          '--btn-color': settings.buttonColor || '#f97316',
          '--primary': settings.primaryColor || '#df0000',
          '--nav-bg': settings.navbarColor || '#0b2221',
          '--background': settings.backgroundColor || '#fbf9f5',
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col pb-16 lg:pb-0">
        <ChunkErrorHandler />
        <AnalyticsTracker />
        {/* GTM noscript fallback must be the first element inside <body>. */}
        {tc?.gtmContainerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${tc.gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Always-on dataLayer + currency bootstrap, regardless of whether any
            tracking ID is configured — dataLayer.push() should never throw. */}
        <Script id="datalayer-init" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || []; window.__STORE_CURRENCY__ = ${JSON.stringify(settings.currency)};`}
        </Script>

        {tc?.gtmContainerId && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${tc.gtmContainerId}');`}
          </Script>
        )}

        {tc?.ga4MeasurementId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${tc.ga4MeasurementId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${tc.ga4MeasurementId}');`}
            </Script>
          </>
        )}

        {tc?.metaPixelId && (
          <>
            <Script id="meta-pixel-init" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${tc.metaPixelId}');fbq('track','PageView');`}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                alt=""
                src={`https://www.facebook.com/tr?id=${tc.metaPixelId}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}

        <TrackingHeadInjector html={tc?.customHeadCode} />

        <Navbar settings={settings} />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer settings={settings} />
        <BottomNav />
      </body>
    </html>
  );
}

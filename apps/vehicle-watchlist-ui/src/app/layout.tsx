import './global.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/lib/i18n-provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Vehicle Watchlist - Track Israeli Vehicles',
    template: '%s | Vehicle Watchlist',
  },
  description: 'Search Israeli vehicles by license plate, save to your watchlist, and get detailed analytics. Access official government data for free.',
  keywords: [
    'Israeli vehicles',
    'vehicle search',
    'license plate lookup',
    'vehicle watchlist',
    'Israel vehicle data',
    'government vehicle data',
    'vehicle analytics',
    'רכבים ישראליים',
    'חיפוש רכב',
    'מספר רישוי',
  ],
  authors: [{ name: 'AZ.labs.net' }],
  creator: 'dooble',
  publisher: 'AZ.labs.net',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['he_IL'],
    url: 'https://vehicle-watchlist.az.labs.net',
    siteName: 'Vehicle Watchlist',
    title: 'Vehicle Watchlist - Track Israeli Vehicles',
    description: 'Search Israeli vehicles by license plate, save to your watchlist, and get detailed analytics. Access official government data for free.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vehicle Watchlist Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vehicle Watchlist - Track Israeli Vehicles',
    description: 'Search Israeli vehicles by license plate, save to your watchlist, and get detailed analytics.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://vehicle-watchlist.az.labs.net',
    languages: {
      'en-US': 'https://vehicle-watchlist.az.labs.net',
      'he-IL': 'https://vehicle-watchlist.az.labs.net',
    },
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Vehicle Watchlist',
    description: 'Search Israeli vehicles by license plate, save to your watchlist, and get detailed analytics',
    url: 'https://vehicle-watchlist.az.labs.net',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'AZ.labs.net',
      url: 'https://az.labs.net',
    },
  };

  return (
    <html suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <I18nProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col">
              <Navbar />
              {children}
            </div>
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

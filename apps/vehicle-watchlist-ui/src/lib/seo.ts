// SEO Utilities for Vehicle Watchlist Application

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
}

/**
 * SEO Configuration for all pages
 */
export const SEO_CONFIG = {
  siteName: 'Vehicle Watchlist',
  siteUrl: 'https://vehicle-watchlist.az.labs.net',
  defaultTitle: 'Vehicle Watchlist - Track Israeli Vehicles',
  titleTemplate: '%s | Vehicle Watchlist',
  defaultDescription:
    'Search Israeli vehicles by license plate, save to your watchlist, and get detailed analytics. Access official government data for free.',
  defaultImage: '/og-image.png',
  twitterHandle: '@vehiclewatchlist',
  
  pages: {
    home: {
      title: 'Vehicle Watchlist - Track Israeli Vehicles',
      description:
        'Search Israeli vehicles by license plate, save to your watchlist, and get detailed analytics. Access official government data for free.',
      keywords: [
        'Israeli vehicles',
        'vehicle search',
        'license plate lookup',
        'vehicle watchlist',
        'Israel vehicle data',
        'government vehicle data',
      ],
    },
    search: {
      title: 'Search Vehicles',
      description:
        'Search Israeli vehicles by license plate number or filters. Get detailed vehicle information from official government sources.',
      keywords: [
        'vehicle search',
        'license plate search',
        'Israeli vehicle lookup',
        'car registration',
      ],
    },
    dashboard: {
      title: 'Dashboard',
      description:
        'Manage your vehicle watchlist, view statistics, and track your saved vehicles in one place.',
      keywords: ['dashboard', 'vehicle management', 'watchlist overview'],
    },
    analytics: {
      title: 'Analytics',
      description:
        'View detailed analytics and insights about your vehicle watchlist. Visualize data by manufacturer, year, color, and fuel type.',
      keywords: [
        'vehicle analytics',
        'fleet analytics',
        'vehicle statistics',
        'data visualization',
      ],
    },
    watchlist: {
      title: 'My Watchlist',
      description:
        'Your personal vehicle watchlist. View, manage, and track all your saved vehicles.',
      keywords: ['watchlist', 'saved vehicles', 'vehicle tracking'],
    },
    login: {
      title: 'Login',
      description: 'Sign in to your Vehicle Watchlist account to access your saved vehicles and analytics.',
      keywords: ['login', 'sign in', 'account access'],
    },
    register: {
      title: 'Register',
      description: 'Create a free Vehicle Watchlist account to start tracking Israeli vehicles.',
      keywords: ['register', 'sign up', 'create account'],
    },
  },
} as const;

/**
 * Generate structured data for a page
 */
export function generateStructuredData(page: keyof typeof SEO_CONFIG.pages) {
  const pageData = SEO_CONFIG.pages[page];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageData.title,
    description: pageData.description,
    url: `${SEO_CONFIG.siteUrl}/${page === 'home' ? '' : page}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    },
  };
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(page: keyof typeof SEO_CONFIG.pages) {
  const pageData = SEO_CONFIG.pages[page];
  const canonical = `${SEO_CONFIG.siteUrl}/${page === 'home' ? '' : page}`;
  
  return {
    title: pageData.title,
    description: pageData.description,
    keywords: pageData.keywords?.join(', '),
    canonical,
    openGraph: {
      title: pageData.title,
      description: pageData.description,
      url: canonical,
      siteName: SEO_CONFIG.siteName,
      images: [SEO_CONFIG.defaultImage],
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['he_IL'],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.title,
      description: pageData.description,
      images: [SEO_CONFIG.defaultImage],
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SEO_CONFIG.siteUrl}${item.url}`,
    })),
  };
}

import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vehicle Watchlist - Track Israeli Vehicles',
    short_name: 'VehicleWatch',
    description: 'Search Israeli vehicles by license plate, save to your watchlist, and get detailed analytics',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    categories: ['business', 'productivity'],
    icons: [],
    lang: 'en',
    dir: 'ltr',
  };
}

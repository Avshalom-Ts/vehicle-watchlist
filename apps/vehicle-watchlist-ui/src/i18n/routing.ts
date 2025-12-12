import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // Hebrew as the first and default language
  locales: ['he', 'en'],
  defaultLocale: 'he',
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

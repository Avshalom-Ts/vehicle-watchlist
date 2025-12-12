import './global.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/lib/i18n-provider';

export const metadata = {
  title: 'Vehicle Watchlist',
  description: 'Search and track Israeli vehicles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
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

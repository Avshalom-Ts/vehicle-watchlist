'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/auth-service';
import { HeroSearch } from '@/components/hero-search';
import { Car, Shield, Star } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (AuthService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <main className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-16">
        <div className="container px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Car className="w-16 h-16 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Vehicle Watchlist
              </h1>
              <p className="text-xl text-muted-foreground">
                Search Israeli vehicle information by license plate
              </p>
            </div>

            {/* Auth CTA */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            {/* Search Box */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">
                Search Vehicle by License Plate
              </h2>
              <HeroSearch />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex flex-col items-center gap-2 p-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Search Vehicles</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Look up any Israeli vehicle by license plate
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Save to Watchlist</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Create an account to save vehicles
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Star Favorites</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Mark important vehicles as favorites
                </p>
              </div>
            </div>


          </div>
        </div>
      </section>
    </main>
  );
}

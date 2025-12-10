'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Car, User, LogOut } from 'lucide-react';
import { AuthService } from '@/lib/auth-service';
import { toast } from 'sonner';

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check authentication status
        const checkAuth = () => {
            const authenticated = AuthService.isAuthenticated();
            setIsAuthenticated(authenticated);
            if (authenticated) {
                setUser(AuthService.getUser());
            } else {
                setUser(null);
            }
        };

        checkAuth();

        // Listen for storage changes (login/logout in other tabs)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [pathname]); // Re-check auth when route changes

    const handleLogout = () => {
        AuthService.logout();
        setIsAuthenticated(false);
        setUser(null);
        toast.success('Logged out successfully');
        router.push('/login');
    };

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
                    <Car className="h-6 w-6" />
                    Vehicle Watchlist
                </Link>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    {isAuthenticated && user ? (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/dashboard">
                                    <User className="h-4 w-4 mr-2" />
                                    {user.name}
                                </Link>
                            </Button>
                            <Button variant="outline" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register">Register</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

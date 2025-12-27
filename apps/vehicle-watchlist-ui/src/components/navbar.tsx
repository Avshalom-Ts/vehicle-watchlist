'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Car, User, LogOut, Menu, X } from 'lucide-react';
import { AuthService } from '@/lib/auth-service';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n-provider';

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useI18n();
    const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        AuthService.logout();
        setIsAuthenticated(false);
        setUser(null);
        setIsMobileMenuOpen(false);
        toast.success(t('auth.logoutSuccess'));
        router.push('/login');
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
                        <Car className="h-6 w-6" />
                        <span className="sm:inline">{t('common.vehicleWatchlist')}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-3">
                        <LanguageSwitcher />
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
                                    {t('common.logout')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="/login">{t('common.login')}</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/register">{t('common.register')}</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t bg-background">
                        <div className="container mx-auto px-4 py-4 space-y-3">
                            {isAuthenticated && user ? (
                                <>
                                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        {t('navbar.signedInAs')} <span className="font-medium text-foreground">{user.name}</span>
                                    </div>
                                    <div className="border-t pt-3 space-y-1">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
                                            asChild
                                            onClick={closeMobileMenu}
                                        >
                                            <Link href="/dashboard">
                                                <User className="h-4 w-4 mr-2" />
                                                {t('common.dashboard')}
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
                                            asChild
                                            onClick={closeMobileMenu}
                                        >
                                            <Link href="/search">
                                                <Car className="h-4 w-4 mr-2" />
                                                {t('common.searchVehicles')}
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
                                            asChild
                                            onClick={closeMobileMenu}
                                        >
                                            <Link href="/watchlist">
                                                <Car className="h-4 w-4 mr-2" />
                                                {t('common.myWatchlist')}
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
                                            asChild
                                            onClick={closeMobileMenu}
                                        >
                                            <Link href="/analytics">
                                                <Car className="h-4 w-4 mr-2" />
                                                {t('common.analytics')}
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="border-t pt-3">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-destructive hover:text-destructive"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            {t('common.logout')}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        asChild
                                        onClick={closeMobileMenu}
                                    >
                                        <Link href="/login">{t('common.login')}</Link>
                                    </Button>
                                    <Button
                                        className="w-full"
                                        asChild
                                        onClick={closeMobileMenu}
                                    >
                                        <Link href="/register">{t('common.register')}</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            {/* Spacer to prevent content from going under fixed navbar */}
            <div className="h-16" />
        </>
    );
}

'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/lib/auth-service';
import { WatchlistService } from '@/lib/watchlist-service';
import { AnalyticsService } from '@/lib/analytics-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Clock, TrendingUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n-provider';

interface RecentActivity {
    licensePlate: string;
    manufacturer: string;
    model: string;
    createdAt: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { t, locale } = useI18n();
    const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [watchlistCount, setWatchlistCount] = useState(0);
    const [starredCount, setStarredCount] = useState(0);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    useEffect(() => {
        // Check authentication
        if (!AuthService.isAuthenticated()) {
            router.push('/');
            return;
        }

        const userData = AuthService.getUser();
        setUser(userData);

        // Fetch watchlist and starred counts
        Promise.all([
            WatchlistService.getWatchlistCount(),
            WatchlistService.getStarredCount(),
            AnalyticsService.getAnalytics()
        ]).then(([total, starred, analytics]) => {
            setWatchlistCount(total);
            setStarredCount(starred);
            if (analytics.success && analytics.data) {
                setRecentActivity(analytics.data.recentlyAdded);
            }
        }).catch(() => {
            setWatchlistCount(0);
            setStarredCount(0);
            setRecentActivity([]);
        });

        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </main>
        );
    }

    return (
        <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
            <div className="container mx-auto max-w-6xl space-y-6">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">{t('dashboard.welcome')} {user?.name}!</h1>
                        <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* User Info Card */}
                    <Card className='col-span-2'>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {t('dashboard.profileInfo')}
                            </CardTitle>
                            <CardDescription>{t('dashboard.accountDetails')}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-8">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('auth.name')}</p>
                                <p className="text-lg">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('auth.email')}</p>
                                <p className="text-lg">{user?.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className='col-span-2'>
                        <CardHeader>
                            <CardTitle>{t('dashboard.quickActionsCard')}</CardTitle>
                            <CardDescription>{t('dashboard.commonTasks')}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button variant="outline" asChild>
                                <Link href="/search">{t('common.searchVehicles')}</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/analytics">{t('dashboard.viewAnalytics')}</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <Link href="/watchlist">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {t('common.myWatchlist')}
                                </CardTitle>
                                <CardDescription>{t('dashboard.vehiclesTracking')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='flex flex-row items-center justify-between'>
                                    <div className='flex flex-col items-center'>
                                        {
                                            watchlistCount > 0 ? (
                                                <p className="text-3xl font-bold">{watchlistCount}</p>
                                            ) : (
                                                <p className="text-3xl font-bold">0</p>
                                            )
                                        }
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {watchlistCount === 0 ? t('dashboard.noVehiclesYet') : t('dashboard.tracked')}
                                        </p>
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        {starredCount > 0 ? (
                                            <p className='text-3xl font-bold'>
                                                {starredCount}
                                            </p>
                                        ) :
                                            <p className='text-3xl font-bold'>
                                                0
                                            </p>
                                        }
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {starredCount === 0 ? t('dashboard.noStarredYet') : t('dashboard.starred')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                </div>

                {/* Recent Activity Section */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                {t('dashboard.recentActivity')}
                            </CardTitle>
                            <CardDescription>{t('dashboard.latestAdditions')}</CardDescription>
                        </div>
                        {recentActivity.length > 0 && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/analytics">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    {t('dashboard.viewAllAnalytics')}
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length === 0 ? (
                            <div className="text-center py-6">
                                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground mb-3">{t('dashboard.noRecentActivity')}</p>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/search">{t('common.searchVehicles')}</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.licensePlate}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Car className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {activity.manufacturer} {activity.model}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('dashboard.addedToWatchlist')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-flex items-center px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-900">
                                                <span className="font-mono text-sm font-bold" dir="ltr">
                                                    {activity.licensePlate}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(activity.createdAt).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </main>
    );
}

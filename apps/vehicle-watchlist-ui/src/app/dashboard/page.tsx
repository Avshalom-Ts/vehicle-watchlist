'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/lib/auth-service';
import { WatchlistService } from '@/lib/watchlist-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [watchlistCount, setWatchlistCount] = useState(0);
    const [starredCount, setStarredCount] = useState(0);

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
            WatchlistService.getStarredCount()
        ]).then(([total, starred]) => {
            setWatchlistCount(total);
            setStarredCount(starred);
        }).catch(() => {
            setWatchlistCount(0);
            setStarredCount(0);
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
                        <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {user?.name}!</h1>
                        <p className="text-muted-foreground mt-1">Manage your vehicle watchlist</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* User Info Card */}
                    <Card className='col-span-2'>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Profile Information
                            </CardTitle>
                            <CardDescription>Your account details</CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-8">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                <p className="text-lg">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="text-lg">{user?.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className='col-span-2'>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button variant="outline" asChild>
                                <Link href="/search">Search Vehicles</Link>
                            </Button>
                            <Button variant="outline">View Analytics</Button>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <Link href="/watchlist">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    My Watchlist
                                </CardTitle>
                                <CardDescription>Vehicles you're tracking</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='flex flex-row items-center justify-between'>
                                    <div className='flex flex-col items-center'>
                                        <p className="text-3xl font-bold">{watchlistCount}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {watchlistCount === 0 ? 'No vehicles yet' : `Tracked`}
                                        </p>
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        {starredCount > 0 && (
                                            <p className='text-3xl font-bold'>
                                                {starredCount}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {starredCount === 0 ? 'No starred yet' : `Starred`}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                </div>

                {/* Watchlist Section TODO: Show graf about the user activities*/}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                    </CardContent>
                </Card>

            </div>
        </main>
    );
}

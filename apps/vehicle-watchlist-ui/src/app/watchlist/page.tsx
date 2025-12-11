'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WatchlistService, WatchlistItem } from '@/lib/watchlist-service';
import { AuthService } from '@/lib/auth-service';
import { toast } from 'sonner';
import { ArrowLeft, Car, Star, Trash2, Calendar, Fuel, Palette, User, SearchX, ArrowRight } from 'lucide-react';

export default function WatchlistPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            router.push('/login?redirect=/watchlist');
            return;
        }

        fetchWatchlist();
    }, [router]);

    const fetchWatchlist = async () => {
        setIsLoading(true);
        try {
            const result = await WatchlistService.getWatchlist();
            setWatchlist(result.data);
        } catch (error) {
            console.error('Failed to fetch watchlist:', error);
            toast.error('Failed to load watchlist');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStar = async (item: WatchlistItem) => {
        try {
            await WatchlistService.updateWatchlistItem(item.licensePlate, {
                isStarred: !item.isStarred,
            });
            setWatchlist(prev =>
                prev.map(w =>
                    w.licensePlate === item.licensePlate
                        ? { ...w, isStarred: !w.isStarred }
                        : w
                )
            );
            toast.success(item.isStarred ? 'Removed from starred' : 'Added to starred');
        } catch (error) {
            toast.error('Failed to update star status');
        }
    };

    const handleRemove = async (item: WatchlistItem) => {
        try {
            await WatchlistService.removeFromWatchlist(item.licensePlate);
            setWatchlist(prev => prev.filter(w => w.licensePlate !== item.licensePlate));
            toast.success('Vehicle removed from watchlist');
        } catch (error) {
            toast.error('Failed to remove vehicle');
        }
    };

    if (isLoading) {
        return (
            <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </main>
        );
    }

    return (
        <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container px-4 py-8 max-w-4xl mx-auto">
                {/* Back Button */}
                <div className="mb-6 flex justify-between items-center">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/search">
                            Search Vehicles
                            <ArrowRight className="w-4 h-4 mr-2" />
                        </Link>
                    </Button>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Car className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
                    <p className="text-muted-foreground">
                        {watchlist.length} vehicle{watchlist.length !== 1 ? 's' : ''} in your watchlist
                    </p>
                </div>

                {/* Empty State */}
                {watchlist.length === 0 && (
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 text-center">
                        <SearchX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Vehicles Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Start by searching for vehicles and adding them to your watchlist.
                        </p>
                        <Button asChild>
                            <Link href="/search">Search Vehicles</Link>
                        </Button>
                    </div>
                )}

                {/* Watchlist Items */}
                {watchlist.length > 0 && (
                    <div className="grid gap-4">
                        {watchlist.map((item) => (
                            <Card key={item.licensePlate} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Car className="w-5 h-5" />
                                                {item.commercialName || item.model}
                                            </CardTitle>
                                            <CardDescription className="text-base mt-1">
                                                {item.manufacturer}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-flex items-center px-1 py-1 rounded-md bg-yellow-300 text-black">
                                                <span className="font-extrabold tracking-wider text-lg border-4 border-black rounded-md p-3 py-1" dir="ltr">
                                                    {item.licensePlate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4 text-sm flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Year:</span>
                                            <span className="font-medium">{item.year}</span>
                                        </div>
                                        {item.color && (
                                            <div className="flex items-center gap-2">
                                                <Palette className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Color:</span>
                                                <span className="font-medium">{item.color}</span>
                                            </div>
                                        )}
                                        {item.fuelType && (
                                            <div className="flex items-center gap-2">
                                                <Fuel className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Fuel:</span>
                                                <span className="font-medium">{item.fuelType}</span>
                                            </div>
                                        )}
                                        {item.ownership && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Ownership:</span>
                                                <span className="font-medium">{item.ownership}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">
                                            Added {new Date(item.createdAt).toLocaleDateString('he-IL')}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleStar(item)}
                                                title={item.isStarred ? 'Remove star' : 'Star vehicle'}
                                            >
                                                <Star
                                                    className={`w-4 h-4 ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`}
                                                />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(item)}
                                                className="text-destructive hover:text-destructive"
                                                title="Remove from watchlist"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

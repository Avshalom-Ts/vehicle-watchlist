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
import { ArrowLeft, Car, Star, Trash2, Calendar, Fuel, Palette, User, SearchX, ArrowRight, FileText } from 'lucide-react';
import { VehicleNotesModal } from '@/components/vehicle-notes-modal';
import { useI18n } from '@/lib/i18n-provider';

export default function WatchlistPage() {
    const router = useRouter();
    const { t } = useI18n();
    const [isLoading, setIsLoading] = useState(true);
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);

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
            toast.error(t('watchlist.failedToLoad'));
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
            toast.success(item.isStarred ? t('watchlist.removedFromStarred') : t('watchlist.addedToStarred'));
        } catch {
            toast.error(t('watchlist.failedToUpdateStar'));
        }
    };

    const handleRemove = async (item: WatchlistItem) => {
        try {
            await WatchlistService.removeFromWatchlist(item.licensePlate);
            setWatchlist(prev => prev.filter(w => w.licensePlate !== item.licensePlate));
            toast.success(t('watchlist.vehicleRemoved'));
        } catch {
            toast.error(t('watchlist.failedToRemove'));
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
                            {t('watchlist.backToDashboard')}
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/search">
                            {t('watchlist.searchVehicles')}
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
                    <h1 className="text-3xl font-bold mb-2">{t('watchlist.myWatchlist')}</h1>
                    <p className="text-muted-foreground">
                        {watchlist.length} {watchlist.length === 1 ? t('watchlist.vehicle') : t('watchlist.vehicles')} {t('watchlist.vehiclesCount')}
                    </p>
                </div>

                {/* Empty State */}
                {watchlist.length === 0 && (
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 text-center">
                        <SearchX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{t('watchlist.noVehiclesYet')}</h3>
                        <p className="text-muted-foreground mb-4">
                            {t('watchlist.startBySearching')}
                        </p>
                        <Button asChild>
                            <Link href="/search">{t('watchlist.searchVehicles')}</Link>
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
                                            <span className="text-muted-foreground">{t('watchlist.year')}:</span>
                                            <span className="font-medium">{item.year}</span>
                                        </div>
                                        {item.color && (
                                            <div className="flex items-center gap-2">
                                                <Palette className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">{t('watchlist.color')}:</span>
                                                <span className="font-medium">{item.color}</span>
                                            </div>
                                        )}
                                        {item.fuelType && (
                                            <div className="flex items-center gap-2">
                                                <Fuel className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">{t('watchlist.fuel')}:</span>
                                                <span className="font-medium">{item.fuelType}</span>
                                            </div>
                                        )}
                                        {item.ownership && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">{t('watchlist.ownership')}:</span>
                                                <span className="font-medium">{item.ownership}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">
                                            {t('watchlist.added')} {new Date(item.createdAt).toLocaleDateString('he-IL')}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {((item as any)._id || item.id) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setNotesModalOpen(true);
                                                    }}
                                                    title={t('watchlist.viewNotes')}
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleStar(item)}
                                                title={item.isStarred ? t('watchlist.removeStar') : t('watchlist.starVehicle')}
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
                                                title={t('watchlist.removeFromWatchlistAction')}
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

                {/* Notes Modal */}
                {selectedItem && (
                    <VehicleNotesModal
                        open={notesModalOpen}
                        onOpenChange={setNotesModalOpen}
                        watchlistItemId={(selectedItem as any)._id || selectedItem.id}
                        vehicleName={`${selectedItem.manufacturer} ${selectedItem.commercialName || selectedItem.model} (${selectedItem.licensePlate})`}
                    />
                )}
            </div>
        </main>
    );
}

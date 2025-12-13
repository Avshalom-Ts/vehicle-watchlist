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
import { ArrowLeft, Car, Star, Trash2, Calendar, Fuel, Palette, User, SearchX, ArrowRight, FileText, Download } from 'lucide-react';
import { VehicleNotesModal } from '@/components/vehicle-notes-modal';
import { useI18n } from '@/lib/i18n-provider';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addHebrewFontSupport, fixHebrewText } from '@/lib/pdf-hebrew-font';

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

    const handleDownload = async () => {
        if (watchlist.length === 0) {
            toast.error(t('watchlist.noVehiclesToDownload'));
            return;
        }

        try {
            // Create new PDF document
            let doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                putOnlyUsedFonts: true
            });

            // Load and add Hebrew font support
            doc = await addHebrewFontSupport(doc);
            doc.setFont('LinBiolinum');

            // Add title (bilingual)
            doc.setFontSize(20);
            doc.text('Vehicle Watchlist', 105, 15, { align: 'center' });
            doc.setFontSize(16);
            doc.text(fixHebrewText('רשימת רכבים'), 105, 23, { align: 'center' });

            // Add date and count
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString('heb-IL')}`, 14, 32);
            doc.text(`Total Vehicles: ${watchlist.length}`, 14, 37);

            // Prepare table data - fix Hebrew text for RTL
            const tableData = watchlist.map(item => [
                item.licensePlate || '-',
                fixHebrewText(item.manufacturer || '-'),
                fixHebrewText(item.commercialName || item.model || '-'),
                item.year?.toString() || '-',
                fixHebrewText(item.color || '-'),
                fixHebrewText(item.fuelType || '-'),
                fixHebrewText(item.ownership || '-'),
                new Date(item.createdAt).toLocaleDateString('heb-IL')
            ]);

            // Generate table with Hebrew font support
            autoTable(doc, {
                startY: 43,
                head: [['License Plate', 'Manufacturer', 'Model', 'Year', 'Color', 'Fuel', 'Ownership', 'Added']],
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: [255, 255, 255], // White text
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center',
                    font: 'LinBiolinum'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 2.5,
                    font: 'LinBiolinum',
                    fontStyle: 'normal',
                    overflow: 'linebreak',
                    cellWidth: 'wrap',
                    textColor: [0, 0, 0] // Black text for all data rows
                },
                columnStyles: {
                    0: { cellWidth: 23, halign: 'center' },
                    1: { cellWidth: 28, halign: 'center' },
                    2: { cellWidth: 28, halign: 'center' },
                    3: { cellWidth: 13, halign: 'center' },
                    4: { cellWidth: 22, halign: 'center' },
                    5: { cellWidth: 22, halign: 'center' },
                    6: { cellWidth: 22, halign: 'center' },
                    7: { cellWidth: 24, halign: 'center' }
                },
                margin: { left: 14, right: 14 }
            });

            // Add footer with page numbers
            const pageCount = (doc as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
            doc.setFont('LinBiolinum');
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            // Download the PDF
            const filename = `watchlist-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);

            toast.success(t('watchlist.downloadSuccess'));
        } catch (error) {
            console.error('Failed to download watchlist:', error);
            toast.error(t('watchlist.downloadFailed'));
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

                    {/* Download Button */}
                    {watchlist.length > 0 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {t('watchlist.downloadPDF')}
                            </Button>
                        </div>
                    )}

                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/search">
                            {t('watchlist.searchVehicles')}
                            <ArrowRight className="w-4 h-4 mr-2" />
                        </Link>
                    </Button>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
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
                                            {((item as WatchlistItem & { _id?: string })._id || item.id) && (
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
                        watchlistItemId={(selectedItem as WatchlistItem & { _id?: string })._id || selectedItem.id}
                        vehicleName={`${selectedItem.manufacturer} ${selectedItem.commercialName || selectedItem.model} (${selectedItem.licensePlate})`}
                    />
                )}
            </div>
        </main>
    );
}

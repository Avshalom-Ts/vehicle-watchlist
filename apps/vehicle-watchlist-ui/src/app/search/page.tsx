'use client';

import React from 'react';

import { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchForm } from '@/components/search-form';
import { VehicleCard } from '@/components/vehicle-card';
import { VehicleDetailsModal } from '@/components/vehicle-details-modal';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import { VehicleService, Vehicle, VehicleFilters, PaginationInfo as PaginationData } from '@/lib/vehicle-service';
import { WatchlistService } from '@/lib/watchlist-service';
import { AuthService } from '@/lib/auth-service';
import { toast } from 'sonner';
import { ArrowLeft, AlertCircle, SearchX, Car } from 'lucide-react';

const DEFAULT_PAGE_SIZE = 25;

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialPlate = searchParams.get('plate') || '';
    const initialPage = parseInt(searchParams.get('page') || '1', 10);
    const pendingAction = searchParams.get('action') as 'save' | 'star' | null;
    const pendingPlate = searchParams.get('pendingPlate') || '';

    const [isLoading, setIsLoading] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [watchlistPlates, setWatchlistPlates] = useState<Set<string>>(new Set());
    const [starredPlates, setStarredPlates] = useState<Set<string>>(new Set());

    // Pagination state (for filter search)
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [totalResults, setTotalResults] = useState(0);
    const [currentSearchPlate, setCurrentSearchPlate] = useState(initialPlate);
    const [currentFilters, setCurrentFilters] = useState<VehicleFilters | null>(null);

    // Vehicle details modal state
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Scroll tracking for sticky search
    const [isSearchSticky, setIsSearchSticky] = useState(false);
    const searchFormRef = useRef<HTMLDivElement>(null);
    const searchFormPlaceholderRef = useRef<HTMLDivElement>(null);

    // Store pending action to execute after search completes
    const [pendingActionData, setPendingActionData] = useState<{ action: 'save' | 'star'; plate: string } | null>(null);

    const handleVehicleClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsDetailsModalOpen(true);
    };

    useEffect(() => {
        const isAuth = AuthService.isAuthenticated();
        setIsAuthenticated(isAuth);

        // Fetch user's watchlist to show correct button states
        if (isAuth) {
            WatchlistService.getWatchlist()
                .then(result => {
                    const plates = new Set(result.data.map(item => item.licensePlate));
                    const starred = new Set(result.data.filter(item => item.isStarred).map(item => item.licensePlate));
                    setWatchlistPlates(plates);
                    setStarredPlates(starred);
                })
                .catch(err => {
                    console.error('Failed to fetch watchlist:', err);
                });
        }

        // Handle pending action after login redirect
        if (isAuth && pendingAction && pendingPlate) {
            // Store the pending action - it will be executed after search completes
            setPendingActionData({ action: pendingAction, plate: pendingPlate });
            // Clean up URL params
            const newUrl = initialPlate ? `/search?plate=${encodeURIComponent(initialPlate)}` : '/search';
            router.replace(newUrl, { scroll: false });
        }
    }, [pendingAction, pendingPlate, initialPlate, router]);

    // Scroll handler for sticky search form
    useEffect(() => {
        const handleScroll = () => {
            if (searchFormRef.current) {
                const rect = searchFormRef.current.getBoundingClientRect();
                const headerOffset = 64; // Account for navbar height
                setIsSearchSticky(rect.top <= headerOffset);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Execute pending action when vehicles are loaded
    useEffect(() => {
        if (pendingActionData && vehicles.length > 0) {
            const vehicle = vehicles.find(v => v.licensePlate === pendingActionData.plate);
            if (vehicle) {
                if (pendingActionData.action === 'save') {
                    handleSaveToWatchlist(vehicle);
                } else if (pendingActionData.action === 'star') {
                    handleStarVehicle(vehicle);
                }
            }
            setPendingActionData(null);
        }
    }, [vehicles, pendingActionData]);

    // Track if this is the initial load
    const isInitialLoad = useRef(true);

    useEffect(() => {
        // Only run on initial load, not on URL changes from pagination
        if (isInitialLoad.current && initialPlate) {
            isInitialLoad.current = false;
            handleSearch(initialPlate);
        }
    }, []);

    const handleSearch = async (plate: string) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        setCurrentSearchPlate(plate);
        setCurrentFilters(null); // Clear filter state when doing plate search
        setPagination(null); // Plate search doesn't use pagination
        setCurrentPage(1);

        // Update URL with search params
        router.push(`/search?plate=${encodeURIComponent(plate)}`, { scroll: false });

        const result = await VehicleService.searchByPlate(plate);

        setIsLoading(false);

        if (!result.success) {
            setError(result.error || 'Failed to search vehicle');
            setVehicles([]);
            setTotalResults(0);
            return;
        }

        setVehicles(result.data);
        setTotalResults(result.total);
    };

    const handlePageChange = (page: number) => {
        console.log('handlePageChange called with page:', page, 'currentFilters:', currentFilters);
        if (currentFilters) {
            handleFilterSearch(currentFilters, page);
            // Scroll to top of results
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFilterSearch = async (filters: VehicleFilters, page: number = 1) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        setCurrentPage(page);
        setCurrentFilters(filters);
        setCurrentSearchPlate(''); // Clear plate search state when doing filter search

        const result = await VehicleService.searchWithFilters({ ...filters, page, limit: DEFAULT_PAGE_SIZE });

        setIsLoading(false);

        if (!result.success) {
            setError(result.error || 'Failed to search vehicles');
            setVehicles([]);
            setPagination(null);
            setTotalResults(0);
            return;
        }

        setVehicles(result.data);
        setPagination(result.pagination || null);
        setTotalResults(result.total);
    };

    const handleSaveToWatchlist = async (vehicle: Vehicle) => {
        if (!isAuthenticated) {
            const redirectUrl = `/search?plate=${encodeURIComponent(initialPlate || vehicle.licensePlate)}&pendingPlate=${encodeURIComponent(vehicle.licensePlate)}&action=save`;
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            return;
        }

        // Optimistic update
        setWatchlistPlates(prev => new Set([...prev, vehicle.licensePlate]));

        try {
            await WatchlistService.addToWatchlist({
                licensePlate: vehicle.licensePlate,
                manufacturer: vehicle.manufacturer,
                model: vehicle.model,
                commercialName: vehicle.commercialName,
                year: vehicle.year,
                color: vehicle.color,
                fuelType: vehicle.fuelType,
                ownership: vehicle.ownership,
                isStarred: false,
            });
            toast.success('Vehicle added to watchlist');
        } catch (error) {
            // Revert optimistic update on error
            setWatchlistPlates(prev => {
                const newSet = new Set(prev);
                newSet.delete(vehicle.licensePlate);
                return newSet;
            });
            toast.error(error instanceof Error ? error.message : 'Failed to add to watchlist');
        }
    };

    const handleStarVehicle = async (vehicle: Vehicle) => {
        if (!isAuthenticated) {
            const redirectUrl = `/search?plate=${encodeURIComponent(initialPlate || vehicle.licensePlate)}&pendingPlate=${encodeURIComponent(vehicle.licensePlate)}&action=star`;
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            return;
        }

        const isCurrentlyStarred = starredPlates.has(vehicle.licensePlate);
        const isInWatchlist = watchlistPlates.has(vehicle.licensePlate);

        // Optimistic update
        setStarredPlates(prev => {
            const newSet = new Set(prev);
            if (isCurrentlyStarred) {
                newSet.delete(vehicle.licensePlate);
            } else {
                newSet.add(vehicle.licensePlate);
            }
            return newSet;
        });

        try {
            if (isInWatchlist) {
                // Update existing watchlist item
                await WatchlistService.updateWatchlistItem(vehicle.licensePlate, {
                    isStarred: !isCurrentlyStarred,
                });
            } else {
                // Add to watchlist with starred
                await WatchlistService.addToWatchlist({
                    licensePlate: vehicle.licensePlate,
                    manufacturer: vehicle.manufacturer,
                    model: vehicle.model,
                    commercialName: vehicle.commercialName,
                    year: vehicle.year,
                    color: vehicle.color,
                    fuelType: vehicle.fuelType,
                    ownership: vehicle.ownership,
                    isStarred: true,
                });
                setWatchlistPlates(prev => new Set([...prev, vehicle.licensePlate]));
            }
            toast.success(isCurrentlyStarred ? 'Removed from starred' : 'Added to starred');
        } catch (error) {
            // Revert optimistic update on error
            setStarredPlates(prev => {
                const newSet = new Set(prev);
                if (isCurrentlyStarred) {
                    newSet.add(vehicle.licensePlate);
                } else {
                    newSet.delete(vehicle.licensePlate);
                }
                return newSet;
            });
            toast.error(error instanceof Error ? error.message : 'Failed to update star status');
        }
    };

    return (
        <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container px-4 py-8 max-w-4xl mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
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
                    <h1 className="text-3xl font-bold mb-2">Vehicle Search</h1>
                    <p className="text-muted-foreground">
                        Search by license plate or use filters to find vehicles
                    </p>
                </div>

                {/* Search Form */}
                <div ref={searchFormRef}>
                    {/* Placeholder to maintain layout when form becomes fixed */}
                    {isSearchSticky && (
                        <div
                            ref={searchFormPlaceholderRef}
                            className="h-[200px]" // Approximate height of search form
                            aria-hidden="true"
                        />
                    )}
                    <div
                        className={`
                            bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8
                            transition-all duration-300 ease-in-out
                            ${isSearchSticky
                                ? 'fixed top-0 left-0 right-0 z-40 mx-auto max-w-4xl rounded-t-none shadow-xl border-b border-border/50'
                                : ''
                            }
                        `}
                    >
                        <SearchForm
                            initialPlate={initialPlate}
                            onSearch={handleSearch}
                            onFilterSearch={handleFilterSearch}
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center gap-2 text-muted-foreground">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Searching...
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {!isLoading && error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-destructive mb-2">
                                Search Error
                            </h3>
                            <p className="text-muted-foreground">{error}</p>
                        </div>
                    )}

                    {/* No Results State */}
                    {!isLoading && !error && hasSearched && vehicles.length === 0 && (
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 text-center">
                            <SearchX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Vehicle Found</h3>
                            <p className="text-muted-foreground">
                                No vehicle was found with this license plate number.
                                <br />
                                Please check the number and try again.
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {!isLoading && !error && vehicles.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Search Results
                                    </h2>
                                    {pagination && (
                                        <PaginationInfo
                                            currentPage={currentPage}
                                            totalPages={pagination.totalPages}
                                            totalItems={totalResults}
                                            itemsPerPage={DEFAULT_PAGE_SIZE}
                                            className="mt-1"
                                        />
                                    )}
                                </div>
                                {!isAuthenticated && (
                                    <p className="text-sm text-muted-foreground">
                                        <Link href="/login" className="text-primary hover:underline">
                                            Sign in
                                        </Link>{' '}
                                        to save vehicles to your watchlist
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-4">
                                {vehicles.map((vehicle) => (
                                    <VehicleCard
                                        key={vehicle.id}
                                        vehicle={vehicle}
                                        onSave={handleSaveToWatchlist}
                                        onStar={handleStarVehicle}
                                        onClick={handleVehicleClick}
                                        showActions={true}
                                        isInWatchlist={watchlistPlates.has(vehicle.licensePlate)}
                                        isStarred={starredPlates.has(vehicle.licensePlate)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="pt-6 border-t">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={pagination.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Vehicle Details Modal */}
            <VehicleDetailsModal
                vehicle={selectedVehicle}
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
            />
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <main className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </main>
        }>
            <SearchContent />
        </Suspense>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthService } from '@/lib/auth-service';
import { AnalyticsService, AnalyticsData } from '@/lib/analytics-service';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Car,
    Star,
    Calendar,
    Fuel,
    Palette,
    TrendingUp,
    BarChart3,
    PieChartIcon,
    Clock,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// Chart colors
const COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#6366f1', // indigo
];

export default function AnalyticsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            router.push('/login?redirect=/analytics');
            return;
        }

        fetchAnalytics();
    }, [router]);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        setError(null);

        const result = await AnalyticsService.getAnalytics();

        if (!result.success) {
            setError(result.error || 'Failed to load analytics');
            toast.error('Failed to load analytics');
        } else {
            setAnalytics(result.data);
        }

        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </main>
        );
    }

    if (error || !analytics) {
        return (
            <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container px-4 py-8 max-w-6xl mx-auto">
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 text-center">
                        <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            {error || 'No Analytics Available'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Add some vehicles to your watchlist to see analytics.
                        </p>
                        <Button asChild>
                            <Link href="/search">Search Vehicles</Link>
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    // Prepare chart data
    const manufacturerData = analytics.byManufacturer.map((item) => ({
        name: item._id,
        value: item.count,
    }));

    const yearData = analytics.byYear.map((item) => ({
        year: item._id.toString(),
        count: item.count,
    }));

    const fuelTypeData = analytics.byFuelType.map((item) => ({
        name: item._id,
        value: item.count,
    }));

    const colorData = analytics.byColor.slice(0, 6).map((item) => ({
        name: item._id,
        value: item.count,
    }));

    return (
        <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container px-4 py-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/watchlist">
                            <Car className="w-4 h-4 mr-2" />
                            View Watchlist
                        </Link>
                    </Button>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <TrendingUp className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Watchlist Analytics</h1>
                    <p className="text-muted-foreground">
                        Insights about your tracked vehicles
                    </p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{analytics.totalVehicles}</p>
                                    <p className="text-sm text-muted-foreground">Total Vehicles</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{analytics.starredCount}</p>
                                    <p className="text-sm text-muted-foreground">Starred</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{analytics.averageYear}</p>
                                    <p className="text-sm text-muted-foreground">Avg. Year</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{analytics.byManufacturer.length}</p>
                                    <p className="text-sm text-muted-foreground">Manufacturers</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Manufacturer Pie Chart */}
                    {manufacturerData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="w-5 h-5" />
                                    By Manufacturer
                                </CardTitle>
                                <CardDescription>Distribution of vehicles by manufacturer</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height={300} minWidth={200}>
                                        <PieChart>
                                            <Pie
                                                data={manufacturerData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) =>
                                                    `${name} (${(percent ? (percent * 100).toFixed(0) : 0)}%)`
                                                }
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {manufacturerData.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Year Bar Chart */}
                    {yearData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    By Year
                                </CardTitle>
                                <CardDescription>Vehicles by manufacturing year</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height={300} minWidth={200}>
                                        <BarChart data={yearData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Fuel Type Pie Chart */}
                    {fuelTypeData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Fuel className="w-5 h-5" />
                                    By Fuel Type
                                </CardTitle>
                                <CardDescription>Distribution by fuel type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height={300} minWidth={200}>
                                        <PieChart>
                                            <Pie
                                                data={fuelTypeData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) =>
                                                    `${name} (${(percent ? (percent * 100).toFixed(0) : 0)}%)`
                                                }
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {fuelTypeData.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Color Distribution */}
                    {colorData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-5 h-5" />
                                    By Color
                                </CardTitle>
                                <CardDescription>Top colors in your watchlist</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height={300} minWidth={200}>
                                        <BarChart data={colorData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" allowDecimals={false} />
                                            <YAxis dataKey="name" type="category" width={80} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Vehicle Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Oldest Vehicle */}
                    {analytics.oldestVehicle && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Oldest Vehicle
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{analytics.oldestVehicle.year}</p>
                                <p className="text-muted-foreground">
                                    {analytics.oldestVehicle.manufacturer} {analytics.oldestVehicle.model}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Newest Vehicle */}
                    {analytics.newestVehicle && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Newest Vehicle
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{analytics.newestVehicle.year}</p>
                                <p className="text-muted-foreground">
                                    {analytics.newestVehicle.manufacturer} {analytics.newestVehicle.model}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Year Range */}
                    {analytics.oldestVehicle && analytics.newestVehicle && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Year Range
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {analytics.newestVehicle.year - analytics.oldestVehicle.year} years
                                </p>
                                <p className="text-muted-foreground">
                                    {analytics.oldestVehicle.year} - {analytics.newestVehicle.year}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Recently Added */}
                {analytics.recentlyAdded.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Recently Added
                            </CardTitle>
                            <CardDescription>Last 5 vehicles added to your watchlist</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analytics.recentlyAdded.map((vehicle) => (
                                    <div
                                        key={vehicle.licensePlate}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Car className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">
                                                    {vehicle.manufacturer} {vehicle.model}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {vehicle.licensePlate}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(vehicle.createdAt).toLocaleDateString('he-IL')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}
